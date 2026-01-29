import { useCallback, useEffect, useRef, useState } from 'react';
import { OpenVidu, Publisher, Session, StreamManager } from 'openvidu-browser';
import { joinWebrtcSession } from '../../../entities/room/api/webrtc';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

interface OpenViduProfile {
  nickname?: string;
  profileColor?: string;
}

interface UseOpenViduSessionOptions {
  roomId?: string;
  accessToken?: string;
  role?: 'PUBLISHER' | 'SUBSCRIBER';
  profile?: OpenViduProfile;
  enabled?: boolean;
  localVideoRef?: React.RefObject<HTMLVideoElement | null>;
  videoFacingMode?: 'user' | 'environment';
}

export interface OpenViduSessionState {
  isConnected: boolean;
  subscribers: StreamManager[];
  connect: () => Promise<void>;
  disconnect: () => void;
  setPublishAudio: (enabled: boolean) => void;
  setPublishVideo: (enabled: boolean) => void;
}

export const useOpenViduSession = ({
  roomId,
  accessToken,
  role = 'PUBLISHER',
  profile,
  enabled = false,
  localVideoRef,
  videoFacingMode,
}: UseOpenViduSessionOptions): OpenViduSessionState => {
  const ovRef = useRef<OpenVidu | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const publisherRef = useRef<Publisher | null>(null);
  const [subscribers, setSubscribers] = useState<StreamManager[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async () => {
    const authToken = accessToken ?? localStorage.getItem('accessToken');
    if (!roomId || !authToken || isConnected) {
      return;
    }

    const data = JSON.stringify({
      nickname: profile?.nickname ?? '',
      profileColor: profile?.profileColor ?? '',
    });

    const sessionInfo = await joinWebrtcSession(
      roomId,
      {
        role,
        data,
      },
      accessToken,
    );

    // Mock 모드: 실제 OpenVidu 연결 없이 연결 상태만 설정
    if (USE_MOCK) {
      console.log('[Mock] OpenVidu session connected:', sessionInfo);
      setIsConnected(true);
      return;
    }

    const ov = new OpenVidu();
    if (sessionInfo.iceServers?.length) {
      ov.setAdvancedConfiguration({ iceServers: sessionInfo.iceServers });
    }

    const session = ov.initSession();
    session.on('streamCreated', (event) => {
      const subscriber = session.subscribe(event.stream, undefined);
      setSubscribers((prev) => [...prev, subscriber]);
    });
    session.on('streamDestroyed', (event) => {
      setSubscribers((prev) => prev.filter((sub) => sub !== event.stream.streamManager));
    });

    await session.connect(sessionInfo.token, {
      clientData: data,
    });

    if (role === 'PUBLISHER') {
      let publisher: Publisher | null = null;
      if (videoFacingMode && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: videoFacingMode } },
            audio: true,
          });
          const [videoTrack] = stream.getVideoTracks();
          const [audioTrack] = stream.getAudioTracks();
          publisher = await ov.initPublisherAsync(undefined, {
            publishAudio: true,
            publishVideo: true,
            resolution: '640x360',
            frameRate: 30,
            mirror: videoFacingMode === 'user',
            videoSource: videoTrack ?? undefined,
            audioSource: audioTrack ?? undefined,
          });
        } catch (error) {
          console.warn('[OpenVidu] Failed to get preferred camera, falling back.', error);
        }
      }
      if (!publisher) {
        publisher = await ov.initPublisherAsync(undefined, {
          publishAudio: true,
          publishVideo: true,
          resolution: '640x360',
          frameRate: 30,
          mirror: false,
        });
      }
      session.publish(publisher);
      publisherRef.current = publisher;
      if (localVideoRef?.current) {
        publisher.addVideoElement(localVideoRef.current);
      }
    }

    ovRef.current = ov;
    sessionRef.current = session;
    setIsConnected(true);
  }, [accessToken, isConnected, localVideoRef, profile, role, roomId, videoFacingMode]);

  const disconnect = useCallback(() => {
    sessionRef.current?.disconnect();
    sessionRef.current = null;
    ovRef.current = null;
    publisherRef.current = null;
    setSubscribers([]);
    setIsConnected(false);
  }, []);

  const setPublishAudio = useCallback((enabledAudio: boolean) => {
    publisherRef.current?.publishAudio(enabledAudio);
  }, []);

  const setPublishVideo = useCallback((enabledVideo: boolean) => {
    publisherRef.current?.publishVideo(enabledVideo);
  }, []);

  useEffect(() => {
    const authToken = accessToken ?? localStorage.getItem('accessToken');
    if (!enabled || !roomId || !authToken) {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) {
        void connect();
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      disconnect();
    };
  }, [accessToken, connect, disconnect, enabled, roomId]);

  return {
    isConnected,
    subscribers,
    connect,
    disconnect,
    setPublishAudio,
    setPublishVideo,
  };
};
