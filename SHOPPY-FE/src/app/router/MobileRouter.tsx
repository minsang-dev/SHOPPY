import { Routes, Route, Navigate } from 'react-router-dom';
import MobileMainPage from '../../pages/mobile/main';
import MobileSettlementPage from '../../pages/mobile/settlement';
import MobileSettlementResultPage from '../../pages/mobile/settlement-result';
import MobileVideoChatPage from '../../pages/mobile/video-chat';
import RoomPanelRoute from '../../pages/mobile/video-chat/RoomPanelRoute';

export default function MobileRouter() {
  return (
    <Routes>
      <Route index element={<MobileMainPage />} />
      {/* Backward-compatible route: /m/room?room_id=... */}
      <Route path="room" element={<MobileVideoChatPage />}>
        <Route index element={<RoomPanelRoute />} />
        <Route path="settlement" element={<MobileSettlementPage embedded />} />
        <Route path="settlement/result" element={<MobileSettlementResultPage embedded />} />
      </Route>
      <Route path="room/:roomId" element={<MobileVideoChatPage />}>
        <Route index element={<RoomPanelRoute />} />
        <Route path="settlement" element={<MobileSettlementPage embedded />} />
        <Route path="settlement/result" element={<MobileSettlementResultPage embedded />} />
      </Route>
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
