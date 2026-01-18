import { useState, useEffect } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [allergies, setAllergies] = useState('');
  const [preferences, setPreferences] = useState('');

  useEffect(() => {
    const savedCart = localStorage.getItem('shop_crew_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );
      localStorage.setItem('shop_crew_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (id: number) => {
    setCart(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('shop_crew_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const createRoom = () => {
    // TODO: 실제 방 생성 로직 및 링크 생성
    const roomId = Date.now().toString();
    console.log('방 생성:', { maxParticipants, allergies, preferences, cart });
    window.REACT_APP_NAVIGATE(`/room/${roomId}`);
    setShowRoomModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => window.REACT_APP_NAVIGATE('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line text-xl"></i>
            <span className="font-medium">계속 쇼핑하기</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <i className="ri-shopping-cart-2-line text-xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">장바구니</h1>
          </div>
          
          <div className="w-24"></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-shopping-bag-line text-5xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              장바구니가 비어있습니다
            </h3>
            <p className="text-gray-600 mb-6">상품을 담아보세요</p>
            <button
              onClick={() => window.REACT_APP_NAVIGATE('/')}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              쇼핑 시작하기
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  담은 상품 ({totalItems}개)
                </h2>
              </div>
              
              {cart.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4"
                >
                  <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>
                    <p className="text-lg font-bold text-emerald-600 mb-3">
                      {item.price.toLocaleString()}원
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          <i className="ri-subtract-line"></i>
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          <i className="ri-add-line"></i>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {(item.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">주문 요약</h3>
                
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>상품 금액</span>
                    <span>{totalAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>배송비</span>
                    <span className="text-emerald-600 font-medium">무료</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                  <span>총 결제 금액</span>
                  <span className="text-emerald-600">{totalAmount.toLocaleString()}원</span>
                </div>

                <button
                  onClick={() => setShowRoomModal(true)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-bold text-lg flex items-center justify-center gap-2 mb-3 whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl"
                >
                  <i className="ri-group-line text-xl"></i>
                  <span>공유 쇼핑 시작하기</span>
                </button>
                
                <button
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium whitespace-nowrap cursor-pointer"
                >
                  혼자 구매하기
                </button>

                <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <i className="ri-information-line text-emerald-600 text-lg mt-0.5"></i>
                    <div className="text-sm text-gray-700">
                      <p className="font-medium text-emerald-700 mb-1">공유 쇼핑이란?</p>
                      <p className="text-xs leading-relaxed">
                        친구들과 실시간 통화하며 함께 장을 보고, 투표로 결정하고, 간편하게 정산할 수 있어요
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Room Creation Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">새 룸 만들기</h3>
              <button
                onClick={() => setShowRoomModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="space-y-5 mb-6">
              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                  최대 참여 인원
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMaxParticipants(Math.max(2, maxParticipants - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-subtract-line text-lg"></i>
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold text-gray-900">{maxParticipants}</span>
                    <span className="text-sm text-gray-500 ml-1">명</span>
                  </div>
                  <button
                    onClick={() => setMaxParticipants(Math.min(20, maxParticipants + 1))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-add-line text-lg"></i>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
                  알러지 유무
                </label>
                <textarea
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="알러지가 있다면 입력해주세요 (예: 땅콩, 새우, 우유 등)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  AI가 알러지를 고려한 상품을 추천해드립니다
                </p>
              </div>

              <div>
                <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-2">
                  원하는 주종 및 선호사항
                </label>
                <textarea
                  id="preferences"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="원하는 주종이나 선호하는 상품을 입력해주세요 (예: 와인, 맥주, 유기농 제품 등)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  AI가 취향에 맞는 상품을 추천해드립니다
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <i className="ri-shopping-basket-line text-emerald-600 text-lg mt-0.5"></i>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      장바구니 상품 {totalItems}개
                    </p>
                    <p className="text-xs text-gray-600">
                      총 {totalAmount.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <i className="ri-information-line text-emerald-600 text-lg mt-0.5"></i>
                  <div className="text-xs text-emerald-800 leading-relaxed">
                    <p className="font-medium mb-1">공유 쇼핑 기능</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>실시간 음성/영상 통화</li>
                      <li>투표로 함께 결정</li>
                      <li>AI 상품 추천</li>
                      <li>간편 정산</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRoomModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={createRoom}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium text-sm hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
              >
                <i className="ri-door-open-line mr-2"></i>
                방 만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
