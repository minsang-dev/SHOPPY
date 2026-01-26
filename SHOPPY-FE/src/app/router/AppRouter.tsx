import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import DesktopRouter from './DesktopRouter';
import MobileRouter from './MobileRouter';

export default function AppRouter() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isMobilePath = location.pathname.startsWith('/m');

    if (isMobile && !isMobilePath) {
      const nextPath = `/m${location.pathname}${location.search}${location.hash}`;
      navigate(nextPath, { replace: true });
    }
  }, [location, navigate]);

  return (
    <Routes>
      <Route path="/m/*" element={<MobileRouter />} />
      <Route path="/*" element={<DesktopRouter />} />
    </Routes>
  );
}
