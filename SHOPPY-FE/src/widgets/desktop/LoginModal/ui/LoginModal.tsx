import { useModalStore } from '@/shared/model/useModalStore';
import { KakaoLoginButton } from '@/features/auth/LoginByKakao';
import './LoginModal.css';

export const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal } = useModalStore();

  if (!isLoginModalOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={closeLoginModal}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="login-modal-close" 
          onClick={closeLoginModal}
          aria-label="닫기"
        >
          ✕
        </button>
        
        <div className="login-modal-content">
          <h1 className="login-modal-title">SHOPPY</h1>
          <p className="login-modal-slogan">
            실시간 쇼핑부터 빠른 정산까지,<br />
            SHOPPY와 함께하세요.
          </p>
          
          <div className="login-modal-button-area">
            <KakaoLoginButton />
          </div>
        </div>
      </div>
    </div>
  );
};
