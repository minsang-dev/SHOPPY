import { Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom';
import MobileMainPage from '../../pages/mobile/main';
import MobileSettlementPage from '../../pages/mobile/settlement';
import MobileSettlementResultPage from '../../pages/mobile/settlement-result';
import MobileVideoChatPage from '../../pages/mobile/video-chat';
import RoomPanelRoute from '../../pages/mobile/video-chat/RoomPanelRoute';
import { useRoomPresenceHeartbeat } from '@/features/room/presence/model/useRoomPresenceHeartbeat';

function MobileRoomRouteShell() {
  const { roomId } = useParams<{ roomId?: string }>();
  const [searchParams] = useSearchParams();
  const resolvedRoomId = roomId ?? searchParams.get('room_id') ?? undefined;

  useRoomPresenceHeartbeat(resolvedRoomId);

  return <MobileVideoChatPage />;
}

export default function MobileRouter() {
  return (
    <Routes>
      <Route index element={<MobileMainPage />} />
      {/* Backward-compatible route: /m/room?room_id=... */}
      <Route path="room" element={<MobileRoomRouteShell />}>
        <Route index element={<RoomPanelRoute />} />
        <Route path="settlement" element={<MobileSettlementPage embedded />} />
        <Route path="settlement/result" element={<MobileSettlementResultPage embedded />} />
      </Route>
      <Route path="room/:roomId" element={<MobileRoomRouteShell />}>
        <Route index element={<RoomPanelRoute />} />
        <Route path="settlement" element={<MobileSettlementPage embedded />} />
        <Route path="settlement/result" element={<MobileSettlementResultPage embedded />} />
      </Route>
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
