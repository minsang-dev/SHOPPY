import { create } from 'zustand';
import type { CartItem } from '../types/cart.types';

// 무전기(BroadcastChannel) 켜기. 나중에 socket.io로 교체
const channel = new BroadcastChannel('cart-channel');

interface CartStore {
  // 온라인 장바구니 (쇼핑몰 물품)
  onlineCartItems: CartItem[];
  // 오프라인 장바구니 (오프라인에서 스캔한 물품)
  offlineCartItems: CartItem[];
  
  // 온라인 장바구니에 추가 (쇼핑몰 물품용)
  addToOnlineCart: (product: CartItem) => void;
  // 오프라인 장바구니에 추가
  addToOfflineCart: (product: CartItem) => void;
  
  // 수량 업데이트
  updateQuantity: (productId: number, quantity: number, isOnline: boolean) => void;
  // 아이템 삭제
  removeFromCart: (productId: number, isOnline: boolean) => void;
  
  // 투표 기능 (온라인 장바구니만)
  toggleLike: (productId: number) => void;
  toggleDislike: (productId: number) => void;
  
  // 다른 참여자와 동기화 (온라인 장바구니만 동기화)
  syncFromFriend: (product: CartItem) => void;
}

export const useCartStore = create<CartStore>((set) => {
  
  // 다른 참여자가 담으면 여기서 받음 (온라인 장바구니만 동기화)
  channel.onmessage = (event) => {
    console.log('📡 다른 참여자가 담은 거 수신:', event.data);
    // 온라인 장바구니에만 추가
    set((state) => {
      const existingItem = state.onlineCartItems.find(
        item => item.product_id === event.data.product_id
      );
      
      if (existingItem) {
        // 이미 있으면 수량 증가
        return {
          onlineCartItems: state.onlineCartItems.map(item =>
            item.product_id === event.data.product_id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          )
        };
      } else {
        // 없으면 새로 추가
        return {
          onlineCartItems: [...state.onlineCartItems, { ...event.data, quantity: 1 }]
        };
      }
    });
  };

  return {
    // 초기 장바구니 상태
    onlineCartItems: [],
    offlineCartItems: [],

    // 온라인 장바구니에 추가 (쇼핑몰 물품)
    addToOnlineCart: (product: CartItem) => {
      set((state) => {
        const existingItem = state.onlineCartItems.find(
          item => item.product_id === product.product_id
        );
        
        if (existingItem) {
          // 이미 있으면 수량 증가
          const updatedItems = state.onlineCartItems.map(item =>
            item.product_id === product.product_id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          );
          
          // 참여자들에게 수량 업데이트 방송
          channel.postMessage({ ...product, quantity: (existingItem.quantity || 1) + 1 });
          console.log('🛒 내가 담고 방송함 (수량 증가):', product);
          
          return { onlineCartItems: updatedItems };
        } else {
          // 없으면 새로 추가
          const newItem = { ...product, quantity: 1 };
          
          // 참여자들에게 "나 이거 담았어!" 하고 무전 치기
          channel.postMessage(newItem);
          console.log('🛒 내가 담고 방송함:', newItem);
          
          return { onlineCartItems: [...state.onlineCartItems, newItem] };
        }
      });
    },

    // 오프라인 장바구니에 추가
    addToOfflineCart: (product: CartItem) => {
      set((state) => {
        const existingItem = state.offlineCartItems.find(
          item => item.product_id === product.product_id
        );
        
        if (existingItem) {
          // 이미 있으면 수량 증가
          return {
            offlineCartItems: state.offlineCartItems.map(item =>
              item.product_id === product.product_id
                ? { ...item, quantity: (item.quantity || 1) + 1 }
                : item
            )
          };
        } else {
          // 없으면 새로 추가
          return {
            offlineCartItems: [...state.offlineCartItems, { ...product, quantity: 1 }]
          };
        }
      });
    },

    // 수량 업데이트
    updateQuantity: (productId: number, quantity: number, isOnline: boolean) => {
      if (quantity < 1) return; // 최소 수량은 1
      
      set((state) => {
        if (isOnline) {
          return {
            onlineCartItems: state.onlineCartItems.map(item =>
              item.product_id === productId
                ? { ...item, quantity }
                : item
            )
          };
        } else {
          return {
            offlineCartItems: state.offlineCartItems.map(item =>
              item.product_id === productId
                ? { ...item, quantity }
                : item
            )
          };
        }
      });
    },

    // 아이템 삭제
    removeFromCart: (productId: number, isOnline: boolean) => {
      set((state) => {
        if (isOnline) {
          return {
            onlineCartItems: state.onlineCartItems.filter(
              item => item.product_id !== productId
            )
          };
        } else {
          return {
            offlineCartItems: state.offlineCartItems.filter(
              item => item.product_id !== productId
            )
          };
        }
      });
    },

    // 좋아요 토글
    toggleLike: (productId: number) => {
      set((state) => {
        return {
          onlineCartItems: state.onlineCartItems.map(item =>
            item.product_id === productId
              ? { ...item, likes: (item.likes || 0) + 1 }
              : item
          )
        };
      });
    },

    // 싫어요 토글
    toggleDislike: (productId: number) => {
      set((state) => {
        return {
          onlineCartItems: state.onlineCartItems.map(item =>
            item.product_id === productId
              ? { ...item, dislikes: (item.dislikes || 0) + 1 }
              : item
          )
        };
      });
    },

    // 참여자와 동기화하는용 - 위 onmessage에서 사용됨
    syncFromFriend: (product: CartItem) => {
      set((state) => {
        const existingItem = state.onlineCartItems.find(
          item => item.product_id === product.product_id
        );
        
        if (existingItem) {
          return {
            onlineCartItems: state.onlineCartItems.map(item =>
              item.product_id === product.product_id
                ? { ...item, quantity: (item.quantity || 1) + 1 }
                : item
            )
          };
        } else {
          return {
            onlineCartItems: [...state.onlineCartItems, { ...product, quantity: 1 }]
          };
        }
      });
    },
  };
});