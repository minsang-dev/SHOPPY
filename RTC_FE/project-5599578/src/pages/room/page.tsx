import { useState, useEffect } from 'react';
import { products } from '../../mocks/products';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  likes: number;
  dislikes: number;
  participants: string[];
  receiptPayer?: string; // 영수증 결제자 ID 추가
}

interface Message {
  id: string;
  user: string;
  text: string;
  time: string;
  avatar: string;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isHost: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  isSpeaking: boolean;
  volume: number;
  isMobile: boolean; // 모바일 접속 여부
}

interface Vote {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  totalVotes: number;
  isActive: boolean;
}

export default function Room() {
  // Check if user is on mobile (device or screen size)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const screenWidth = window.innerWidth <= 768;
      setIsMobile(userAgent || screenWidth);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [viewMode, setViewMode] = useState<'host' | 'personal'>('host');
  const [activeTab, setActiveTab] = useState<'chat' | 'vote' | 'participants' | 'cart'>('chat');
  const [cartType, setCartType] = useState<'online' | 'offline'>('online');

  // Mobile offline shopping mode states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isObjectRecognitionOn, setIsObjectRecognitionOn] = useState(false);

  const [onlineCart, setOnlineCart] = useState<CartItem[]>([
    {
      id: 1,
      name: '유기농 사과',
      price: 15900,
      image:
        'https://readdy.ai/api/search-image?query=Fresh%20organic%20red%20apples%20arranged%20in%20a%20clean%20white%20minimalist%20background%20studio%20photography%20high%20quality%20commercial%20product%20photo%20bright%20and%20crisp%20lighting%20showcasing%20the%20natural%20texture%20and%20vibrant%20color%20of%20the%20apples%20simple%20composition&width=300&height=300&seq=101&orientation=squarish',
      quantity: 2,
      likes: 2,
      dislikes: 0,
      participants: ['1', '2', '3'],
    },
    {
      id: 2,
      name: '신선한 우유',
      price: 3500,
      image:
        'https://readdy.ai/api/search-image?query=Premium%20fresh%20milk%20bottle%20on%20clean%20white%20minimalist%20background%20studio%20product%20photography%20high%20quality%20bright%20lighting%20showcasing%20the%20purity%20and%20freshness%20simple%20elegant%20composition&width=300&height=300&seq=102&orientation=squarish',
      quantity: 1,
      likes: 3,
      dislikes: 0,
      participants: ['1', '2', '3'],
    },
  ]);
  const [offlineCart, setOfflineCart] = useState<CartItem[]>([
    {
      id: 3,
      name: '바나나',
      price: 0,
      image:
        'https://readdy.ai/api/search-image?query=Fresh%20yellow%20bananas%20bunch%20on%20clean%20white%20minimalist%20background%20studio%20product%20photography%20high%20quality%20bright%20lighting%20showcasing%20natural%20texture%20simple%20composition&width=300&height=300&seq=103&orientation=squarish',
      quantity: 3,
      likes: 1,
      dislikes: 1,
      participants: ['1', '2'],
    },
  ]);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', user: '김민수', text: '사과 2개 추가했어요!', time: '오후 2:30', avatar: '👨' },
    { id: '2', user: '이지은', text: '우유도 필요할 것 같은데', time: '오후 2:31', avatar: '👩' },
    { id: '3', user: '김민수', text: '좋아요, 추가할게요', time: '오후 2:31', avatar: '👨' },
  ]);

  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: '김민수',
      avatar: '👨',
      color: '#10B981',
      isHost: true,
      isCameraOn: true,
      isMicOn: true,
      isSpeaking: false,
      volume: 100,
      isMobile: false,
    },
    {
      id: '2',
      name: '이지은',
      avatar: '👩',
      color: '#3B82F6',
      isHost: false,
      isCameraOn: false,
      isMicOn: true,
      isSpeaking: true,
      volume: 80,
      isMobile: false,
    },
    {
      id: '3',
      name: '박철수',
      avatar: '👨‍💼',
      color: '#F59E0B',
      isHost: false,
      isCameraOn: true,
      isMicOn: false,
      isSpeaking: false,
      volume: 90,
      isMobile: true, // 철수는 모바일로 접속
    },
  ]);

  const [votes, setVotes] = useState<Vote[]>([
    {
      id: '1',
      question: '바나나 추가할까요?',
      options: [
        { text: '찬성', votes: 2 },
        { text: '반대', votes: 1 },
      ],
      totalVotes: 3,
      isActive: true,
    },
  ]);

  const [showCreateVote, setShowCreateVote] = useState(false);
  const [newVoteTitle, setNewVoteTitle] = useState('');
  const [newVoteOptions, setNewVoteOptions] = useState(['', '']);

  const [showVolumeControl, setShowVolumeControl] = useState<string | null>(null);
  const [volumeControlPosition, setVolumeControlPosition] = useState({ x: 0, y: 0 });

  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [voiceSearchText, setVoiceSearchText] = useState('');

  const [showAddNotification, setShowAddNotification] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualProductName, setManualProductName] = useState('');
  const [manualQuantity, setManualQuantity] = useState(1);

  // 모바일 음성 입력 상태 추가
  const [isMobileVoiceInput, setIsMobileVoiceInput] = useState(false);
  const [mobileVoiceText, setMobileVoiceText] = useState('');

  const [showParticipantSelect, setShowParticipantSelect] = useState<number | null>(null);
  const [showSettlement, setShowSettlement] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);

  // 쇼핑 종료 관련 상태
  const [showEndShoppingModal, setShowEndShoppingModal] = useState(false);
  const [endShoppingCountdown, setEndShoppingCountdown] = useState(10);
  const [isSettlementMode, setIsSettlementMode] = useState(false);

  // 영수증 OCR 관련 상태
  const [showReceiptCamera, setShowReceiptCamera] = useState(false);
  const [isOCRScanning, setIsOCRScanning] = useState(false);
  const [scannedReceiptData, setScannedReceiptData] = useState<CartItem[] | null>(null); // OCR 스캔 결과 임시 저장
  const [showPayerSelection, setShowPayerSelection] = useState(false); // 결제자 선택 화면
  const [selectedReceiptPayer, setSelectedReceiptPayer] = useState<string>(''); // 선택된 결제자

  const sharedCart = cartType === 'online' ? onlineCart : offlineCart;
  const setSharedCart = cartType === 'online' ? setOnlineCart : setOfflineCart;

  // 정산 금액 계산 함수
  const calculateSettlement = () => {
    const settlements: Record<string, number> = {};

    participants.forEach(p => {
      settlements[p.id] = 0;
    });

    onlineCart.forEach(item => {
      if (item.participants.length > 0) {
        const amountPerPerson = (item.price * item.quantity) / item.participants.length;
        item.participants.forEach(pId => {
          settlements[pId] = (settlements[pId] || 0) + amountPerPerson;
        });
      }
    });

    return settlements;
  };

  // 참가자 카메라 토글 (개별)
  const toggleCamera = (id: string) => {
    setParticipants(prev =>
      prev.map(p =>
        p.id === id ? { ...p, isCameraOn: !p.isCameraOn } : p
      )
    );
  };

  // 모바일 카메라 토글 (전체)
  const toggleMobileCamera = () => {
    setIsCameraActive(!isCameraActive);
  };

  // 물건 인식 토글
  const toggleObjectRecognition = () => {
    setIsObjectRecognitionOn(!isObjectRecognitionOn);
    if (!isObjectRecognitionOn && isCameraActive) {
      // 물건 인식 시작 시뮬레이션
      setTimeout(() => {
        handleObjectRecognition();
      }, 2000);
    }
  };

  // 물건 인식 처리
  const handleObjectRecognition = () => {
    if (!isObjectRecognitionOn || !isCameraActive) return;

    const mockProduct = products[Math.floor(Math.random() * products.length)];

    const newProduct: CartItem = {
      ...mockProduct,
      price: 0,
      quantity: 1,
      likes: 0,
      dislikes: 0,
      participants: participants.map(p => p.id),
    };

    setOfflineCart(prev => {
      const existing = prev.find(item => item.id === mockProduct.id);
      if (existing) {
        return prev.map(item =>
          item.id === mockProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, newProduct];
    });

    setShowAddNotification(true);
    setTimeout(() => setShowAddNotification(false), 2000);

    // 계속 인식
    if (isObjectRecognitionOn) {
      setTimeout(() => {
        handleObjectRecognition();
      }, 3000);
    }
  };

  const toggleMic = (id: string) => {
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, isMicOn: !p.isMicOn } : p))
    );
  };

  const updateVolume = (id: string, volume: number) => {
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, volume } : p))
    );
  };

  const handleParticipantRightClick = (
    e: React.MouseEvent,
    id: string
  ) => {
    e.preventDefault();
    setShowVolumeControl(id);
    setVolumeControlPosition({ x: e.clientX, y: e.clientY });
  };

  const updateQuantity = (id: number, delta: number) => {
    setSharedCart(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setSharedCart(prev => prev.filter(item => item.id !== id));
  };

  const addToCart = (product: typeof products[0]) => {
    // 온라인 쇼핑몰에서 장바구니 담기는 무조건 온라인 장바구니에만 추가
    const newItem: CartItem = {
      ...product,
      quantity: 1,
      likes: 0,
      dislikes: 0,
      participants: participants.map(p => p.id),
    };

    setOnlineCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, newItem];
    });

    setShowAddNotification(true);
    setTimeout(() => setShowAddNotification(false), 2000);
  };

  const toggleLike = (id: number) => {
    
    setSharedCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, likes: item.likes + 1 } : item
      )
    );
  };

  const toggleDislike = (id: number) => {
    setSharedCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, dislikes: item.dislikes + 1 } : item
      )
    );
  };

  const toggleParticipant = (itemId: number, participantId: string) => {
    setSharedCart(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const newParticipants = item.participants.includes(participantId)
            ? item.participants.filter(p => p !== participantId)
            : [...item.participants, participantId];
          return { ...item, participants: newParticipants };
        }
        return item;
      })
    );
  };

  const addManualProduct = () => {
    if (!manualProductName.trim()) {
      alert('상품명을 입력해주세요.');
      return;
    }

    const newProduct: CartItem = {
      id: Date.now(),
      name: manualProductName,
      price: 0,
      image:
        'https://readdy.ai/api/search-image?query=Generic%20product%20placeholder%20on%20clean%20white%20minimalist%20background%20simple%20composition&width=300&height=300&seq=' +
        Date.now() +
        '&orientation=squarish',
      quantity: manualQuantity,
      likes: 0,
      dislikes: 0,
      participants: participants.map(p => p.id),
    };

    setOfflineCart(prev => [...prev, newProduct]);
    setShowManualInput(false);
    setManualProductName('');
    setManualQuantity(1);
  };

  // 모바일 음성 입력 시작
  const startMobileVoiceInput = () => {
    setIsMobileVoiceInput(true);
    setMobileVoiceText('듣는 중...');

    // 음성 인식 시뮬레이션
    setTimeout(() => {
      const recognizedText = '바나나'; // 시뮬레이션된 음성 인식 결과
      setMobileVoiceText(recognizedText);
      
      setTimeout(() => {
        // 온라인 상품 데이터베이스에서 검색
        const foundProduct = products.find(p => 
          p.name.toLowerCase().includes(recognizedText.toLowerCase())
        );

        if (foundProduct) {
          // 온라인 상품이면 온라인 장바구니에 추가
          const newProduct: CartItem = {
            ...foundProduct,
            quantity: 1,
            likes: 0,
            dislikes: 0,
            participants: participants.map(p => p.id),
          };

          setOnlineCart(prev => {
            const existing = prev.find(item => item.id === foundProduct.id);
            if (existing) {
              return prev.map(item =>
                item.id === foundProduct.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              );
            }
            return [...prev, newProduct];
          });
        } else {
          // 온라인에 없는 상품이면 가격 미정으로 오프라인 장바구니에 추가
          const newProduct: CartItem = {
            id: Date.now(),
            name: recognizedText,
            price: 0,
            image:
              'https://readdy.ai/api/search-image?query=Generic%20product%20placeholder%20on%20clean%20white%20minimalist%20background%20simple%20composition&width=300&height=300&seq=' +
              Date.now() +
              '&orientation=squarish',
            quantity: 1,
            likes: 0,
            dislikes: 0,
            participants: participants.map(p => p.id),
          };

          setOfflineCart(prev => [...prev, newProduct]);
        }

        setShowAddNotification(true);
        setTimeout(() => setShowAddNotification(false), 2000);

        setIsMobileVoiceInput(false);
        setMobileVoiceText('');
      }, 1500);
    }, 2000);
  };

  const sendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      user: '나',
      text: chatMessage,
      time: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      avatar: '😊',
    };

    setMessages(prev => [...prev, newMessage]);
    setChatMessage('');
  };

  const addVoteOption = () => {
    setNewVoteOptions([...newVoteOptions, '']);
  };

  const updateVoteOption = (index: number, value: string) => {
    const updated = [...newVoteOptions];
    updated[index] = value;
    setNewVoteOptions(updated);
  };

  const removeVoteOption = (index: number) => {
    if (newVoteOptions.length > 2) {
      setNewVoteOptions(newVoteOptions.filter((_, i) => i !== index));
    }
  };

  const createVote = () => {
    if (!newVoteTitle.trim() || newVoteOptions.some(opt => !opt.trim())) {
      alert('제목과 모든 옵션을 입력해주세요.');
      return;
    }

    const newVote: Vote = {
      id: Date.now().toString(),
      question: newVoteTitle,
      options: newVoteOptions.map(text => ({ text, votes: 0 })),
      totalVotes: 0,
      isActive: true,
    };

    setVotes([...votes, newVote]);
    setShowCreateVote(false);
    setNewVoteTitle('');
    setNewVoteOptions(['', '']);
  };

  const toggleVoteStatus = (voteId: string) => {
    
    setVotes(prev =>
      prev.map(v => (v.id === voteId ? { ...v, isActive: !v.isActive } : v))
    );
  };

  const startVoiceSearch = () => {
    setIsVoiceSearching(true);
    setVoiceSearchText('듣는 중...');

    // Simulating voice search
    setTimeout(() => {
      const recognizedText = '사과';
      setVoiceSearchText(recognizedText);
      
      setTimeout(() => {
        const foundProduct = products.find(p => 
          p.name.toLowerCase().includes(recognizedText.toLowerCase())
        );

        if (foundProduct) {
          addToCart(foundProduct);
        } else {
          const newProduct: CartItem = {
            id: Date.now(),
            name: recognizedText,
            price: 0,
            image:
              'https://readdy.ai/api/search-image?query=Generic%20product%20placeholder%20on%20clean%20white%20minimalist%20background%20simple%20composition&width=300&height=300&seq=' +
              Date.now() +
              '&orientation=squarish',
            quantity: 1,
            likes: 0,
            dislikes: 0,
            participants: participants.map(p => p.id),
          };

          setOfflineCart(prev => [...prev, newProduct]);
          setShowAddNotification(true);
          setTimeout(() => setShowAddNotification(false), 2000);
        }

        setIsVoiceSearching(false);
        setVoiceSearchText('');
      }, 1500);
    }, 2000);
  };

  const handleScan = () => {
    const mockProduct =
      products[Math.floor(Math.random() * products.length)];

    const newProduct: CartItem = {
      ...mockProduct,
      price: 0,
      quantity: 1,
      likes: 0,
      dislikes: 0,
      participants: participants.map(p => p.id),
    };

    setOfflineCart(prev => {
      const existing = prev.find(item => item.id === mockProduct.id);
      if (existing) {
        return prev.map(item =>
          item.id === mockProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, newProduct];
    });

    setShowAddNotification(true);
    setTimeout(() => setShowAddNotification(false), 2000);
  };

  // 영수증 등록 버튼 클릭
  const handleReceiptScan = () => {
    setShowReceiptCamera(true);
    setIsOCRScanning(true);

    // OCR 시뮬레이션
    setTimeout(() => {
      // 영수증 인식 시뮬레이션 - 임시 데이터 저장
      const scannedItems = offlineCart.map(item => ({
        ...item,
        price: Math.floor(Math.random() * 20000) + 5000, // 랜덤 가격
        quantity: Math.floor(Math.random() * 3) + 1, // 랜덤 개수
      }));

      setScannedReceiptData(scannedItems);
      setIsOCRScanning(false);
      setShowReceiptCamera(false);

      // 결제자 선택 화면 표시
      setShowPayerSelection(true);
    }, 3000);
  };

  // 결제자 선택 후 확인
  const handleConfirmReceiptPayer = () => {
    if (!selectedReceiptPayer) {
      alert('결제자를 선택해주세요.');
      return;
    }

    if (!scannedReceiptData) return;

    // 결제자 정보를 포함하여 장바구니 업데이트
    setOfflineCart(prev => {
      return scannedReceiptData.map(item => ({
        ...item,
        receiptPayer: selectedReceiptPayer, // 결제자 정보 저장
      }));
    });

    // 상태 초기화
    setScannedReceiptData(null);
    setShowPayerSelection(false);
    setSelectedReceiptPayer('');

    // 성공 알림
    alert('영수증이 등록되었습니다!');
  };

  // 정산 완료
  const handleCompleteSettlement = () => {
    const totalAmount = offlineCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 결제자별로 그룹화
    const payerGroups: Record<string, { totalPaid: number; items: CartItem[] }> = {};
    
    offlineCart.forEach(item => {
      const payerId = item.receiptPayer || 'unknown';
      if (!payerGroups[payerId]) {
        payerGroups[payerId] = { totalPaid: 0, items: [] };
      }
      payerGroups[payerId].totalPaid += item.price * item.quantity;
      payerGroups[payerId].items.push(item);
    });

    // 각 참가자가 각 결제자에게 보내야 할 금액 계산
    const sendToPayerMap: Record<string, Record<string, number>> = {};
    
    participants.forEach(p => {
      sendToPayerMap[p.id] = {};
    });

    offlineCart.forEach(item => {
      const payerId = item.receiptPayer || 'unknown';
      if (item.participants.length > 0) {
        const amountPerPerson = (item.price * item.quantity) / item.participants.length;
        item.participants.forEach(pId => {
          if (pId !== payerId) { // 결제자는 자기 자신에게 보낼 필요 없음
            if (!sendToPayerMap[pId][payerId]) {
              sendToPayerMap[pId][payerId] = 0;
            }
            sendToPayerMap[pId][payerId] += amountPerPerson;
          }
        });
      }
    });

    // 메시지 생성
    let message = `━━━━━ 오프라인 정산 결과 ━━━━━\n\n`;
    message += `💰 총 금액: ${totalAmount.toLocaleString()}원\n\n`;
    
    // 결제자별 정보
    message += `📊 결제자별 영수증:\n`;
    Object.keys(payerGroups).forEach(payerId => {
      const payer = participants.find(p => p.id === payerId);
      const payerName = payer ? `${payer.avatar} ${payer.name}` : '알 수 없음';
      message += `${payerName}: ${payerGroups[payerId].totalPaid.toLocaleString()}원\n`;
    });
    message += `\n`;

    // 송금 내역 표
    message += `💸 송금해야 할 금액:\n`;
    message += `┌─────────────────────────────────┐\n`;
    
    participants.forEach(participant => {
      const sendAmounts = sendToPayerMap[participant.id];
      const hasSendAmount = Object.values(sendAmounts).some(amount => amount > 0);
      
      if (hasSendAmount) {
        message += `│ ${participant.avatar} ${participant.name}\n`;
        Object.keys(sendAmounts).forEach(payerId => {
          const amount = sendAmounts[payerId];
          if (amount > 0) {
            const payer = participants.find(p => p.id === payerId);
            const payerName = payer ? `${payer.avatar} ${payer.name}` : '알 수 없음';
            message += `│  → ${payerName}: ${Math.ceil(amount).toLocaleString()}원\n`;
          }
        });
        message += `│\n`;
      }
    });
    
    message += `└─────────────────────────────────┘\n\n`;
    message += `✅ 정산이 완료되었습니다!`;

    const newMessage: Message = {
      id: Date.now().toString(),
      user: '시스템',
      text: message,
      time: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      avatar: '💰',
    };

    setMessages(prev => [...prev, newMessage]);
    setIsSettlementMode(false);
    setActiveTab('chat');
  };

  // 쇼핑 종료 관련 함수들
  const handleEndShopping = () => {
    setShowEndShoppingModal(true);
    setEndShoppingCountdown(10);

    const countdownInterval = setInterval(() => {
      setEndShoppingCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowEndShoppingModal(false);
          setIsSettlementMode(true);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleContinueShopping = () => {
    setShowEndShoppingModal(false);
    setEndShoppingCountdown(10);
  };

  // 추가된 상태와 함수들
  const settlements = calculateSettlement();
  const totalAmount = onlineCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const cameraOnParticipants = participants.filter(p => p.isCameraOn);

  const createSettlementMessage = () => {
    const settlements = calculateSettlement();
    const payerName = participants.find(p => p.id === selectedPayer)?.name || '결제자';
    
    let message = `━━━━━ 정산 결과 ━━━━━\n\n`;
    message += `💳 결제자: ${payerName}\n`;
    message += `💰 총 금액: ${totalAmount.toLocaleString()}원\n\n`;
    message += `📊 각자 내야 할 금액:\n`;
    
    participants.forEach(participant => {
      const amount = Math.ceil(settlements[participant.id] || 0);
      const isPayer = participant.id === selectedPayer;
      message += `${participant.avatar} ${participant.name}: ${amount.toLocaleString()}원`;
      if (isPayer) {
        message += ' (결제자)';
      }
      message += '\n';
    });
    
    message += `\n━━━━━━━━━━━━━━━\n`;
    message += `✅ 송금이 완료되었습니다!`;
    
    return message;
  };

  const handleSettlementComplete = () => {
    const settlementMessage = createSettlementMessage();
    
    const newMessage: Message = {
      id: Date.now().toString(),
      user: '시스템',
      text: settlementMessage,
      time: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      avatar: '💰',
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsSettlementMode(false);
    setActiveTab('chat');
  };

  // Mobile Offline Shopping Mode UI - 모바일이면 바로 이 화면 표시
  if (isMobile) {
    // 정산 모드
    if (isSettlementMode) {
      return (
        <div className="h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => {
                setIsSettlementMode(false);
                setIsCameraActive(false);
              }}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </button>

            <h1 className="text-lg font-bold text-gray-900">정산하기</h1>

            <div className="w-10"></div>
          </header>

          {/* Receipt Camera View */}
          {showReceiptCamera && (
            <div className="flex-1 relative bg-gray-900">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <i className="ri-camera-line text-6xl mb-4"></i>
                  <p className="text-sm">영수증을 스캔하세요</p>
                  {isOCRScanning && (
                    <p className="text-xs text-emerald-400 mt-2">인식 중...</p>
                  )}
                </div>
              </div>

              {/* Scan Frame */}
              {isOCRScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-72 h-96">
                    <div className="absolute inset-0 border-4 border-emerald-500 rounded-lg opacity-50"></div>
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400 animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowReceiptCamera(false);
                  setIsOCRScanning(false);
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
          )}

          {/* Payer Selection Modal */}
          {showPayerSelection && scannedReceiptData && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">결제자를 선택하세요</h3>
                <p className="text-sm text-gray-600 mb-6">
                  누가 이 영수증의 금액을 결제했나요?
                </p>

                <div className="space-y-2 mb-6">
                  {participants.map(participant => (
                    <label
                      key={participant.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <input
                        type="radio"
                        name="receipt-payer"
                        value={participant.id}
                        checked={selectedReceiptPayer === participant.id}
                        onChange={e => setSelectedReceiptPayer(e.target.value)}
                        className="w-4 h-4 text-emerald-600 cursor-pointer"
                      />
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: participant.color + '20' }}
                      >
                        {participant.avatar}
                      </div>
                      <span className="font-medium text-gray-900">{participant.name}</span>
                    </label>
                  ))}
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6">
                  <p className="text-xs text-emerald-800">
                    💡 영수증에 표시된 총 금액을 결제한 사람을 선택해주세요. 이 정보는 정산 시 사용됩니다.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPayerSelection(false);
                      setScannedReceiptData(null);
                      setSelectedReceiptPayer('');
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer whitespace-nowrap"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConfirmReceiptPayer}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-colors font-medium cursor-pointer whitespace-nowrap"
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settlement Content */}
          {!showReceiptCamera && !showPayerSelection && (
            <div className="flex-1 overflow-y-auto p-4">
              {/* Cart Items */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">장바구니 물품</h3>
                <div className="space-y-2">
                  {offlineCart.map(item => {
                    const payer = participants.find(p => p.id === item.receiptPayer);
                    return (
                      <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex gap-3 mb-3">
                          <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 text-sm mb-2">{item.name}</h5>
                            
                            {payer && (
                              <div className="mb-2 text-xs text-gray-600">
                                💳 결제자: {payer.avatar} {payer.name}
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block">가격</label>
                                <input
                                  type="number"
                                  value={item.price || ''}
                                  onChange={e =>
                                    setOfflineCart(prev =>
                                      prev.map(i =>
                                        i.id === item.id
                                          ? { ...i, price: parseInt(e.target.value) || 0 }
                                          : i
                                      )
                                    )
                                  }
                                  placeholder="0"
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block">개수</label>
                                <input
                                  type="number"
                                  value={item.quantity || ''}
                                  onChange={e =>
                                    setOfflineCart(prev =>
                                      prev.map(i =>
                                        i.id === item.id
                                          ? { ...i, quantity: parseInt(e.target.value) || 1 }
                                          : i
                                      )
                                    )
                                  }
                                  placeholder="1"
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Participant Selection */}
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">결제 인원</p>
                          <div className="space-y-2">
                            {participants.map(participant => (
                              <label
                                key={participant.id}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.participants.includes(participant.id)}
                                  onChange={() => {
                                    setOfflineCart(prev =>
                                      prev.map(i => {
                                        if (i.id === item.id) {
                                          const newParticipants = i.participants.includes(participant.id)
                                            ? i.participants.filter(p => p !== participant.id)
                                            : [...i.participants, participant.id];
                                          return { ...i, participants: newParticipants };
                                        }
                                        return i;
                                      })
                                    );
                                  }}
                                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                                />
                                <span className="text-sm text-gray-700">{participant.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">총 금액</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {offlineCart
                      .reduce((sum, item) => sum + item.price * item.quantity, 0)
                      .toLocaleString()}
                    원
                  </span>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">각자 결제 금액</p>
                  {participants.map(participant => {
                    const amount = offlineCart.reduce((sum, item) => {
                      if (item.participants.includes(participant.id)) {
                        return (
                          sum +
                          (item.price * item.quantity) / item.participants.length
                        );
                      }
                      return sum;
                    }, 0);

                    return (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs text-gray-700">{participant.name}</span>
                        <span className="text-sm font-bold text-gray-900">
                          {Math.ceil(amount).toLocaleString()}원
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Buttons */}
          {!showReceiptCamera && !showPayerSelection && (
            <div className="p-4 border-t border-gray-200 bg-white space-y-2">
              <button
                onClick={handleReceiptScan}
                className="w-full px-4 py-3 bg-white border-2 border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-bold cursor-pointer whitespace-nowrap"
              >
                <i className="ri-camera-line mr-2"></i>
                영수증 등록
              </button>

              <button
                onClick={handleCompleteSettlement}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-colors font-bold cursor-pointer whitespace-nowrap shadow-lg"
              >
                정산 완료
              </button>
            </div>
          )}

          {/* End Shopping Modal - 모바일 UI 내부로 이동 */}
          {showEndShoppingModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-red-600">{endShoppingCountdown}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    오프라인 쇼핑이 {endShoppingCountdown}초 후 종료됩니다
                  </h3>
                  <p className="text-sm text-gray-600">
                    추가할 물품이 있으면 추가하기 버튼을 눌러주세요
                  </p>
                </div>

                <button
                  onClick={handleContinueShopping}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-colors font-bold cursor-pointer whitespace-nowrap shadow-lg"
                >
                  <i className="ri-add-circle-line mr-2"></i>
                  추가하기
                </button>

                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">
                    아무도 추가하지 않으면 자동으로 정산 페이지로 이동합니다
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => window.REACT_APP_NAVIGATE('/')}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line text-xl"></i>
          </button>

          <h1 className="text-lg font-bold text-gray-900">주말 장보기</h1>

          <div className="flex items-center gap-2">
            {/* Camera Toggle */}
            <button
              onClick={toggleMobileCamera}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                isCameraActive
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isCameraActive ? '카메라 끄기' : '카메라 켜기'}
            >
              <i className={`text-xl ${isCameraActive ? 'ri-camera-fill' : 'ri-camera-off-line'}`}></i>
            </button>
          </div>
        </header>

        {/* Camera View */}
        <div className="flex-1 relative bg-gray-900">
          {isCameraActive ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <i className="ri-camera-line text-6xl mb-4"></i>
                <p className="text-sm">카메라 활성화됨</p>
                {isObjectRecognitionOn && (
                  <p className="text-xs text-emerald-400 mt-2">물건 인식 중...</p>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <i className="ri-camera-off-line text-6xl mb-4 opacity-50"></i>
                <p className="text-sm opacity-50">카메라를 켜주세요</p>
              </div>
            </div>
          )}

          {/* Scan Frame (when object recognition is on) */}
          {isObjectRecognitionOn && isCameraActive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-48">
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-lg opacity-50"></div>
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400 animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Instruction Text */}
          {isObjectRecognitionOn && isCameraActive && (
            <div className="absolute bottom-32 left-0 right-0 text-center">
              <p className="text-white text-sm font-medium bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                물건을 프레임 안에 맞춰주세요
              </p>
            </div>
          )}
        </div>

        {/* Bottom Tabs */}
        <div className="bg-white flex-shrink-0 border-t border-gray-200">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'chat'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-chat-3-line mr-1"></i>
              채팅
            </button>
            <button
              onClick={() => setActiveTab('vote')}
              className={`flex-1 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'vote'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-checkbox-multiple-line mr-1"></i>
              투표
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'participants'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-group-line mr-1"></i>
              참가인원
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex-1 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors cursor-pointer relative ${
                activeTab === 'cart'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-shopping-cart-line mr-1"></i>
              <span className="hidden md:inline">장바구니</span>
              {(isMobile ? offlineCart.length : (onlineCart.length + offlineCart.length)) > 0 && (
                <span className="absolute -top-1 right-4 md:right-8 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-50">
                  {isMobile ? offlineCart.length : (onlineCart.length + offlineCart.length)}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="h-64 overflow-y-auto bg-gray-50">
            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.map(message => (
                    <div key={message.id} className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                        {message.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-xs">
                            {message.user}
                          </span>
                          <span className="text-xs text-gray-500">{message.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && sendMessage()}
                      placeholder="메시지 입력..."
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                    />
                    <button
                      onClick={sendMessage}
                      className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-send-plane-fill text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Vote Tab */}
            {activeTab === 'vote' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {votes.map(vote => (
                    <div key={vote.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{vote.question}</h4>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              vote.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            title={vote.isActive ? '진행중' : '종료됨'}
                          ></div>
                        </div>
                        <button
                          onClick={() => toggleVoteStatus(vote.id)}
                          className={`px-2 py-1 text-xs font-medium rounded cursor-pointer whitespace-nowrap ${
                            vote.isActive
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {vote.isActive ? '진행중' : '종료됨'}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {vote.options.map((option, index) => {
                          const percentage =
                            vote.totalVotes > 0 ? (option.votes / vote.totalVotes) * 100 : 0;
                          return (
                            <button
                              key={index}
                              className="w-full text-left cursor-pointer"
                              disabled={!vote.isActive}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                  {option.text}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {option.votes}표 ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                        총 {vote.totalVotes}명 투표
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gray-200 bg-white">
                  <button
                    onClick={() => setShowCreateVote(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-colors font-medium text-xs cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-add-line mr-2"></i>
                    새 투표 만들기
                  </button>
                </div>
              </div>
            )}

            {/* Participants Tab */}
            {activeTab === 'participants' && (
              <div className="p-4 space-y-2">
                {participants.map(participant => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl relative"
                      style={{ backgroundColor: participant.color + '20' }}
                    >
                      {participant.avatar}
                      {participant.isSpeaking && (
                        <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{participant.name}</span>
                        {participant.isHost && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded">
                            호스트
                          </span>
                        )}
                        {participant.isMobile && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded">
                            쇼퍼
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Camera & Mic Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCamera(participant.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          participant.isCameraOn
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <i className={`text-sm ${participant.isCameraOn ? 'ri-vidicon-fill' : 'ri-vidicon-off-fill'}`}></i>
                      </button>

                      <button
                        onClick={() => toggleMic(participant.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          participant.isMicOn
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        <i className={`text-sm ${participant.isMicOn ? 'ri-mic-fill' : 'ri-mic-off-fill'}`}></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cart Tab - 오프라인 장바구니만 표시 */}
            {activeTab === 'cart' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">오프라인 장바구니</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowManualInput(true)}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap shadow-sm"
                      >
                        <i className="ri-add-line mr-1"></i>
                        수동 입력
                      </button>
                      <button
                        onClick={startMobileVoiceInput}
                        disabled={isMobileVoiceInput}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap shadow-sm ${
                          isMobileVoiceInput
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600'
                        }`}
                      >
                        <i className={`${isMobileVoiceInput ? 'ri-mic-fill' : 'ri-mic-line'} mr-1`}></i>
                        {isMobileVoiceInput ? mobileVoiceText : '음성'}
                      </button>
                    </div>
                  </div>

                  {offlineCart.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <i className="ri-shopping-bag-line text-2xl text-gray-400"></i>
                      </div>
                      <p className="text-gray-500 text-xs">장바구니가 비어있습니다</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {offlineCart.map(item => (
                        <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                          <div className="flex gap-3">
                            <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 text-sm mb-1 truncate">
                                {item.name}
                              </h5>
                              <p className="text-emerald-600 font-bold text-xs mb-2">
                                가격 미정
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-white rounded">
                                  <button
                                    onClick={() => {
                                      setOfflineCart(prev =>
                                        prev.map(i =>
                                          i.id === item.id
                                            ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                                            : i
                                        )
                                      );
                                    }}
                                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-emerald-600 cursor-pointer"
                                  >
                                    <i className="ri-subtract-line text-sm"></i>
                                  </button>
                                  <span className="w-6 text-center text-xs font-medium">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setOfflineCart(prev =>
                                        prev.map(i =>
                                          i.id === item.id
                                            ? { ...i, quantity: i.quantity + 1 }
                                            : i
                                        )
                                      );
                                    }}
                                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-emerald-600 cursor-pointer"
                                  >
                                    <i className="ri-add-line text-sm"></i>
                                  </button>
                                </div>

                                <button
                                  onClick={() => {
                                    setOfflineCart(prev => prev.filter(i => i.id !== item.id));
                                  }}
                                  className="ml-auto w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                >
                                  <i className="ri-delete-bin-line text-xs"></i>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Like/Dislike & Participant Selection */}
                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setOfflineCart(prev =>
                                    prev.map(i =>
                                      i.id === item.id ? { ...i, likes: i.likes + 1 } : i
                                    )
                                  );
                                }}
                                className="flex items-center gap-1 px-2 py-1 bg-white rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                              >
                                <i className="ri-thumb-up-line text-emerald-600 text-xs"></i>
                                <span className="text-xs font-medium text-gray-700">{item.likes}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOfflineCart(prev =>
                                    prev.map(i =>
                                      i.id === item.id ? { ...i, dislikes: i.dislikes + 1 } : i
                                    )
                                  );
                                }}
                                className="flex items-center gap-1 px-2 py-1 bg-white rounded hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <i className="ri-thumb-down-line text-red-600 text-xs"></i>
                                <span className="text-xs font-medium text-gray-700">{item.dislikes}</span>
                              </button>
                            </div>

                            <button
                              onClick={() =>
                                setShowParticipantSelect(
                                  showParticipantSelect === item.id ? null : item.id
                                )
                              }
                              className="flex items-center gap-1 px-2 py-1 bg-white rounded hover:bg-blue-50 transition-colors cursor-pointer border border-gray-200"
                              title="정산 인원 선택"
                            >
                              <i className="ri-group-line text-blue-600 text-xs"></i>
                              <span className="text-xs font-medium text-gray-700">{item.participants.length}</span>
                            </button>
                          </div>

                          {/* Participant Selection Dropdown */}
                          {showParticipantSelect === item.id && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                              <p className="text-xs font-medium text-gray-700 mb-2">
                                정산 인원 선택
                              </p>
                              <div className="space-y-2">
                                {participants.map(participant => (
                                  <label
                                    key={participant.id}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={item.participants.includes(participant.id)}
                                      onChange={() => {
                                        setOfflineCart(prev =>
                                          prev.map(i => {
                                            if (i.id === item.id) {
                                              const newParticipants = i.participants.includes(participant.id)
                                                ? i.participants.filter(p => p !== participant.id)
                                                : [...i.participants, participant.id];
                                              return { ...i, participants: newParticipants };
                                            }
                                            return i;
                                          })
                                        );
                                      }}
                                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700">{participant.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 쇼핑 종료 버튼 */}
                {offlineCart.length > 0 && (
                  <div className="p-3 border-t border-gray-200 bg-white">
                    <button
                      onClick={handleEndShopping}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-bold cursor-pointer whitespace-nowrap shadow-lg"
                    >
                      <i className="ri-stop-circle-line mr-2"></i>
                      쇼핑 종료
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              {/* Object Recognition Toggle */}
              <button
                onClick={() => toggleObjectRecognition()}
                disabled={!isCameraActive}
                className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                  isObjectRecognitionOn
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                    : isCameraActive
                    ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-emerald-500 hover:text-emerald-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <i className={`mr-2 ${isObjectRecognitionOn ? 'ri-scan-2-fill' : 'ri-scan-2-line'}`}></i>
                {isObjectRecognitionOn ? '인식 중...' : '물건 인식'}
              </button>
            </div>

            {isCameraActive && !isObjectRecognitionOn && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                <i className="ri-information-line text-emerald-600 text-xs"></i>
                <span className="text-xs text-emerald-700">
                  물건 인식 기능을 켜면 자동으로 상품이 추가됩니다
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Create Vote Modal */}
        {showCreateVote && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">새 투표 만들기</h3>
                  <button
                    onClick={() => {
                      setShowCreateVote(false);
                      setNewVoteTitle('');
                      setNewVoteOptions(['', '']);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      투표 제목
                    </label>
                    <input
                      type="text"
                      value={newVoteTitle}
                      onChange={e => setNewVoteTitle(e.target.value)}
                      placeholder="투표 제목을 입력하세요"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      선택지
                    </label>
                    <div className="space-y-2">
                      {newVoteOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={e => updateVoteOption(index, e.target.value)}
                            placeholder={`옵션 ${index + 1}`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                          />
                          {newVoteOptions.length > 2 && (
                            <button
                              onClick={() => removeVoteOption(index)}
                              className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <i className="ri-delete-bin-line text-sm"></i>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addVoteOption()}
                      className="mt-3 w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-add-line mr-2"></i>
                      옵션 추가
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateVote(false);
                      setNewVoteTitle('');
                      setNewVoteOptions(['', '']);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer whitespace-nowrap"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => createVote()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-colors font-medium cursor-pointer whitespace-nowrap"
                  >
                    만들기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Volume Control Modal */}
        {showVolumeControl && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowVolumeControl(null)}
            ></div>
            <div
              className="fixed z-50 bg-white rounded-lg shadow-2xl p-4 w-64"
              style={{
                left: `${volumeControlPosition.x}px`,
                top: `${volumeControlPosition.y}px`,
                transform: 'translate(-50%, -10px)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">음량 조절</span>
                <button
                  onClick={() => setShowVolumeControl(null)}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-sm"></i>
                </button>
              </div>
              {participants
                .filter(p => p.id === showVolumeControl)
                .map(participant => (
                  <div key={participant.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ri-volume-up-line text-emerald-600"></i>
                      <span className="text-sm text-gray-700">{participant.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <i className="ri-volume-down-line text-gray-400 text-sm"></i>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={participant.volume}
                        onChange={e => updateVolume(participant.id, parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <i className="ri-volume-up-line text-gray-400 text-sm"></i>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-lg font-bold text-emerald-600">{participant.volume}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* Manual Input Modal - 모바일용 */}
        {showManualInput && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">수동 입력</h3>
                <button
                  onClick={() => {
                    setShowManualInput(false);
                    setManualProductName('');
                    setManualQuantity(1);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품명
                  </label>
                  <input
                    type="text"
                    value={manualProductName}
                    onChange={e => setManualProductName(e.target.value)}
                    placeholder="상품명을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    개수
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setManualQuantity(Math.max(1, manualQuantity - 1))}
                      className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <i className="ri-subtract-line text-lg text-gray-600"></i>
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-bold text-gray-900">{manualQuantity}</span>
                    </div>
                    <button
                      onClick={() => setManualQuantity(manualQuantity + 1)}
                      className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <i className="ri-add-line text-lg text-gray-600"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowManualInput(false);
                    setManualProductName('');
                    setManualQuantity(1);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer whitespace-nowrap"
                >
                  취소
                </button>
                <button
                  onClick={() => addManualProduct()}
                  className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium cursor-pointer whitespace-nowrap"
                >
                  등록하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => window.REACT_APP_NAVIGATE('/')}
              className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </button>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-red-50 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs md:text-sm font-bold text-red-600">LIVE</span>
              </div>
              <h1 className="text-base md:text-lg font-bold text-gray-900">주말 장보기</h1>
            </div>
          </div>

          {/* Participants Avatars */}
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-2">
              {participants.map(participant => (
                <div
                  key={participant.id}
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xl shadow-sm"
                  style={{ backgroundColor: participant.color + '20' }}
                  title={participant.name}
                >
                  {participant.avatar}
                </div>
              ))}
            </div>

            <div className="text-sm font-medium text-gray-600">
              {participants.length}명 참여중
            </div>
          </div>

          {/* Mode Toggle & Exit */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setViewMode('host')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  viewMode === 'host'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                호스트
              </button>
              <button
                onClick={() => setViewMode('personal')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  viewMode === 'personal'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                개인
              </button>
            </div>

            <button
              onClick={() => window.REACT_APP_NAVIGATE('/')}
              className="px-3 md:px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-xs md:text-sm whitespace-nowrap cursor-pointer"
            >
              나가기
            </button>
          </div>
        </div>
      </header>

      {/* Add to Cart Notification */}
      {showAddNotification && (
        <div className="fixed top-20 right-4 bg-emerald-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center gap-2">
            <i className="ri-check-line text-lg md:text-xl"></i>
            <span className="font-medium text-sm md:text-base">장바구니에 추가되었습니다</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Host Screen Share */}
        <div className="flex-1 bg-gray-900 relative overflow-hidden">
          {viewMode === 'host' ? (
            <div className="w-full h-full relative">
              {/* Host Screen with Products */}
              <div className="absolute inset-0 overflow-y-auto p-3 md:p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                  {products.slice(0, 9).map(product => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="relative w-full h-32 md:h-40 bg-gray-50">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="p-2 md:p-3">
                        <h4 className="font-medium text-gray-900 text-xs md:text-sm mb-1 line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-emerald-600 font-bold text-sm md:text-base mb-2">
                          {product.price.toLocaleString()}원
                        </p>
                        <button
                          onClick={() => addToCart(product)}
                          className="w-full px-2 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-bold cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-shopping-cart-line text-sm md:text-base"></i>
                          <span className="hidden md:inline">장바구니 담기</span>
                          <span className="md:hidden">담기</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cursors */}
              {participants.filter(p => !p.isHost).map((participant, index) => (
                <div
                  key={participant.id}
                  className="absolute pointer-events-none transition-all duration-150"
                  style={{
                    left: `${20 + index * 15}%`,
                    top: `${30 + index * 10}%`,
                  }}
                >
                  <div className="relative">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={participant.color}>
                      <path d="M5 3L19 12L12 13L8 19L5 3Z" />
                    </svg>
                    <div
                      className="absolute left-6 top-0 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap shadow-lg"
                      style={{ backgroundColor: participant.color }}
                    >
                      {participant.name}
                    </div>
                  </div>
                </div>
              ))}

              {/* Top Left - Participant Profiles with Voice/Camera Indicators */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {participants.map(participant => (
                  <div key={participant.id} className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-4 transition-all ${
                        participant.isSpeaking
                          ? 'border-green-400 animate-pulse shadow-lg shadow-green-400/50'
                          : participant.isCameraOn
                          ? 'border-blue-400 shadow-md'
                          : 'border-white/30'
                      }`}
                      style={{ backgroundColor: participant.color + '40' }}
                    >
                      {participant.avatar}
                    </div>
                    {participant.isHost && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                        <i className="ri-vip-crown-fill text-xs text-white"></i>
                      </div>
                    )}
                    {!participant.isMicOn && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <i className="ri-mic-off-fill text-xs text-white"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom - Camera Feeds */}
              {cameraOnParticipants.length > 0 && (
                <div className="absolute bottom-4 left-4 flex gap-3">
                  {cameraOnParticipants.slice(0, 3).map(participant => (
                    <div
                      key={participant.id}
                      className="relative w-40 h-28 bg-gray-800 rounded-lg overflow-hidden border-2 shadow-lg"
                      style={{ borderColor: participant.color }}
                    >
                      {/* Camera Feed Placeholder */}
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {participant.avatar}
                      </div>

                      {/* Name Label */}
                      <div
                        className="absolute bottom-0 left-0 right-0 px-2 py-1 text-white text-xs font-medium text-center"
                        style={{ backgroundColor: participant.color + 'CC' }}
                      >
                        {participant.name}
                      </div>

                      {/* Mic Status */}
                      {!participant.isMicOn && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <i className="ri-mic-off-fill text-xs text-white"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Top Right - Voice Search & Host Mode Label */}
              <div className="absolute top-4 right-4 flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => startVoiceSearch()}
                  className={`px-3 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm whitespace-nowrap cursor-pointer transition-all ${
                    isVoiceSearching
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white'
                  }`}
                >
                  <i className={`mr-1 md:mr-2 ${isVoiceSearching ? 'ri-mic-fill' : 'ri-mic-line'}`}></i>
                  <span className="hidden md:inline">{isVoiceSearching ? voiceSearchText : '음성 검색'}</span>
                  <span className="md:hidden">🎤</span>
                </button>

                <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-sm font-medium rounded-lg">
                  <i className="ri-eye-line mr-2"></i>
                  호스트 화면 공유중
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full">
              {/* Personal Shopping View */}
              <div className="absolute inset-0 overflow-y-auto p-3 md:p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                  {products.slice(0, 12).map(product => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="relative w-full h-32 md:h-40 bg-gray-50">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="p-2 md:p-3">
                        <h4 className="font-medium text-gray-900 text-xs md:text-sm mb-1 line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-emerald-600 font-bold text-sm md:text-base mb-2">
                          {product.price.toLocaleString()}원
                        </p>
                        <button
                          onClick={() => addToCart(product)}
                          className="w-full px-2 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-bold cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-shopping-cart-line text-sm md:text-base"></i>
                          <span className="hidden md:inline">장바구니 담기</span>
                          <span className="md:hidden">담기</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Left - Participant Profiles */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {participants.map(participant => (
                  <div key={participant.id} className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-4 transition-all ${
                        participant.isSpeaking
                          ? 'border-green-400 animate-pulse shadow-lg shadow-green-400/50'
                          : participant.isCameraOn
                          ? 'border-blue-400 shadow-md'
                          : 'border-white/30'
                      }`}
                      style={{ backgroundColor: participant.color + '40' }}
                    >
                      {participant.avatar}
                    </div>
                    {participant.isHost && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                        <i className="ri-vip-crown-fill text-xs text-white"></i>
                      </div>
                    )}
                    {!participant.isMicOn && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <i className="ri-mic-off-fill text-xs text-white"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom - Camera Feeds */}
              {cameraOnParticipants.length > 0 && (
                <div className="absolute bottom-4 left-4 flex gap-3">
                  {cameraOnParticipants.slice(0, 3).map(participant => (
                    <div
                      key={participant.id}
                      className="relative w-40 h-28 bg-gray-800 rounded-lg overflow-hidden border-2 shadow-lg"
                      style={{ borderColor: participant.color }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {participant.avatar}
                      </div>

                      <div
                        className="absolute bottom-0 left-0 right-0 px-2 py-1 text-white text-xs font-medium text-center"
                        style={{ backgroundColor: participant.color + 'CC' }}
                      >
                        {participant.name}
                      </div>

                      {!participant.isMicOn && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <i className="ri-mic-off-fill text-xs text-white"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Top Right - Voice Search & Personal Mode Label */}
              <div className="absolute top-4 right-4 flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => startVoiceSearch()}
                  className={`px-3 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm whitespace-nowrap cursor-pointer transition-all ${
                    isVoiceSearching
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white'
                  }`}
                >
                  <i className={`mr-1 md:mr-2 ${isVoiceSearching ? 'ri-mic-fill' : 'ri-mic-line'}`}></i>
                  {isVoiceSearching ? voiceSearchText : '음성 검색'}
                </button>

                <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-sm font-medium rounded-lg">
                  <i className="ri-user-line mr-2"></i>
                  개인 쇼핑 모드
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Tabs */}
        <div className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'chat'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-chat-3-line mr-1"></i>
              채팅
            </button>
            <button
              onClick={() => setActiveTab('vote')}
              className={`flex-1 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'vote'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-checkbox-multiple-line mr-1"></i>
              투표
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'participants'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-group-line mr-1"></i>
              <span className="hidden md:inline">참여자</span>
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex-1 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors cursor-pointer relative ${
                activeTab === 'cart'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-shopping-cart-line mr-1"></i>
              <span className="hidden md:inline">장바구니</span>
              {(isMobile ? offlineCart.length : (onlineCart.length + offlineCart.length)) > 0 && (
                <span className="absolute -top-1 right-4 md:right-8 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-50">
                  {isMobile ? offlineCart.length : (onlineCart.length + offlineCart.length)}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(message => (
                    <div key={message.id} className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                        {message.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-xs">
                            {message.user}
                          </span>
                          <span className="text-xs text-gray-500">{message.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && sendMessage()}
                      placeholder="메시지를 입력하세요..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                    />
                    <button
                      onClick={() => sendMessage()}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-send-plane-fill"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Vote Tab */}
            {activeTab === 'vote' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {votes.map(vote => (
                    <div key={vote.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{vote.question}</h4>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              vote.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            title={vote.isActive ? '진행중' : '종료됨'}
                          ></div>
                        </div>
                        <button
                          onClick={() => toggleVoteStatus(vote.id)}
                          className={`px-2 py-1 text-xs font-medium rounded cursor-pointer whitespace-nowrap ${
                            vote.isActive
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {vote.isActive ? '진행중' : '종료됨'}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {vote.options.map((option, index) => {
                          const percentage =
                            vote.totalVotes > 0 ? (option.votes / vote.totalVotes) * 100 : 0;
                          return (
                            <button
                              key={index}
                              className="w-full text-left cursor-pointer"
                              disabled={!vote.isActive}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                  {option.text}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {option.votes}표 ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                        총 {vote.totalVotes}명 투표
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-200 bg-white">
                  <button
                    onClick={() => setShowCreateVote(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-colors font-medium text-xs cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-add-line mr-2"></i>
                    새 투표 만들기
                  </button>
                </div>
              </div>
            )}

            {/* Participants Tab */}
            {activeTab === 'participants' && (
              <div className="p-4 space-y-2">
                {participants.map(participant => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg relative"
                    onContextMenu={e => handleParticipantRightClick(e, participant.id)}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl relative"
                      style={{ backgroundColor: participant.color + '20' }}
                    >
                      {participant.avatar}
                      {participant.isSpeaking && (
                        <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{participant.name}</span>
                        {participant.isHost && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded">
                            호스트
                          </span>
                        )}
                        {participant.isMobile && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded">
                            쇼퍼
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>온라인</span>
                      </div>
                    </div>

                    {/* Camera & Mic Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCamera(participant.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          participant.isCameraOn
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title={participant.isCameraOn ? '카메라 끄기' : '카메라 켜기'}
                      >
                        <i className={`text-sm ${participant.isCameraOn ? 'ri-vidicon-fill' : 'ri-vidicon-off-fill'}`}></i>
                      </button>

                      <button
                        onClick={() => toggleMic(participant.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          participant.isMicOn
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        title={participant.isMicOn ? '마이크 끄기' : '마이크 켜기'}
                      >
                        <i className={`text-sm ${participant.isMicOn ? 'ri-mic-fill' : 'ri-mic-off-fill'}`}></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cart Tab */}
            {activeTab === 'cart' && (
              <div className="h-full flex flex-col">
                {/* Cart Type Toggle */}
                <div className="p-3 border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setCartType('online')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        cartType === 'online'
                          ? 'bg-white text-emerald-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <i className="ri-shopping-cart-line mr-1"></i>
                      온라인 장바구니
                    </button>
                    <button
                      onClick={() => setCartType('offline')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        cartType === 'offline'
                          ? 'bg-white text-emerald-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <i className="ri-store-line mr-1"></i>
                      오프라인 장바구니
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {/* Online Cart */}
                  {cartType === 'online' && (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900">온라인 장바구니</h3>
                      </div>

                      {onlineCart.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <i className="ri-shopping-bag-line text-2xl text-gray-400"></i>
                          </div>
                          <p className="text-gray-500 text-xs">장바구니가 비어있습니다</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2 mb-3">
                            {onlineCart.map(item => (
                              <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                <div className="flex gap-3">
                                  <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover object-top"
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-900 text-sm mb-1 truncate">
                                      {item.name}
                                    </h5>
                                    <p className="text-emerald-600 font-bold text-xs mb-2">
                                      {item.price.toLocaleString()}원
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1 bg-white rounded">
                                        <button
                                          onClick={() => {
                                            setOnlineCart(prev =>
                                              prev.map(i =>
                                                i.id === item.id
                                                  ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                                                  : i
                                              )
                                            );
                                          }}
                                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-emerald-600 cursor-pointer"
                                        >
                                          <i className="ri-subtract-line text-sm"></i>
                                        </button>
                                        <span className="w-6 text-center text-xs font-medium">
                                          {item.quantity}
                                        </span>
                                        <button
                                          onClick={() => {
                                            setOnlineCart(prev =>
                                              prev.map(i =>
                                                i.id === item.id
                                                  ? { ...i, quantity: i.quantity + 1 }
                                                  : i
                                              )
                                            );
                                          }}
                                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-emerald-600 cursor-pointer"
                                        >
                                          <i className="ri-add-line text-sm"></i>
                                        </button>
                                      </div>

                                      <button
                                        onClick={() => {
                                          setOnlineCart(prev => prev.filter(i => i.id !== item.id));
                                        }}
                                        className="ml-auto w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                      >
                                        <i className="ri-delete-bin-line text-xs"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Like/Dislike & Participant Selection */}
                                <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setOnlineCart(prev =>
                                          prev.map(i =>
                                            i.id === item.id ? { ...i, likes: i.likes + 1 } : i
                                          )
                                        );
                                      }}
                                      className="flex items-center gap-1 px-2 py-1 bg-white rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                                    >
                                      <i className="ri-thumb-up-line text-emerald-600 text-xs"></i>
                                      <span className="text-xs font-medium text-gray-700">{item.likes}</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setOnlineCart(prev =>
                                          prev.map(i =>
                                            i.id === item.id ? { ...i, dislikes: i.dislikes + 1 } : i
                                          )
                                        );
                                      }}
                                      className="flex items-center gap-1 px-2 py-1 bg-white rounded hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                      <i className="ri-thumb-down-line text-red-600 text-xs"></i>
                                      <span className="text-xs font-medium text-gray-700">{item.dislikes}</span>
                                    </button>
                                  </div>

                                  <button
                                    onClick={() =>
                                      setShowParticipantSelect(
                                        showParticipantSelect === item.id ? null : item.id
                                      )
                                    }
                                    className="flex items-center gap-1 px-2 py-1 bg-white rounded hover:bg-blue-50 transition-colors cursor-pointer border border-gray-200"
                                    title="정산 인원 선택"
                                  >
                                    <i className="ri-group-line text-blue-600 text-xs"></i>
                                    <span className="text-xs font-medium text-gray-700">{item.participants.length}</span>
                                  </button>
                                </div>

                                {/* Participant Selection Dropdown */}
                                {showParticipantSelect === item.id && (
                                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                                    <p className="text-xs font-medium text-gray-700 mb-2">
                                      정산 인원 선택
                                    </p>
                                    <div className="space-y-2">
                                      {participants.map(participant => (
                                        <label
                                          key={participant.id}
                                          className="flex items-center gap-2 cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={item.participants.includes(participant.id)}
                                            onChange={() => {
                                              setOnlineCart(prev =>
                                                prev.map(i => {
                                                  if (i.id === item.id) {
                                                    const newParticipants = i.participants.includes(participant.id)
                                                      ? i.participants.filter(p => p !== participant.id)
                                                      : [...i.participants, participant.id];
                                                    return { ...i, participants: newParticipants };
                                                  }
                                                  return i;
                                                })
                                              );
                                            }}
                                            className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                                          />
                                          <span className="text-sm text-gray-700">{participant.name}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Settlement Button */}
                          <button
                            onClick={() => setShowSettlement(true)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-colors font-bold cursor-pointer whitespace-nowrap shadow-lg"
                          >
                            <i className="ri-money-dollar-circle-line mr-2"></i>
                            정산하기
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {/* Offline Cart */}
                  {cartType === 'offline' && (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900">오프라인 장바구니</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowManualInput(true)}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap shadow-sm"
                          >
                            <i className="ri-add-line mr-1"></i>
                            수동 입력
                          </button>
                          <button
                            onClick={() => startVoiceSearch()}
                            disabled={isVoiceSearching}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap shadow-sm ${
                              isVoiceSearching
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-emerald-500 text-white hover:bg-emerald-600'
                            }`}
                          >
                            <i className={`${isVoiceSearching ? 'ri-mic-fill' : 'ri-mic-line'} mr-1`}></i>
                            {isVoiceSearching ? voiceSearchText : '음성'}
                          </button>
                        </div>
                      </div>

                      {offlineCart.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <i className="ri-shopping-bag-line text-2xl text-gray-400"></i>
                          </div>
                          <p className="text-gray-500 text-xs">장바구니가 비어있습니다</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {offlineCart.map(item => (
                            <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                              <div className="flex gap-3">
                                <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover object-top"
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-gray-900 text-sm mb-1 truncate">
                                    {item.name}
                                  </h5>
                                  <p className="text-amber-600 font-bold text-xs mb-2">
                                    가격 미정
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-white rounded">
                                      <button
                                        onClick={() => {
                                          setOfflineCart(prev =>
                                            prev.map(i =>
                                              i.id === item.id
                                                ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                                                : i
                                            )
                                          );
                                        }}
                                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-emerald-600 cursor-pointer"
                                      >
                                        <i className="ri-subtract-line text-sm"></i>
                                      </button>
                                      <span className="w-6 text-center text-xs font-medium">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() => {
                                          setOfflineCart(prev =>
                                            prev.map(i =>
                                              i.id === item.id
                                                ? { ...i, quantity: i.quantity + 1 }
                                                : i
                                            )
                                          );
                                        }}
                                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-emerald-600 cursor-pointer"
                                      >
                                        <i className="ri-add-line text-sm"></i>
                                      </button>
                                    </div>

                                    <button
                                      onClick={() => {
                                        setOfflineCart(prev => prev.filter(i => i.id !== item.id));
                                      }}
                                      className="ml-auto w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                    >
                                      <i className="ri-delete-bin-line text-xs"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Like/Dislike & Participant Selection */}
                              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setOfflineCart(prev =>
                                        prev.map(i =>
                                          i.id === item.id ? { ...i, likes: i.likes + 1 } : i
                                        )
                                      );
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 bg-white rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                                  >
                                    <i className="ri-thumb-up-line text-emerald-600 text-xs"></i>
                                    <span className="text-xs font-medium text-gray-700">{item.likes}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOfflineCart(prev =>
                                        prev.map(i =>
                                          i.id === item.id ? { ...i, dislikes: i.dislikes + 1 } : i
                                        )
                                      );
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 bg-white rounded hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <i className="ri-thumb-down-line text-red-600 text-xs"></i>
                                    <span className="text-xs font-medium text-gray-700">{item.dislikes}</span>
                                  </button>
                                </div>

                                <button
                                  onClick={() =>
                                    setShowParticipantSelect(
                                      showParticipantSelect === item.id ? null : item.id
                                    )
                                  }
                                  className="flex items-center gap-1 px-2 py-1 bg-white rounded hover:bg-blue-50 transition-colors cursor-pointer border border-gray-200"
                                  title="정산 인원 선택"
                                >
                                  <i className="ri-group-line text-blue-600 text-xs"></i>
                                  <span className="text-xs font-medium text-gray-700">{item.participants.length}</span>
                                </button>
                              </div>

                              {/* Participant Selection Dropdown */}
                              {showParticipantSelect === item.id && (
                                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                                  <p className="text-xs font-medium text-gray-700 mb-2">
                                    정산 인원 선택
                                  </p>
                                  <div className="space-y-2">
                                    {participants.map(participant => (
                                      <label
                                        key={participant.id}
                                        className="flex items-center gap-2 cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={item.participants.includes(participant.id)}
                                          onChange={() => {
                                            setOfflineCart(prev =>
                                              prev.map(i => {
                                                if (i.id === item.id) {
                                                  const newParticipants = i.participants.includes(participant.id)
                                                    ? i.participants.filter(p => p !== participant.id)
                                                    : [...i.participants, participant.id];
                                                  return { ...i, participants: newParticipants };
                                                }
                                                return i;
                                              })
                                            );
                                          }}
                                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-700">{participant.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              {/* Object Recognition Toggle */}
              <button
                onClick={() => toggleObjectRecognition()}
                disabled={!isCameraActive}
                className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                  isObjectRecognitionOn
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                    : isCameraActive
                    ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-emerald-500 hover:text-emerald-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <i className={`mr-2 ${isObjectRecognitionOn ? 'ri-scan-2-fill' : 'ri-scan-2-line'}`}></i>
                {isObjectRecognitionOn ? '인식 중...' : '물건 인식'}
              </button>
            </div>

            {isCameraActive && !isObjectRecognitionOn && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                <i className="ri-information-line text-emerald-600 text-xs"></i>
                <span className="text-xs text-emerald-700">
                  물건 인식 기능을 켜면 자동으로 상품이 추가됩니다
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Create Vote Modal */}
        {showCreateVote && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">새 투표 만들기</h3>
                  <button
                    onClick={() => {
                      setShowCreateVote(false);
                      setNewVoteTitle('');
                      setNewVoteOptions(['', '']);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      투표 제목
                    </label>
                    <input
                      type="text"
                      value={newVoteTitle}
                      onChange={e => setNewVoteTitle(e.target.value)}
                      placeholder="투표 제목을 입력하세요"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      선택지
                    </label>
                    <div className="space-y-2">
                      {newVoteOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={e => updateVoteOption(index, e.target.value)}
                            placeholder={`옵션 ${index + 1}`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                          />
                          {newVoteOptions.length > 2 && (
                            <button
                              onClick={() => removeVoteOption(index)}
                              className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <i className="ri-delete-bin-line text-sm"></i>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addVoteOption()}
                      className="mt-3 w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-add-line mr-2"></i>
                      옵션 추가
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateVote(false);
                      setNewVoteTitle('');
                      setNewVoteOptions(['', '']);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer whitespace-nowrap"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => createVote()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-colors font-medium cursor-pointer whitespace-nowrap"
                  >
                    만들기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Volume Control Modal */}
        {showVolumeControl && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowVolumeControl(null)}
            ></div>
            <div
              className="fixed z-50 bg-white rounded-lg shadow-2xl p-4 w-64"
              style={{
                left: `${volumeControlPosition.x}px`,
                top: `${volumeControlPosition.y}px`,
                transform: 'translate(-50%, -10px)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">음량 조절</span>
                <button
                  onClick={() => setShowVolumeControl(null)}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-sm"></i>
                </button>
              </div>
              {participants
                .filter(p => p.id === showVolumeControl)
                .map(participant => (
                  <div key={participant.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ri-volume-up-line text-emerald-600"></i>
                      <span className="text-sm text-gray-700">{participant.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <i className="ri-volume-down-line text-gray-400 text-sm"></i>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={participant.volume}
                        onChange={e => updateVolume(participant.id, parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <i className="ri-volume-up-line text-gray-400 text-sm"></i>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-lg font-bold text-emerald-600">{participant.volume}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* Manual Input Modal */}
        {showManualInput && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">수동 입력</h3>
                <button
                  onClick={() => {
                    setShowManualInput(false);
                    setManualProductName('');
                    setManualQuantity(1);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품명
                  </label>
                  <input
                    type="text"
                    value={manualProductName}
                    onChange={e => setManualProductName(e.target.value)}
                    placeholder="상품명을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    개수
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setManualQuantity(Math.max(1, manualQuantity - 1))}
                      className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <i className="ri-subtract-line text-lg text-gray-600"></i>
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-bold text-gray-900">{manualQuantity}</span>
                    </div>
                    <button
                      onClick={() => setManualQuantity(manualQuantity + 1)}
                      className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <i className="ri-add-line text-lg text-gray-600"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowManualInput(false);
                    setManualProductName('');
                    setManualQuantity(1);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer whitespace-nowrap"
                >
                  취소
                </button>
                <button
                  onClick={() => addManualProduct()}
                  className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium cursor-pointer whitespace-nowrap"
                >
                  등록하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settlement Modal */}
        {showSettlement && cartType === 'online' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">정산하기</h3>
                  <button
                    onClick={() => setShowSettlement(false)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">총 금액</span>
                      <span className="text-xl font-bold text-emerald-600">
                        {totalAmount.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">각 참여자별 결제 금액</p>
                    <div className="space-y-2">
                      {participants.map(participant => {
                        const amount = settlements[participant.id] || 0;
                        return (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                                style={{ backgroundColor: participant.color + '20' }}
                              >
                                {participant.avatar}
                              </div>
                              <span className="font-medium text-gray-900">{participant.name}</span>
                            </div>
                            <span className="font-bold text-emerald-600">
                              {Math.ceil(amount).toLocaleString()}원
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">결제자 선택</p>
                    <div className="space-y-2">
                      {participants.map(participant => (
                        <label
                          key={participant.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <input
                            type="radio"
                            name="payer"
                            value={participant.id}
                            checked={selectedPayer === participant.id}
                            onChange={e => setSelectedPayer(e.target.value)}
                            className="w-4 h-4 text-emerald-600 cursor-pointer"
                          />
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                            style={{ backgroundColor: participant.color + '20' }}
                          >
                            {participant.avatar}
                          </div>
                          <span className="font-medium text-gray-900">{participant.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!selectedPayer) {
                      alert('결제자를 선택해주세요.');
                      return;
                    }
                    setShowQRCode(true);
                  }}
                  disabled={!selectedPayer}
                  className={`w-full px-4 py-3 rounded-lg font-bold cursor-pointer whitespace-nowrap transition-all ${
                    selectedPayer
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  결제자에게 송금하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">송금 QR 코드</h3>
                <button
                  onClick={() => handleSettlementComplete()}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="text-center">
                {selectedPayer && (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">결제자</p>
                      <p className="text-lg font-bold text-gray-900">
                        {participants.find(p => p.id === selectedPayer)?.name}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">내 결제 금액</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {Math.ceil(settlements['1'] || 0).toLocaleString()}원
                      </p>
                    </div>

                    <div className="w-64 h-64 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <i className="ri-qr-code-line text-6xl text-gray-400 mb-2"></i>
                        <p className="text-sm text-gray-500">QR 코드</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-4">
                      QR 코드를 스캔하여 송금해주세요
                    </p>

                    <button
                      onClick={() => handleSettlementComplete()}
                      className="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-bold cursor-pointer whitespace-nowrap"
                    >
                      송금 완료
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* End Shopping Modal */}
        {showEndShoppingModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold text-red-600">{endShoppingCountdown}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  오프라인 쇼핑이 {endShoppingCountdown}초 후 종료됩니다
                </h3>
                <p className="text-sm text-gray-600">
                  추가할 물품이 있으면 추가하기 버튼을 눌러주세요
                </p>
              </div>

              <button
                onClick={() => handleContinueShopping()}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-colors font-bold cursor-pointer whitespace-nowrap shadow-lg"
              >
                <i className="ri-add-circle-line mr-2"></i>
                추가하기
              </button>

              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  아무도 추가하지 않으면 자동으로 정산 페이지로 이동합니다
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
