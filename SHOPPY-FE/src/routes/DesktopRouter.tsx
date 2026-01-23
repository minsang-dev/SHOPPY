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
      <Route index element={<DesktopMainPage />} />
      <Route path="products" element={<DesktopProductList />} />
      
      {/* 중첩 라우팅으로 쇼핑룸 안 쇼핑몰 페이지 렌더링  */}
      <Route path="room" element={<DesktopVideoChatPage />}>
        {/* index를 쓰면 '/room'으로 들어왔을 때 이 컴포넌트를 Outlet에 보여줌 */}
        <Route index element={<DesktopMainPage />} />
        <Route path="products" element={<DesktopProductList />} />
      </Route>

    </Routes>
  );
};

export default AppRouter;
