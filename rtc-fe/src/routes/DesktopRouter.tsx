import { Routes, Route } from 'react-router-dom';

// 메인 페이지
import DesktopVideoChatPage from '../pages/DesktopVideoChatPage.tsx';

// 화상채팅
import DesktopMainPage from '../pages/DesktopMainPage.tsx';

// 상품 페이지
import DesktopProductList from '../pages/DesktopProductList.tsx'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<DesktopMainPage />} />
      <Route path="/room" element={<DesktopVideoChatPage />} />
      <Route path="/products" element={<DesktopProductList />} />
    </Routes>
  );
};

export default AppRouter;
