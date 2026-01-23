import { Routes, Route, Navigate } from 'react-router-dom';
import MobileMainPage from '../pages/MobileMainPage';
import MobileSettlementPage from '../pages/MobileSettlementPage';
import MobileVideoChatPage from '../pages/MobileVideoChatPage';

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
