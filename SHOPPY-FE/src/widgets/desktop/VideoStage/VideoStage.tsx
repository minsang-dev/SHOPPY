import React, { useEffect, useMemo, useRef } from 'react';
import { useOpenViduSession } from '@/features/video-chat/model/useOpenViduSession';
import { useMediaControlStore } from '@/features/video-chat/model/useMediaControlStore';
import { useRoomInfo } from '@/features/room/fetch-room/model/useRoomInfo';
import { useAuthStore } from '@/entities/user';
import type { VideoChatMode } from '@/entities/room/types/desktopVideoChat.types';
import type { StreamManager } from 'openvidu-browser';
import './VideoStage.css';

type VideoStageProps = {
  roomId?: string;
  mode: VideoChatMode;
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
}: {
  streamManager?: StreamManager;
  label: string;
  muted?: boolean;
  showBlackWhenOff?: boolean;
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
      <video ref={videoRef} autoPlay playsInline muted={muted} />
      {showBlackWhenOff && !hasVideo && <div className="video-off">Camera Off</div>}
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

const VideoStage: React.FC<VideoStageProps> = ({ roomId, mode }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const { room } = useRoomInfo(roomId);
  const user = useAuthStore((state) => state.user);
  const isHost = Boolean(room && user && room.hostId === user.id);

  const {
    subscribers,
    setPublishAudio,
    setPublishVideo,
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
  } = useOpenViduSession({
    enabled: Boolean(roomId),
    roomId,
    profile: { nickname: user?.nickname ?? '' },
    localVideoRef,
    screenShareRef,
    autoStartScreenShare: isHost && mode === 'host',
    screenShareAudio: true,
  });

  const micOn = useMediaControlStore((state) => state.micOn);
  const camOn = useMediaControlStore((state) => state.camOn);

  useEffect(() => {
    setPublishAudio(micOn);
  }, [micOn, setPublishAudio]);

  useEffect(() => {
    setPublishVideo(camOn);
  }, [camOn, setPublishVideo]);

  useEffect(() => {
    if (!isHost || mode !== 'host') {
      stopScreenShare();
    }
  }, [isHost, mode, stopScreenShare]);

  const cameraSubscribers = useMemo(
    () => subscribers.filter((sub) => sub?.stream?.typeOfVideo !== 'SCREEN'),
    [subscribers],
  );

  const handleScreenShareToggle = () => {
    if (!isHost) {
      return;
    }
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      void startScreenShare();
    }
  };

  return (
    <section className="video-stage">
      <div className="video-strip">
        <LocalVideoTile videoRef={localVideoRef} label="Me" />
        {cameraSubscribers.map((sub) => (
          <VideoTile
            key={sub.stream?.streamId}
            streamManager={sub}
            label={parseNickname(sub)}
            showBlackWhenOff
          />
        ))}
        {cameraSubscribers.length === 0 && (
          <div className="video-strip-empty">참여자가 들어오면 여기에 표시돼요.</div>
        )}
      </div>

      <div className="video-controls">
        {isHost && mode === 'host' && (
          <button className="control-button" onClick={handleScreenShareToggle}>
            {isScreenSharing ? '화면공유 종료' : '화면공유 시작'}
          </button>
        )}
      </div>
    </section>
  );
};

export default VideoStage;
