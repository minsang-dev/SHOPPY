import React from 'react';
import { useLocation } from 'react-router-dom';
import DesktopRouter from './DesktopRouter';
import MobileRouter from './MobileRouter';

export default function AppRouter() {
  const { pathname } = useLocation();

  // 모바일 라우트 규칙: /room/:roomId/mobile 로 시작하면 모바일 UI
  const isMobileRoute = /\/mobile(\/|$)/.test(pathname);

  return isMobileRoute ? <MobileRouter /> : <DesktopRouter />;
}
