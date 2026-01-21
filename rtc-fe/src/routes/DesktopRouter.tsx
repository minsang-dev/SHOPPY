import { Routes, Route } from 'react-router-dom';

// 메인 페이지
import DesktopVideoChatPage from '../pages/DesktopVideoChatPage.tsx';

// 화상채팅
import DesktopMainPage from '../pages/DesktopMainPage.tsx';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<DesktopMainPage />} />
      <Route path="/room" element={<DesktopVideoChatPage />} />
    </Routes>
  );
};

export default AppRouter;
