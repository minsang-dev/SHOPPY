import { Routes, Route, Navigate } from 'react-router-dom';
import MobileMainPage from '../../pages/mobile/main';
import MobileSettlementPage from '../../pages/mobile/settlement';
import MobileVideoChatPage from '../../pages/mobile/video-chat';

export default function MobileRouter() {
  return (
    <Routes>
      <Route index element={<MobileMainPage />} />
      <Route path="room" element={<MobileVideoChatPage />} />
      <Route path="settlement" element={<MobileSettlementPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
