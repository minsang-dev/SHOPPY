import { Routes, Route, Navigate } from 'react-router-dom';

export default function MobileRouter() {
  return (
    <Routes>
      <Route path="/room/:roomId/mobile" element={<div />} />
      <Route path="*" element={<Navigate to="/room/demo/mobile" replace />} />
    </Routes>
  );
}
