import { useCallback, useEffect, useRef, useState } from 'react';
import { OpenVidu, Publisher, Session, StreamManager } from 'openvidu-browser';
import { joinWebrtcSession } from '../../../entities/room/api/webrtc';
import { useSessionStore } from '@/entities/session/model/useSessionStore';

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
  screenShareRef?: React.RefObject<HTMLVideoElement | null>;
  autoStartScreenShare?: boolean;
  screenShareAudio?: boolean;
}

export interface OpenViduSessionState {
  isConnected: boolean;
  subscribers: StreamManager[];
  connect: () => Promise<void>;
  disconnect: () => void;
  setPublishAudio: (enabled: boolean) => void;
  setPublishVideo: (enabled: boolean) => void;
  switchCamera: (mode: 'user' | 'environment') => Promise<void>;
  isScreenSharing: boolean;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
}

export const useOpenViduSession = ({
  roomId,
  accessToken,
  role = 'PUBLISHER',
  profile,
  enabled = false,
  localVideoRef,
  videoFacingMode,
  screenShareRef,
  autoStartScreenShare = false,
  screenShareAudio = false,
}: UseOpenViduSessionOptions): OpenViduSessionState => {
  const ovRef = useRef<OpenVidu | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const publisherRef = useRef<Publisher | null>(null);
  const screenPublisherRef = useRef<Publisher | null>(null);
  const publishAudioRef = useRef(true);
  const publishVideoRef = useRef(true);
  const switchInFlightRef = useRef(false);
  const [subscribers, setSubscribers] = useState<StreamManager[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const isConnectedRef = useRef(false);
  const connectInFlightRef = useRef(false);
  const connectFailedRef = useRef(false);
  const lastRoomIdRef = useRef<string | number | undefined>(undefined);
  const hasRequestedRef = useRef(false);

  const setConnected = useCallback((value: boolean) => {
    isConnectedRef.current = value;
    setIsConnected(value);
  }, []);

  const createPublisher = useCallback(
    async (ov: OpenVidu, mode?: 'user' | 'environment') => {
      let publisher: Publisher | null = null;
      if (mode && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: mode } },
            audio: publishAudioRef.current,
          });
          const [videoTrack] = stream.getVideoTracks();
          const [audioTrack] = stream.getAudioTracks();
          publisher = await ov.initPublisherAsync(undefined, {
            publishAudio: publishAudioRef.current,
            publishVideo: publishVideoRef.current,
            resolution: '640x360',
            frameRate: 30,
            mirror: mode === 'user',
            videoSource: videoTrack ?? undefined,
            audioSource: audioTrack ?? undefined,
          });
        } catch (error) {
          console.warn('[OpenVidu] Failed to get preferred camera, falling back.', error);
        }
      }
      if (!publisher) {
        publisher = await ov.initPublisherAsync(undefined, {
          publishAudio: publishAudioRef.current,
          publishVideo: publishVideoRef.current,
          resolution: '640x360',
          frameRate: 30,
          mirror: mode === 'user',
        });
      }
      return publisher;
    },
    [],
  );

  const getPreferredVideoTrack = useCallback(async (mode: 'user' | 'environment') => {
    if (!navigator.mediaDevices?.getUserMedia) {
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode } },
        audio: false,
      });
      const [track] = stream.getVideoTracks();
      if (!track) {
        stream.getTracks().forEach((item) => item.stop());
        return null;
      }
      return track;
    } catch (error) {
      console.warn('[OpenVidu] Failed to get preferred camera track.', error);
      return null;
    }
  }, []);

  const connect = useCallback(async () => {
    const authToken = accessToken ?? sessionStorage.getItem('accessToken');
    if (!roomId || !authToken || isConnectedRef.current || connectInFlightRef.current || connectFailedRef.current) {
      return;
    }
    connectInFlightRef.current = true;

    try {
      const data = JSON.stringify({
        nickname: profile?.nickname ?? '',
        profileColor: profile?.profileColor ?? '',
      });

      const { roomId: storedRoomId, session: storedSession } = useSessionStore.getState();
      const sessionInfo =
        storedSession && storedRoomId === Number(roomId)
          ? storedSession
          : await joinWebrtcSession(
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
      const iceServers = sessionInfo.iceServers.map((server) => ({
        urls: server.urls,
        username: server.username ?? undefined,
        credential: server.credential ?? undefined,
      }));
      ov.setAdvancedConfiguration({ iceServers });
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
        const publisher = await createPublisher(ov, videoFacingMode);
        session.publish(publisher);
        publisherRef.current = publisher;
        if (localVideoRef?.current) {
          publisher.addVideoElement(localVideoRef.current);
        }
      }

      ovRef.current = ov;
      sessionRef.current = session;
      setConnected(true);
      connectFailedRef.current = false;
    } catch (error) {
      console.error('[OpenVidu] connect failed:', error);
      connectFailedRef.current = true;
    } finally {
      connectInFlightRef.current = false;
    }
  }, [accessToken, createPublisher, localVideoRef, profile, role, roomId, setConnected, videoFacingMode]);

  const switchCamera = useCallback(
    async (mode: 'user' | 'environment') => {
      const ov = ovRef.current;
      const session = sessionRef.current;
      const publisher = publisherRef.current;
      if (!ov || !session || !publisher || !isConnectedRef.current || role !== 'PUBLISHER') {
        return;
      }
      if (switchInFlightRef.current) {
        return;
      }
      switchInFlightRef.current = true;
      try {
        const nextTrack = await getPreferredVideoTrack(mode);
        if (!nextTrack) {
          return;
        }
        const oldStream = publisher.stream?.getMediaStream?.();
        const oldTrack = oldStream?.getVideoTracks?.()[0];
        const canReplace = typeof (publisher as { replaceTrack?: (track: MediaStreamTrack) => Promise<void> })
          .replaceTrack === 'function';
        if (canReplace) {
          await (publisher as { replaceTrack: (track: MediaStreamTrack) => Promise<void> }).replaceTrack(
            nextTrack,
          );
          if (oldTrack) {
            oldTrack.stop();
          }
          return;
        }
        const nextPublisher = await createPublisher(ov, mode);
        try {
          session.unpublish(publisher);
        } catch (error) {
          console.warn('[OpenVidu] Failed to unpublish current media before switching.', error);
          return;
        }
        if (oldStream) {
          oldStream.getTracks().forEach((track) => track.stop());
        }
        session.publish(nextPublisher);
        publisherRef.current = nextPublisher;
        if (localVideoRef?.current) {
          nextPublisher.addVideoElement(localVideoRef.current);
        }
      } catch (error) {
        console.error('[OpenVidu] Failed to switch camera:', error);
      } finally {
        switchInFlightRef.current = false;
      }
    },
    [createPublisher, getPreferredVideoTrack, localVideoRef, role],
  );

  const stopScreenShare = useCallback(() => {
    const session = sessionRef.current;
    if (session && screenPublisherRef.current) {
      session.unpublish(screenPublisherRef.current);
    }
    screenPublisherRef.current = null;
    setIsScreenSharing(false);
  }, []);

  const startScreenShare = useCallback(async () => {
    const ov = ovRef.current;
    const session = sessionRef.current;
    if (!ov || !session || isScreenSharing || !navigator.mediaDevices?.getDisplayMedia) {
      return;
    }

    const mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: screenShareAudio,
    });

    const [videoTrack] = mediaStream.getVideoTracks();
    const [audioTrack] = mediaStream.getAudioTracks();

    const publisher = await ov.initPublisherAsync(undefined, {
      publishAudio: Boolean(audioTrack),
      publishVideo: true,
      resolution: '1280x720',
      frameRate: 30,
      mirror: false,
      videoSource: videoTrack ?? undefined,
      audioSource: audioTrack ?? undefined,
    });

    session.publish(publisher);
    screenPublisherRef.current = publisher;
    setIsScreenSharing(true);

    if (screenShareRef?.current) {
      publisher.addVideoElement(screenShareRef.current);
    }

    if (videoTrack) {
      videoTrack.onended = () => {
        stopScreenShare();
      };
    }
  }, [isScreenSharing, screenShareAudio, screenShareRef, stopScreenShare]);

  const disconnect = useCallback(() => {
    sessionRef.current?.disconnect();
    sessionRef.current = null;
    ovRef.current = null;
    publisherRef.current = null;
    screenPublisherRef.current = null;
    setSubscribers([]);
    setConnected(false);
    setIsScreenSharing(false);
  }, [setConnected]);

  const setPublishAudio = useCallback((enabledAudio: boolean) => {
    publishAudioRef.current = enabledAudio;
    publisherRef.current?.publishAudio(enabledAudio);
  }, []);

  const setPublishVideo = useCallback((enabledVideo: boolean) => {
    publishVideoRef.current = enabledVideo;
    publisherRef.current?.publishVideo(enabledVideo);
  }, []);

  useEffect(() => {
    const authToken = accessToken ?? sessionStorage.getItem('accessToken');
    if (!enabled || !roomId || !authToken) {
      return;
    }
    if (lastRoomIdRef.current !== roomId) {
      lastRoomIdRef.current = roomId;
      connectFailedRef.current = false;
      connectInFlightRef.current = false;
      hasRequestedRef.current = false;
    }
    if (!hasRequestedRef.current) {
      hasRequestedRef.current = true;
      void connect();
    }
  }, [accessToken, connect, enabled, roomId]);

  useEffect(() => () => disconnect(), [disconnect]);

  useEffect(() => {
    if (!autoStartScreenShare || !isConnected) {
      return;
    }
    void startScreenShare();
  }, [autoStartScreenShare, isConnected, startScreenShare]);

  return {
    isConnected,
    subscribers,
    connect,
    disconnect,
    setPublishAudio,
    setPublishVideo,
    switchCamera,
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
  };
};
