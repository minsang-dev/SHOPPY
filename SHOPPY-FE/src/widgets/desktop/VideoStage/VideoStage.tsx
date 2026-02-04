import React, { useEffect, useMemo, useRef } from 'react';
import { useOpenViduSession } from '@/features/video-chat/model/useOpenViduSession';
import { useMediaControlStore } from '@/features/video-chat/model/useMediaControlStore';
import { useRemoteMediaControlStore } from '@/features/video-chat/model/useRemoteMediaControlStore';
import type { StreamManager } from 'openvidu-browser';
import './VideoStage.css';
const DEBUG_STAGE = true;

const stageDebug = (...args: unknown[]) => {
  if (!DEBUG_STAGE) return;
  console.log('[VIDEO STAGE DEBUG]', ...args);
};

type VideoStageProps = {
  roomId?: string;
};

const parseNickname = (streamManager?: StreamManager) => {
  const raw = streamManager?.stream?.connection?.data;
  if (!raw) {
    return 'Guest';
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.clientData) {
      const client = typeof parsed.clientData === 'string' ? JSON.parse(parsed.clientData) : parsed.clientData;
      return client?.nickname || 'Guest';
    }
    return parsed?.nickname || 'Guest';
  } catch {
    const match = raw.match(/"nickname"\s*:\s*"([^"]+)"/);
    return match?.[1] ?? 'Guest';
  }
};

const parseMemberId = (streamManager?: StreamManager): number | null => {
  const raw = streamManager?.stream?.connection?.data;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const client = parsed?.clientData
      ? (typeof parsed.clientData === 'string' ? JSON.parse(parsed.clientData) : parsed.clientData)
      : parsed;
    const memberId = Number(client?.memberId);
    return Number.isFinite(memberId) ? memberId : null;
  } catch {
    return null;
  }
};

const isStreamVideoActive = (streamManager?: StreamManager) => {
  const stream = streamManager?.stream as { hasVideo?: () => boolean; videoActive?: boolean } | undefined;
  if (!stream) {
    return true;
  }
  if (typeof stream.hasVideo === 'function') {
    return stream.hasVideo();
  }
  if (typeof stream.videoActive === 'boolean') {
    return stream.videoActive;
  }
  return true;
};

const VideoTile = ({
  streamManager,
  label,
  muted = false,
  showBlackWhenOff = true,
  forceHidden = false,
}: {
  streamManager?: StreamManager;
  label: string;
  muted?: boolean;
  showBlackWhenOff?: boolean;
  forceHidden?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasVideo = isStreamVideoActive(streamManager);

  useEffect(() => {
    if (videoRef.current && streamManager) {
      streamManager.addVideoElement(videoRef.current);
    }
  }, [streamManager]);

  return (
    <div className="video-tile">
      <video ref={videoRef} autoPlay playsInline muted={muted || forceHidden} />
      {showBlackWhenOff && (!hasVideo || forceHidden) && <div className="video-off">Camera Off</div>}
      <div className="video-tile-label">{label}</div>
    </div>
  );
};

const LocalVideoTile = ({
  videoRef,
  label,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  label: string;
}) => (
  <div className="video-tile">
    <video ref={videoRef} autoPlay playsInline muted />
    <div className="video-tile-label">{label}</div>
  </div>
);

const VideoStage: React.FC<VideoStageProps> = ({ roomId }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const currentMemberId = useMemo(() => {
    const raw = sessionStorage.getItem('memberId');
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, []);
  const currentNickname = useMemo(
    () => (sessionStorage.getItem('memberNickname') ?? '').trim(),
    [],
  );

  const {
    subscribers,
    setPublishAudio,
    setPublishVideo,
  } = useOpenViduSession({
    enabled: Boolean(roomId),
    roomId,
    profile: {},
    localVideoRef,
  });

  const micOn = useMediaControlStore((state) => state.micOn);
  const camOn = useMediaControlStore((state) => state.camOn);
  const mutedByNickname = useRemoteMediaControlStore((state) => state.mutedByNickname);
  const hiddenByNickname = useRemoteMediaControlStore((state) => state.hiddenByNickname);

  useEffect(() => {
    setPublishAudio(micOn);
  }, [micOn, setPublishAudio]);

  useEffect(() => {
    setPublishVideo(camOn);
  }, [camOn, setPublishVideo]);

  const cameraSubscribers = useMemo(
    () => {
      const remoteOnly = subscribers
        .filter((sub) => sub?.stream?.typeOfVideo !== 'SCREEN')
        .filter((sub) => {
          if (!currentMemberId) return true;
          const memberId = parseMemberId(sub);
          // Prevent duplicated self tile after refresh/reconnect races.
          return memberId == null || memberId !== currentMemberId;
        })
        .filter((sub) => {
          if (!currentNickname) return true;
          const nickname = parseNickname(sub).trim();
          // Fallback self-filter when memberId is missing from connection data.
          return nickname !== '' && nickname !== currentNickname;
        });

      const deduped = new Map<string, StreamManager>();

      remoteOnly.forEach((sub) => {
        const memberId = parseMemberId(sub);
        const nickname = parseNickname(sub);
        const connectionId = sub?.stream?.connection?.connectionId ?? '';
        const key =
          memberId != null
            ? `member:${memberId}`
            : nickname && nickname !== 'Guest'
              ? `nick:${nickname}`
              : `conn:${connectionId}`;

        const existing = deduped.get(key);
        if (!existing) {
          deduped.set(key, sub);
          return;
        }

        const existingHasVideo = isStreamVideoActive(existing);
        const nextHasVideo = isStreamVideoActive(sub);

        // Prefer the stream that still has an active video track.
        if (!existingHasVideo && nextHasVideo) {
          deduped.set(key, sub);
        }
      });

      return [...deduped.values()].filter((sub) => {
        const nickname = parseNickname(sub);
        const hasVideo = isStreamVideoActive(sub);
        if (nickname === 'Guest') {
          return false;
        }
        // Hide stale "Guest + black tile" that appears during reconnect races.
        if (nickname === 'Guest' && !hasVideo) {
          return false;
        }
        return true;
      });
    },
    [currentMemberId, currentNickname, subscribers],
  );

  useEffect(() => {
    stageDebug('raw subscribers', subscribers.map((sub) => ({
      streamId: sub?.stream?.streamId,
      connectionId: sub?.stream?.connection?.connectionId,
      nickname: parseNickname(sub),
      memberId: parseMemberId(sub),
      hasVideo: isStreamVideoActive(sub),
    })));
    stageDebug('render subscribers', cameraSubscribers.map((sub) => ({
      streamId: sub?.stream?.streamId,
      connectionId: sub?.stream?.connection?.connectionId,
      nickname: parseNickname(sub),
      memberId: parseMemberId(sub),
      hasVideo: isStreamVideoActive(sub),
    })));
  }, [cameraSubscribers, subscribers]);

  useEffect(() => {
    cameraSubscribers.forEach((sub) => {
      const mediaStream =
        typeof sub?.stream?.getMediaStream === 'function'
          ? sub.stream.getMediaStream()
          : undefined;
      if (!mediaStream) {
        return;
      }
      const nickname = parseNickname(sub);
      const muted = Boolean(mutedByNickname[nickname]);
      const hidden = Boolean(hiddenByNickname[nickname]);
      const subscriber = sub as unknown as {
        subscribeToAudio?: (value: boolean) => void;
        subscribeToVideo?: (value: boolean) => void;
      };
      subscriber.subscribeToAudio?.(!muted);
      subscriber.subscribeToVideo?.(!hidden);
    });
  }, [cameraSubscribers, hiddenByNickname, mutedByNickname]);

  return (
    <section className="video-stage">
      <div className="video-strip">
        <LocalVideoTile videoRef={localVideoRef} label="Me" />
        {cameraSubscribers
          .filter((sub) => !(parseNickname(sub) === 'Guest' && !isStreamVideoActive(sub)))
          .map((sub) => (
            <VideoTile
              key={sub.stream?.streamId}
              streamManager={sub}
              label={parseNickname(sub)}
              showBlackWhenOff
              forceHidden={Boolean(hiddenByNickname[parseNickname(sub)])}
            />
          ))}
        {cameraSubscribers.length === 0 && (
          <div className="video-strip-empty">참여자가 들어오면 여기에 표시돼요.</div>
        )}
      </div>

      <div className="video-controls" />
    </section>
  );
};

export default VideoStage;
