import { useState } from 'react';
import { products } from '../../mocks/products';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [allergies, setAllergies] = useState('');
  const [preferences, setPreferences] = useState('');

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const handleCreateRoom = () => {
    // TODO: 실제 방 생성 로직
    const roomId = Date.now().toString();
    console.log('방 생성:', { maxParticipants, allergies, preferences });
    window.REACT_APP_NAVIGATE(`/room/${roomId}`);
    setShowCreateModal(false);
    setMaxParticipants(8);
    setAllergies('');
    setPreferences('');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <i className="ri-shopping-cart-2-line text-xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SHOP CREW</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl"
            >
              <i className="ri-group-line text-xl"></i>
              <span>공유 쇼핑 시작하기</span>
            </button>

            <button
              onClick={() => window.REACT_APP_NAVIGATE('/cart')}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              <i className="ri-shopping-cart-line text-xl"></i>
              <span>장바구니</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-20 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center gap-2">
            <i className="ri-check-line text-xl"></i>
            <span className="font-medium">장바구니에 추가되었습니다</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            함께 장보고, 함께 결정하세요
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            친구들과 실시간으로 소통하며 장을 보고 정산까지 한 번에
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
              <i className="ri-group-line text-emerald-500 text-xl"></i>
              <span className="text-sm font-medium text-gray-700">함께 구매</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
              <i className="ri-chat-voice-line text-emerald-500 text-xl"></i>
              <span className="text-sm font-medium text-gray-700">실시간 통화</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
              <i className="ri-money-dollar-circle-line text-emerald-500 text-xl"></i>
              <span className="text-sm font-medium text-gray-700">간편 정산</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">신선한 상품</h3>
          <p className="text-gray-600">친구들과 함께 장바구니에 담아보세요</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-product-shop>
          {products.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group"
            >
              <div className="relative w-full h-64 bg-gray-50 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                  {product.category}
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-base">
                  {product.name}
                </h4>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-emerald-600">
                    {product.price.toLocaleString()}원
                  </span>
                  <span className="text-xs text-gray-500">
                    재고 {product.stock}개
                  </span>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-medium flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-shopping-cart-line text-lg"></i>
                  <span>장바구니 담기</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">새 룸 만들기</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-gray-600"></i>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                  최대 참여 인원
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setMaxParticipants(Math.max(2, maxParticipants - 1))}
                    className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <i className="ri-subtract-line text-lg text-gray-600"></i>
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold text-gray-900">{maxParticipants}</span>
                    <span className="text-sm text-gray-500 ml-1">명</span>
                  </div>
                  <button
                    onClick={() => setMaxParticipants(Math.min(20, maxParticipants + 1))}
                    className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <i className="ri-add-line text-lg text-gray-600"></i>
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

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-start">
                  <i className="ri-information-line text-emerald-600 text-lg mr-2 mt-0.5"></i>
                  <p className="text-xs text-emerald-800">
                    룸을 만들면 자동으로 호스트가 됩니다. 호스트는 참여자 관리, 정산 등의 권한을 가집니다.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateRoom}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium text-sm hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
                >
                  만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store cart in localStorage for cart page */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('storage', function(e) {
              if (e.key === 'shop_crew_cart') {
                window.location.reload();
              }
            });
          `
        }}
      />
      {typeof window !== 'undefined' && localStorage.setItem('shop_crew_cart', JSON.stringify(cart))}
    </div>
  );
}
