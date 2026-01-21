import { Routes, Route, Navigate } from 'react-router-dom';

export default function DesktopRouter() {
  return (
    <Routes>
      <Route path="/" element={<div />} />
      <Route path="/room/:roomId" element={<div />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
