import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, Outlet, useParams, useLocation } from 'react-router-dom';
import type { VideoChatMode, RightPanelType } from '../../../entities/room/types/desktopVideoChat.types';
import VideoChatHeader from '../../../widgets/desktop/VideoChatHeader/VideoChatHeader';
import RightPanel from '../../../widgets/desktop/RightPanel/RightPanel';
import { ChatRealtimeProvider } from '../../../features/chat/model/useChatRealtime';
import { RoomMembersProvider } from '../../../features/room/fetch-members/model/RoomMembersProvider';
import VideoStage from '../../../widgets/desktop/VideoStage/VideoStage';
import { patchSyncMode, patchHostUrl, getRoom, getRoomMembers } from '../../../entities/room/api/room';
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
import { useScrollRealtime } from '@/features/scroll';
import './styles.css';

/** URL 경로가 결제(checkout) 페이지인지 확인 - 민감정보 보호용 */
function isCheckoutUrl(url: string): boolean {
  if (!url?.trim()) return false;
  const pathPart = url.split('?')[0].split('#')[0].trim();
  return pathPart.endsWith('/checkout');
}

const DesktopVideoChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams<{ roomId?: string }>();
  const [mode, setMode] = useState<VideoChatMode>('personal');
  const [activePanel, setActivePanel] = useState<RightPanelType>('cart');
  // 호스트가 결제 화면으로 이동했을 때때
  const [hostUrlIsCheckout, setHostUrlIsCheckout] = useState(false);

  const { room } = useRoomInfo(roomId);
  const user = useAuthStore((state) => state.user);
  const isHost = room && user ? room.hostId === user.id : false;

  useEffect(() => {
    if (!roomId) return;
    const hydrateMemberId = async () => {
      try {
        const members = await getRoomMembers(roomId);
        const storedMemberId = sessionStorage.getItem('memberId');
        const storedMember =
          storedMemberId != null
            ? members.find((member) => member.memberId === Number(storedMemberId))
            : null;
        if (storedMember) {
          if (storedMember.nickname) {
            sessionStorage.setItem('memberNickname', storedMember.nickname);
          }
          return;
        }
        const nicknameHint = sessionStorage.getItem('memberNickname')?.trim();
        const self =
          (user ? members.find((member) => member.userId === user.id) : null) ??
          (nicknameHint ? members.find((member) => member.nickname === nicknameHint) : null);
        if (!self) return;
        sessionStorage.setItem('memberId', String(self.memberId));
        if (self.nickname) {
          sessionStorage.setItem('memberNickname', self.nickname);
        }
      } catch (error) {
        console.error('Failed to hydrate memberId for desktop session:', error);
      }
    };

    void hydrateMemberId();
  }, [roomId, user]);

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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollRealtime({
    roomId,
    userId: cursorUserId,
    isHost,
    hostMode: mode === 'host',
    containerRef: scrollContainerRef,
  });

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
      if (newMode === 'personal') setHostUrlIsCheckout(false);

      // FOLLOW 모드로 전환 시, 최신 방 정보 조회 후 호스트 URL로 이동 (결제 페이지는 미공유)
      if (newMode === 'host' && !isHost) {
        const latestRoom = await getRoom(roomId);
        const hostUrl = latestRoom.hostCurrentUrl;
        if (hostUrl && isCheckoutUrl(hostUrl)) {
          setHostUrlIsCheckout(true);
          navigate(`/rooms/${roomId}`, { replace: true });
        } else if (hostUrl) {
          setHostUrlIsCheckout(false);
          console.log('Navigating to host URL:', hostUrl);
          navigate(hostUrl);
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

            const event = JSON.parse(body) as { type: string; roomId: number; payload: string };
            const hostUrl = event.payload;
            // FOLLOW 모드(mode === 'host')이고 호스트가 아닌 경우에만 따라감
            if (hostUrl && modeRef.current === 'host' && !isHost) {
              if (isCheckoutUrl(hostUrl)) {
                setHostUrlIsCheckout(true);
                // 결제 페이지는 민감정보 보호를 위해 참여자에게 공유하지 않음
              } else {
                setHostUrlIsCheckout(false);
                console.log('Received host URL, navigating to:', hostUrl);
                navigate(hostUrl);
              }
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
    const currentUrl = location.pathname + location.search + location.hash;
    console.log('Host navigated, sending URL:', currentUrl);
    void patchHostUrl(roomId, { currentUrl }).catch((err) => {
      console.error('Failed to update host URL:', err);
    });
  }, [roomId, isHost, location.pathname, location.search, location.hash]);

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
              <div className="video-chat-body" ref={scrollContainerRef}>
                <Outlet />
              </div>
              {/* 호스트 모드일 때 참여자에게 안내 오버레이 */}
              {mode === 'host' && !isHost && !hostUrlIsCheckout && (
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
              {/* 호스트가 결제 화면일 때: 해당 화면 미공유 안내 */}
              {mode === 'host' && !isHost && hostUrlIsCheckout && (
                <div className="video-chat-checkout-block">
                  <div className="video-chat-checkout-block-content">
                    <span className="video-chat-checkout-block-icon" aria-hidden>🔒</span>
                    <p className="video-chat-checkout-block-title">결제 화면은 공유되지 않습니다</p>
                    <p className="video-chat-checkout-block-desc">
                      호스트가 결제 화면을 보고 있습니다.
                      <br />
                      개인정보·결제 정보 보호를 위해 해당 화면은 
                      <br />
                      참여자에게 표시되지 않습니다.
                    </p>
                  </div>
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
