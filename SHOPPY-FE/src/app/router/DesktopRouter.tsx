import { Routes, Route } from 'react-router-dom';

// 메인 페이지
import DesktopVideoChatPage from '@/pages/desktop/VideoChat';

// 화상채팅
import DesktopMainPage from '@/pages/desktop/Main';

// 헤더
import DesktopProductList from '@/pages/desktop/ProductList';

// OAuth 콜백
import { KakaoCallbackPage } from '@/pages/desktop/LoginCallBack/KakaoCallbackPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route index element={<DesktopMainPage />} />
      <Route path="products" element={<DesktopProductList />} />

      {/* 카카오 OAuth 콜백 */}
      <Route path="auth/kakao/callback" element={<KakaoCallbackPage />} />
      
      {/* 중첩 라우팅으로 쇼핑룸 안 쇼핑몰 페이지 렌더링  */}
      <Route path="/rooms/:roomId" element={<DesktopVideoChatPage />}>
        {/* index를 쓰면 '/room'으로 들어왔을 때 이 컴포넌트를 Outlet에 보여줌 */}
        <Route index element={<DesktopMainPage />} />
        <Route path="products" element={<DesktopProductList />} />
      </Route>

    </Routes>
  );
};

export default AppRouter;
