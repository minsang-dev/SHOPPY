import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, Outlet, useParams, useLocation } from 'react-router-dom';
import type { VideoChatMode, RightPanelType } from '../../../entities/room/types/desktopVideoChat.types';
import VideoChatHeader from '../../../widgets/desktop/VideoChatHeader/VideoChatHeader';
import RightPanel from '../../../widgets/desktop/RightPanel/RightPanel';
import { ChatRealtimeProvider } from '../../../features/chat/model/useChatRealtime';
import { RoomMembersProvider } from '../../../features/room/fetch-members/model/RoomMembersProvider';
import VideoStage from '../../../widgets/desktop/VideoStage/VideoStage';
import { patchSyncMode, patchHostUrl, getRoom } from '../../../entities/room/api/room';
import { useLeaveRoom, resolveAccessToken } from '@/features/room/leave-room';
import { useRoomInfo } from '../../../features/room/fetch-room/model/useRoomInfo';
import { useAuthStore } from '../../../entities/user/model/useAuthStore';
import { realtimeConfig } from '../../../shared/config/realtime';
import {
  createRealtimeClient,
  connectRealtimeClient,
  disconnectRealtimeClient,
  subscribeTopic,
  topicRoomsHostUrl,
  topicVoteCreated,
  topicRoomsMembers,
  topicShoppingAdded,
} from '../../../shared/lib/realtime';
import type { CreateVoteResponse } from '../../../entities/vote/types/vote.types';
import { useVoteNotificationStore } from '../../../features/vote/model/useVoteNotificationStore';
import VoteNotificationToasts from '../../../features/vote/ui/VoteNotificationToasts';
import { useEntranceNotificationStore } from '../../../features/participant/model/useEntranceNotificationStore';
import EntranceNotificationToasts from '../../../features/participant/ui/EntranceNotificationToasts';
import { useCartNotificationStore } from '../../../features/cart/model/useCartNotificationStore';
import CartNotificationToasts from '../../../features/cart/ui/CartNotificationToasts';
import { CursorOverlay } from '@/features/cursor';
import './styles.css';

const DesktopVideoChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams<{ roomId?: string }>();
  const [mode, setMode] = useState<VideoChatMode>('personal');
  const [activePanel, setActivePanel] = useState<RightPanelType>('cart');

  const { room } = useRoomInfo(roomId);
  const user = useAuthStore((state) => state.user);
  const isHost = room && user ? room.hostId === user.id : false;

  // JWT에서 실제 user_id (sub) 추출 - 백엔드 인증과 일치해야 함
  const cursorUserId = useMemo(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Number(payload.sub);
      } catch {
        return user?.id;
      }
    }
    return user?.id;
  }, [user?.id]);

  const { leaveByButton } = useLeaveRoom({ roomId, navigateTo: '/' });

  const handleModeChange = async (newMode: VideoChatMode) => {
    // 각 사용자가 자신의 syncMode를 변경 (FOLLOW: 호스트 따라가기, FREE: 자유 탐색)
    const syncMode = newMode === 'personal' ? 'FREE' : 'FOLLOW';
    console.log('handleModeChange called:', { newMode, syncMode, roomId });

    if (!roomId) {
      setMode(newMode);
      return;
    }

    try {
      await patchSyncMode(roomId, { syncMode });
      console.log('patchSyncMode success');
      setMode(newMode);

      // FOLLOW 모드로 전환 시, 최신 방 정보 조회 후 호스트 URL로 이동
      if (newMode === 'host' && !isHost) {
        const latestRoom = await getRoom(roomId);
        if (latestRoom.hostCurrentUrl) {
          console.log('Navigating to host URL:', latestRoom.hostCurrentUrl);
          navigate(latestRoom.hostCurrentUrl);
        }
      }
    } catch (err) {
      console.error('Mode change error:', err);
    }
  };

  const handlePanelToggle = (panel: RightPanelType) => {
    setActivePanel(panel);
  };

  // WebSocket 구독: host-url 변경 수신
  // mode를 ref로 추적하여 최신 값 참조
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }
    const token = resolveAccessToken();
    if (!token) {
      return;
    }

    const client = createRealtimeClient({ token });
    let hostUrlSub: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;

        // host-url 변경 구독 (FOLLOW 모드인 참여자만 따라감)
        hostUrlSub = subscribeTopic(client, topicRoomsHostUrl(roomId), (body) => {
          try {
            // 백엔드 이벤트 형식: { type: "HOST_URL_UPDATED", roomId: number, payload: string }
            const event = JSON.parse(body) as { type: string; roomId: number; payload: string };
            const hostUrl = event.payload;
            // FOLLOW 모드(mode === 'host')이고 호스트가 아닌 경우에만 따라감
            if (hostUrl && modeRef.current === 'host' && !isHost) {
              console.log('Received host URL, navigating to:', hostUrl);
              navigate(hostUrl);
            }
          } catch (err) {
            console.error('Failed to parse host-url event:', err);
          }
        });
      })
      .catch((err) => {
        console.error('Realtime connection failed:', err);
      });

    return () => {
      cancelled = true;
      hostUrlSub?.unsubscribe();
      void disconnectRealtimeClient(client);
    };
  }, [roomId, isHost, navigate]);

  // 호스트일 때 페이지 이동 시 자동으로 host-url 전송 (모드 상관없이)
  useEffect(() => {
    if (!roomId || !isHost) {
      return;
    }
    const currentUrl = location.pathname;
    console.log('Host navigated, sending URL:', currentUrl);
    void patchHostUrl(roomId, { currentUrl }).catch((err) => {
      console.error('Failed to update host URL:', err);
    });
  }, [roomId, isHost, location.pathname]);

  // RightPanel 탭과 무관하게 새 투표 생성 시 모두에게 토스트 알림
  const addVoteToast = useVoteNotificationStore((state) => state.addToast);
  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }
    const token = resolveAccessToken();
    if (!token) return;

    const client = createRealtimeClient({ token });
    let voteCreatedSub: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;
        voteCreatedSub = subscribeTopic(client, topicVoteCreated(roomId), (body) => {
          try {
            const created = JSON.parse(body) as CreateVoteResponse;
            addVoteToast({
              title: '투표 생성 알림',
              voteTitle: `${created.title} 투표가 생성되었습니다.`,
              voteSubject: created.title,
            });
          } catch (err) {
            console.error('투표 생성 알림 파싱 실패:', err);
          }
        });
      })
      .catch((err) => {
        console.error('투표 알림 WebSocket 연결 실패:', err);
      });

    return () => {
      cancelled = true;
      voteCreatedSub?.unsubscribe();
      void disconnectRealtimeClient(client);
    };
  }, [roomId, addVoteToast]);

  // RightPanel 탭과 무관하게 새 참가자 입장 시 모두에게 토스트 알림 (본인 입장 제외)
  const addEntranceToast = useEntranceNotificationStore((state) => state.addToast);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }
    const token = resolveAccessToken();
    if (!token) return;

    const client = createRealtimeClient({ token });
    let membersSub: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;
        membersSub = subscribeTopic(client, topicRoomsMembers(roomId), (body) => {
          try {
            const payload = JSON.parse(body) as {
              type: 'JOINED' | 'LEFT' | 'STATE_UPDATED';
              member: {
                memberId: number;
                roomId: number;
                userId: number | null;
                nickname: string;
                role: string;
                status: string;
                isCameraOn: boolean;
                joinedAt: string;
              };
            };
            if (payload?.type !== 'JOINED' || !payload.member) return;
            const currentUser = userRef.current;
            const storedMemberId = sessionStorage.getItem('memberId');
            const isSelf =
              (currentUser != null && payload.member.userId === currentUser.id) ||
              (storedMemberId != null && payload.member.memberId === Number(storedMemberId));
            if (!isSelf) {
              addEntranceToast({ nickname: payload.member.nickname });
            }
          } catch (err) {
            console.error('입장 알림 파싱 실패:', err);
          }
        });
      })
      .catch((err) => {
        console.error('입장 알림 WebSocket 연결 실패:', err);
      });

    return () => {
      cancelled = true;
      membersSub?.unsubscribe();
      void disconnectRealtimeClient(client);
    };
  }, [roomId, addEntranceToast]);

  // RightPanel 탭과 무관하게 장바구니 추가 시 모두에게 토스트 알림 (본인 추가 제외)
  const addCartToast = useCartNotificationStore((state) => state.addToast);
  useEffect(() => {
    if (!roomId || !realtimeConfig.enabled || !realtimeConfig.websocketUrl) {
      return;
    }
    const token = resolveAccessToken();
    if (!token) return;

    const client = createRealtimeClient({ token });
    let shoppingAddedSub: { unsubscribe: () => void } | null = null;
    let cancelled = false;

    connectRealtimeClient(client)
      .then(() => {
        if (cancelled) return;
        shoppingAddedSub = subscribeTopic(client, topicShoppingAdded(roomId), (body) => {
          try {
            const payload = JSON.parse(body) as {
              shopping_item_id: number;
              room_id: number;
              added_by_user_id: number | null;
              product_id: number | null;
              display_name: string;
              quantity: number;
              is_checked: boolean;
              purchase_type: 'online' | 'offline' | null;
              added_by_nickname?: string;
            };
            const currentUser = userRef.current;
            const isSelf =
              currentUser != null &&
              payload.added_by_user_id != null &&
              payload.added_by_user_id === currentUser.id;
            if (!isSelf) {
              addCartToast({
                nickname: payload.added_by_nickname ?? '참여자',
                productName: payload.display_name,
              });
            }
          } catch (err) {
            console.error('장바구니 추가 알림 파싱 실패:', err);
          }
        });
      })
      .catch((err) => {
        console.error('장바구니 추가 알림 WebSocket 연결 실패:', err);
      });

    return () => {
      cancelled = true;
      shoppingAddedSub?.unsubscribe();
      void disconnectRealtimeClient(client);
    };
  }, [roomId, addCartToast]);

  return (
    <div className="video-chat-page">
      <RoomMembersProvider roomId={roomId}>
        <ChatRealtimeProvider activePanel={activePanel}>
          <VideoChatHeader
            mode={mode}
            onModeChange={handleModeChange}
            onExit={leaveByButton}
            activePanel={activePanel}
            onPanelToggle={handlePanelToggle}
          />
          <div className="video-chat-content">
            <div
              className="video-chat-left"
              style={{
                pointerEvents: mode === 'host' && !isHost ? 'none' : 'auto',
                position: 'relative',
              }}
            >
              {/* 공유 커서 오버레이 - 호스트 OR 호스트모드 ON일 때 활성화 */}
              <CursorOverlay
                roomId={roomId}
                userId={cursorUserId}
                nickname={sessionStorage.getItem('memberNickname') ?? user?.nickname ?? ''}
                colorKey={sessionStorage.getItem('memberId') ?? '0'}
                enabled={isHost || mode === 'host'}
              />
              {/* 중첩 라우터 -> Outlet으로 router에서 정의한 화면 랜더링 */}
              <div className="video-chat-body">
                <Outlet />
              </div>
              {/* 호스트 모드일 때 참여자에게 안내 오버레이 */}
              {mode === 'host' && !isHost && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 14,
                    zIndex: 10,
                  }}
                >
                  호스트 모드: 호스트가 화면을 제어 중입니다
                </div>
              )}
              <VideoStage roomId={roomId} />
            </div>
            <div className="video-chat-right">
              <RightPanel panelType={activePanel} />
            </div>
          </div>
          <div className="video-chat-notification-toasts">
            <EntranceNotificationToasts />
            <CartNotificationToasts />
            <VoteNotificationToasts />
          </div>
        </ChatRealtimeProvider>
      </RoomMembersProvider>
    </div>
  );
};

export default DesktopVideoChatPage;
