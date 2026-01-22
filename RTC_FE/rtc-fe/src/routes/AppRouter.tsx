import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DesktopRouter from './DesktopRouter';
import MobileRouter from './MobileRouter';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/m/*" element={<MobileRouter />} />
      <Route path="/*" element={<DesktopRouter />} />
    </Routes>
  );
}
