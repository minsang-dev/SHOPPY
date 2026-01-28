import { http, HttpResponse } from 'msw';
import productList from './productList.json';
// import participantList from './ParticipantList.json';
// import roomCreateResponse from './RoomCreateResponse.json';
// import roomJoinResponse from './RoomJoinresponse.json';
// import kakaoLoginResponse from './kakaoLoginResponse.json';
import shoppingCartResponse from './ShoppingCartResponse.json';
// import chatListResponse from './ChatList.json';
// import voteListResponse from './VoteListResponse.json';
// import voteDetailResponse from './VoteDetailResponse.json';

const API_URL = import.meta.env.VITE_API_BASE_URL;

type MockShoppingItem = {
  shopping_item_id: number;
  room_id: number;
  added_by_user_id: number;
  product_id: number | null;
  display_name: string;
  quantity: number;
  is_checked: boolean;
  purchase_type: string | null;
  expected_unit_price: number | string | null;
};

let mockShoppingItems: MockShoppingItem[] = shoppingCartResponse.data.items.map((item) => ({
  shopping_item_id: item.shopping_item_id,
  room_id: item.room_id,
  added_by_user_id: item.added_by_user_id,
  product_id: item.product_id,
  display_name: item.display_name,
  quantity: item.quantity,
  is_checked: item.is_checked,
  purchase_type: item.purchase_type ?? null,
  expected_unit_price: (item as { expected_unit_price?: number | string | null }).expected_unit_price ?? null,
}));

const nextShoppingItemId = () =>
  mockShoppingItems.length > 0
    ? Math.max(...mockShoppingItems.map((item) => item.shopping_item_id)) + 1
    : 1;

// 채팅 메시지 mock 데이터
// type MockChatMessage = {
//   chatId: number;
//   roomId: number;
//   senderMemberId: number;
//   content: string;
//   isDeleted: boolean;
//   isEdited: boolean;
//   createdAt: string;
//   editedAt: string | null;
// };

// const mockChatMessages: MockChatMessage[] = chatListResponse.data.messages.map((msg) => ({
//   chatId: msg.chatId,
//   roomId: msg.roomId,
//   senderMemberId: msg.senderMemberId,
//   content: msg.content,
//   isDeleted: msg.isDeleted,
//   isEdited: msg.isEdited,
//   createdAt: msg.createdAt,
//   editedAt: msg.editedAt,
// }));

// const nextChatId = () =>
//   mockChatMessages.length > 0
//     ? Math.max(...mockChatMessages.map((msg) => msg.chatId)) + 1
//     : 1;

export const handlers = [
  // 1. 전체 상품 목록 조회: GET /api/products
  http.get(`${API_URL}/api/products`, () => {
    console.log('MSW: 전체 목록 조회 요청 받음');
    return HttpResponse.json({
      status: 'success',
      message: 'OK',
      data: { items: productList },
    });
  }),

  // 2. 상품 검색: GET /api/products/search?keyword=검색어
  http.get(`${API_URL}/api/products/search`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword');

    console.log(`MSW: 검색 요청 받음 (검색어: ${keyword})`);

    if (!keyword) {
      return HttpResponse.json({
        status: 'success',
        message: 'OK',
        data: { items: [] },
      });
    }

    const filteredProducts = productList.filter((product) =>
      product.name.toLowerCase().includes(keyword.toLowerCase()),
    );
    return HttpResponse.json({
      status: 'success',
      message: 'OK',
      data: { items: filteredProducts },
    });
  }),

  // ============================================================
  // 방 관련 - 주석 처리 (실제 백엔드 테스트)
  // ============================================================
  // // 3. 참여자 목록 조회: GET /api/rooms/:roomId/members
  // http.get(`${API_URL}/api/rooms/:roomId/members`, ({ params }) => {
  //   const roomId = String(params.roomId);
  //   console.log('MSW: 참여자 목록 조회 요청 받음 (roomId:', roomId, ')');
  //   return HttpResponse.json(participantList);
  // }),

  // // 4. 방 생성: POST /api/rooms
  // http.post(`${API_URL}/api/rooms`, async ({ request }) => {
  //   const body = await request.json();
  //   console.log('MSW: 방 생성 요청 받음', body);
  //   return HttpResponse.json(roomCreateResponse);
  // }),

  // // 5. 방 참여: POST /api/rooms/join
  // http.post(`${API_URL}/api/rooms/join`, async ({ request }) => {
  //   const body = await request.json();
  //   console.log('MSW: 방 참여 요청 받음', body);
  //   return HttpResponse.json(roomJoinResponse);
  // }),

  // ============================================================
  // 인증 관련 - 주석 처리 (실제 백엔드 테스트)
  // ============================================================
  // // 6. 카카오 로그인 콜백: GET /api/auth/kakao/callback
  // http.get(`${API_URL}/api/auth/kakao/callback`, ({ request }) => {
  //   const url = new URL(request.url);
  //   const code = url.searchParams.get('code');
  //   console.log('MSW: 카카오 로그인 콜백 요청 받음 (code:', code, ')');
  //   return HttpResponse.json(kakaoLoginResponse);
  // }),
  // 5-1. 방 조회: GET /api/rooms/:roomId
  http.get(`${API_URL}/api/rooms/:roomId`, ({ params }) => {
    const roomId = Number(params.roomId);
    console.log('MSW: 방 조회 요청 받음 (roomId:', roomId, ')');
    return HttpResponse.json({
      status: 'success',
      message: 'OK',
      data: {
        roomId,
        hostId: 1,
        roomName: '테스트 방',
        inviteCode: 'ABCD1234',
        roomStatus: 'OPEN',
        targetBudget: 500000,
        syncMode: 'FOLLOW',
        hostCurrentUrl: null,
        roomMeta: {
          shoppingPurpose: '모바일 테스트',
          interestCategories: ['디지털', '패션'],
          headcount: 4,
          budgetMin: 100000,
        },
      },
    });
  }),

  // 5-2. 방 코드 조회: GET /api/rooms/code/:roomCode
  http.get(`${API_URL}/api/rooms/code/:roomCode`, ({ params }) => {
    const roomCode = String(params.roomCode);
    console.log('MSW: 방 코드 조회 요청 받음 (roomCode:', roomCode, ')');
    return HttpResponse.json({
      status: 'success',
      message: 'OK',
      data: {
        roomId: 1,
        hostId: 1,
        roomName: '테스트 방',
        inviteCode: roomCode,
        roomStatus: 'OPEN',
        targetBudget: 500000,
        syncMode: 'FOLLOW',
        hostCurrentUrl: null,
        roomMeta: {
          shoppingPurpose: '모바일 테스트',
          interestCategories: ['디지털', '패션'],
          headcount: 4,
          budgetMin: 100000,
        },
      },
    });
  }),

  // 6. 카카오 로그인 콜백: GET /api/auth/kakao/callback
  // 주석 처리 - 실제 백엔드에서 JWT 발급받아야 함
  // http.get(`${API_URL}/api/auth/kakao/callback`, ({ request }) => {
  //   const url = new URL(request.url);
  //   const code = url.searchParams.get('code');
  //   console.log('MSW: 카카오 로그인 콜백 요청 받음 (code:', code, ')');
  //   return HttpResponse.json(kakaoLoginResponse);
  // }),

  // // 7. 토큰 갱신: POST /api/auth/refresh
  // http.post(`${API_URL}/api/auth/refresh`, async ({ request }) => {
  //   const body = await request.json();
  //   console.log('MSW: 토큰 갱신 요청 받음', body);
  //   return HttpResponse.json(kakaoLoginResponse);
  // }),

  // 8. 장바구니 아이템 조회: GET /api/rooms/:roomId/shopping-items
  http.get(`${API_URL}/api/rooms/:roomId/shopping-items`, ({ params }) => {
    const roomId = String(params.roomId);
    console.log(`MSW: 장바구니 아이템 조회 요청 받음 (roomId: ${roomId})`);

    const items = mockShoppingItems.map((item) => ({
      shopping_item_id: item.shopping_item_id,
      room_id: item.room_id,
      added_by_user_id: item.added_by_user_id,
      product_id: item.product_id,
      display_name: item.display_name,
      quantity: item.quantity,
      is_checked: item.is_checked,
      purchase_type: item.purchase_type,
      expected_unit_price: item.expected_unit_price ?? null,
    }));

    return HttpResponse.json({
      status: 'success',
      message: 'OK',
      data: { items },
    });
  }),

  // ============================================================
  // 투표 관련 - 주석 처리 (실제 백엔드 테스트)
  // ============================================================
  // // 9. 투표 목록 조회: GET /api/rooms/:roomId/votes?status=OPEN
  // http.get(`${API_URL}/api/rooms/:roomId/votes`, ({ params, request }) => {
  //   const roomId = String(params.roomId);
  //   const url = new URL(request.url);
  //   const status = url.searchParams.get('status') || 'OPEN';
  //   console.log(`MSW: 투표 목록 조회 요청 받음 (roomId: ${roomId}, status: ${status})`);
  //   const filteredItems = voteListResponse.data.items.filter(
  //     (vote) => vote.status === status,
  //   );
  //   return HttpResponse.json({
  //     status: 'success',
  //     message: 'OK',
  //     data: { items: filteredItems },
  //   });
  // }),

  // // 10. 투표 상세 조회: GET /api/rooms/:roomId/votes/:voteId
  // http.get(`${API_URL}/api/rooms/:roomId/votes/:voteId`, ({ params }) => {
  //   const roomId = String(params.roomId);
  //   const voteId = String(params.voteId);
  //   console.log(`MSW: 투표 상세 조회 요청 받음 (roomId: ${roomId}, voteId: ${voteId})`);
  //   return HttpResponse.json(voteDetailResponse);
  // }),
  // 8-1. 장바구니 아이템 추가: POST /api/rooms/:roomId/shopping-items
  http.post(`${API_URL}/api/rooms/:roomId/shopping-items`, async ({ params, request }) => {
    const roomId = Number(params.roomId);
    const body = (await request.json()) as Record<string, unknown>;
    console.log('MSW: 장바구니 아이템 추가', body);

    const productId = typeof body.productId === 'number' ? body.productId : null;
    const purchaseType =
      typeof body.purchaseType === 'string'
        ? body.purchaseType
        : body.purchaseType === true
          ? 'online'
          : body.purchaseType === false
            ? 'offline'
            : null;
    const expectedUnitPrice =
      typeof body.expectedUnitPrice === 'number' || typeof body.expectedUnitPrice === 'string'
        ? body.expectedUnitPrice
        : null;

    const newItem = {
      shopping_item_id: nextShoppingItemId(),
      room_id: roomId,
      added_by_user_id: Number(body.userId ?? 1),
      product_id: productId,
      display_name: String(body.displayName ?? '새 항목'),
      quantity: Number(body.quantity ?? 1),
      is_checked: false,
      purchase_type: purchaseType,
      expected_unit_price: expectedUnitPrice,
    };

    mockShoppingItems = [...mockShoppingItems, newItem];

    return HttpResponse.json({
      status: 'success',
      message: 'OK',
      data: null,
    });
  }),

  // 8-2. 장바구니 아이템 수정: PATCH /api/rooms/:roomId/shopping-items/:shoppingItemId
  http.patch(
    `${API_URL}/api/rooms/:roomId/shopping-items/:shoppingItemId`,
    async ({ params, request }) => {
      const shoppingItemId = Number(params.shoppingItemId);
      const body = (await request.json()) as Record<string, unknown>;
      console.log('MSW: 장바구니 아이템 수정', body);

      mockShoppingItems = mockShoppingItems.map((item) =>
        item.shopping_item_id === shoppingItemId
          ? {
              ...item,
              quantity: typeof body.quantity === 'number' ? body.quantity : item.quantity,
              is_checked:
                typeof body.checked === 'boolean'
                  ? body.checked
                  : typeof body.is_checked === 'boolean'
                    ? body.is_checked
                    : item.is_checked,
            }
          : item,
      );

      const updated = mockShoppingItems.find((item) => item.shopping_item_id === shoppingItemId);

      return HttpResponse.json({
        status: 'success',
        message: 'OK',
        data: updated ?? null,
      });
    },
  ),

  // 8-3. 장바구니 아이템 삭제: DELETE /api/rooms/:roomId/shopping-items/:shoppingItemId
  http.delete(
    `${API_URL}/api/rooms/:roomId/shopping-items/:shoppingItemId`,
    ({ params }) => {
      const shoppingItemId = Number(params.shoppingItemId);
      console.log('MSW: 장바구니 아이템 삭제', shoppingItemId);
      mockShoppingItems = mockShoppingItems.filter(
        (item) => item.shopping_item_id !== shoppingItemId,
      );
      return HttpResponse.json({
        status: 'success',
        message: 'OK',
        data: null,
      });
    },
  ),

  // ============================================================
  // 투표 관련 - 주석 처리 (실제 백엔드 연결)
  // ============================================================
  // // 9. 투표 목록 조회: GET /api/rooms/:roomId/votes?status=OPEN
  // http.get(`${API_URL}/api/rooms/:roomId/votes`, ({ params, request }) => {
  //   const roomId = String(params.roomId);
  //   const url = new URL(request.url);
  //   const status = url.searchParams.get('status') || 'OPEN';
  //   console.log(`MSW: 투표 목록 조회 요청 받음 (roomId: ${roomId}, status: ${status})`);
  //   const filteredItems = voteListResponse.data.items.filter((vote) => vote.status === status);
  //   return HttpResponse.json({
  //     status: 'success',
  //     message: 'OK',
  //     data: { items: filteredItems },
  //   });
  // }),

  // // 10. 투표 상세 조회: GET /api/rooms/:roomId/votes/:voteId
  // http.get(`${API_URL}/api/rooms/:roomId/votes/:voteId`, ({ params }) => {
  //   const roomId = String(params.roomId);
  //   const voteId = String(params.voteId);
  //   console.log(`MSW: 투표 상세 조회 요청 받음 (roomId: ${roomId}, voteId: ${voteId})`);
  //   return HttpResponse.json(voteDetailResponse);
  // }),

  // // 11. 투표 참여: POST /api/rooms/:roomId/votes/:voteId/participants
  // http.post(
  //   `${API_URL}/api/rooms/:roomId/votes/:voteId/participants`,
  //   async ({ params, request }) => {
  //     const roomId = String(params.roomId);
  //     const voteId = String(params.voteId);
  //     const body = await request.json();
  //     console.log(
  //       `MSW: 투표 참여 요청 받음 (roomId: ${roomId}, voteId: ${voteId}, optionId: ${(body as { option_id: number }).option_id})`,
  //     );
  //     return HttpResponse.json({
  //       status: 'success',
  //       message: 'OK',
  //       data: {
  //         vote_participant_id: 4001,
  //         vote_id: Number(voteId),
  //         option_id: (body as { option_id: number }).option_id,
  //         user_id: 1,
  //       },
  //     });
  //   },
  // ),

  // // 12. 투표 생성: POST /api/rooms/:roomId/votes
  // http.post(`${API_URL}/api/rooms/:roomId/votes`, async ({ params, request }) => {
  //   const roomId = String(params.roomId);
  //   const body = await request.json();
  //   console.log(
  //     `MSW: 투표 생성 요청 받음 (roomId: ${roomId}, title: ${(body as { title: string }).title})`,
  //   );
  //   const createBody = body as { title: string; options: string[] };
  //   const newVoteId = 2004;
  //   const options = createBody.options.map((content, index) => ({
  //     option_id: 3003 + index,
  //     content,
  //   }));
  //   return HttpResponse.json({
  //     status: 'success',
  //     message: 'OK',
  //     data: {
  //       vote_id: newVoteId,
  //       room_id: Number(roomId),
  //       title: createBody.title,
  //       status: 'OPEN',
  //       created_at: new Date().toISOString(),
  //       closed_at: null,
  //       options,
  //     },
  //   });
  // }),

  // ============================================================
  // 투표 관련 - 주석 처리 (실제 백엔드 연결)
  // ============================================================
  // // 10. 투표 상세 조회: GET /api/rooms/:roomId/votes/:voteId
  // http.get(`${API_URL}/api/rooms/:roomId/votes/:voteId`, ({ params }) => {
  //   const roomId = String(params.roomId);
  //   const voteId = String(params.voteId);
  //   console.log(`MSW: 투표 상세 조회 요청 받음 (roomId: ${roomId}, voteId: ${voteId})`);
  //   return HttpResponse.json(voteDetailResponse);
  // }),

  // // 11. 투표 참여: POST /api/rooms/:roomId/votes/:voteId/participants
  // http.post(
  //   `${API_URL}/api/rooms/:roomId/votes/:voteId/participants`,
  //   async ({ params, request }) => {
  //     const roomId = String(params.roomId);
  //     const voteId = String(params.voteId);
  //     const body = await request.json();
  //     console.log(
  //       `MSW: 투표 참여 요청 받음 (roomId: ${roomId}, voteId: ${voteId}, optionId: ${(body as { option_id: number }).option_id})`,
  //     );

  //     return HttpResponse.json({
  //       status: 'success',
  //       message: 'OK',
  //       data: {
  //         vote_participant_id: 4001,
  //         vote_id: Number(voteId),
  //         option_id: (body as { option_id: number }).option_id,
  //         user_id: 1,
  //       },
  //     });
  //   },
  // ),

  // // 12. 투표 생성: POST /api/rooms/:roomId/votes
  // http.post(`${API_URL}/api/rooms/:roomId/votes`, async ({ params, request }) => {
  //   const roomId = String(params.roomId);
  //   const body = await request.json();
  //   console.log(
  //     `MSW: 투표 생성 요청 받음 (roomId: ${roomId}, title: ${(body as { title: string }).title})`,
  //   );

  //   const createBody = body as { title: string; options: string[] };
  //   const newVoteId = 2004;
  //   const options = createBody.options.map((content, index) => ({
  //     option_id: 3003 + index,
  //     content,
  //   }));

  //   return HttpResponse.json({
  //     status: 'success',
  //     message: 'OK',
  //     data: {
  //       vote_id: newVoteId,
  //       room_id: Number(roomId),
  //       title: createBody.title,
  //       status: 'OPEN',
  //       created_at: new Date().toISOString(),
  //       closed_at: null,
  //       options,
  //     },
  //   });
  // }),
];

