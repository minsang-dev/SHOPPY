import { Routes, Route } from 'react-router-dom';

// 메인 페이지
import DesktopMainPage from '@/pages/desktop/main';

// 화상채팅
import DesktopVideoChatPage from '@/pages/desktop/VideoChat';

// 헤더
import DesktopProductList from '@/pages/desktop/ProductList';
import DesktopCheckoutPage from '@/pages/desktop/Checkout';

// OAuth 콜백
import { KakaoCallbackPage } from '@/pages/desktop/LoginCallBack/KakaoCallbackPage';

// 마이페이지
import MyPage from '@/pages/desktop/MyPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route index element={<DesktopMainPage />} />
      <Route path="products" element={<DesktopProductList />} />
      <Route path="myPage/:userId" element={<MyPage />} />

      {/* 카카오 OAuth 콜백 */}
      <Route path="auth/kakao/callback" element={<KakaoCallbackPage />} />
      
      {/* 중첩 라우팅으로 쇼핑룸 안 쇼핑몰 페이지 렌더링  */}
      <Route path="/rooms/:roomId" element={<DesktopVideoChatPage />}>
        {/* index를 쓰면 '/room'으로 들어왔을 때 이 컴포넌트를 Outlet에 보여줌 */}
        <Route index element={<DesktopMainPage />} />
        <Route path="products" element={<DesktopProductList />} />
        <Route path="checkout" element={<DesktopCheckoutPage />} />
      </Route>

    </Routes>
  );
};

export default AppRouter;
