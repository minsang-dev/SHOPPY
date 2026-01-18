import { useState } from 'react';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = () => {
    setIsLoading(true);
    // TODO: 카카오 로그인 로직 구현
    setTimeout(() => {
      setIsLoading(false);
      window.REACT_APP_NAVIGATE('/rooms');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <i className="ri-shopping-cart-2-line text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SHOP CREW</h1>
          <p className="text-gray-600 text-sm">함께 장보고, 함께 결정하고, 함께 정산하세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <button
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-6 py-4 bg-[#FEE500] rounded-xl text-base font-semibold text-[#000000] hover:bg-[#FDD835] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <i className="ri-loader-4-line animate-spin text-xl mr-3"></i>
                로그인 중...
              </>
            ) : (
              <>
                <i className="ri-kakao-talk-fill text-xl mr-3"></i>
                카카오로 시작하기
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              카카오 계정으로 간편하게 시작하세요
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.REACT_APP_NAVIGATE('/rooms')}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors cursor-pointer"
          >
            초대 링크로 바로 입장하기 →
          </button>
        </div>
      </div>
    </div>
  );
}
