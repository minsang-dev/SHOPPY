import { http, HttpResponse } from 'msw';
import productList from './productList.json';
import participantList from './ParticipantList.json';
import roomCreateResponse from './RoomCreateResponse.json';
import roomJoinResponse from './RoomJoinresponse.json';
import kakaoLoginResponse from './kakaoLoginResponse.json';
import shoppingCartResponse from './ShoppingCartResponse.json';
import voteListResponse from './VoteListResponse.json';
import voteDetailResponse from './VoteDetailResponse.json';

const API_URL = import.meta.env.VITE_API_BASE_URL;

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

  // 2. 상품 키워드 검색: GET /api/products/search?keyword=검색어
  http.get(`${API_URL}/api/products/search`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword');

    console.log(`MSW: 검색 요청 받음 (검색어: ${keyword})`);

    // 검색어가 없으면 빈 배열 리턴
    if (!keyword) {
      return HttpResponse.json({
        status: 'success',
        message: 'OK',
        data: { items: [] },
      });
    }

    // 백엔드 로직 흉내: JSON 데이터에서 필터링 수행
    const filteredProducts = productList.filter((product) =>
      product.name.toLowerCase().includes(keyword.toLowerCase())
    );
    return HttpResponse.json({
      status: 'success',
      message: 'OK',
      data: { items: filteredProducts },
    });
  }),

  // 3. 참여자 목록 조회: GET /api/rooms/:roomId/members
  http.get(`${API_URL}/api/rooms/:roomId/members`, ({ params }) => {
    const roomId = String(params.roomId);
    console.log('MSW: 참여자 목록 조회 요청 받음 (roomId:', roomId, ')');
    return HttpResponse.json(participantList);
  }),

  // 4. 방 생성: POST /api/rooms
  http.post(`${API_URL}/api/rooms`, async ({ request }) => {
    const body = await request.json();
    console.log('MSW: 방 생성 요청 받음', body);
    return HttpResponse.json(roomCreateResponse);
  }),

  // 5. 방 참여: POST /api/rooms/join
  http.post(`${API_URL}/api/rooms/join`, async ({ request }) => {
    const body = await request.json();
    console.log('MSW: 방 참여 요청 받음', body);
    return HttpResponse.json(roomJoinResponse);
  }),

  // 6. 카카오 로그인 콜백: GET /api/auth/kakao/callback
  http.get(`${API_URL}/api/auth/kakao/callback`, ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    console.log('MSW: 카카오 로그인 콜백 요청 받음 (code:', code, ')');
    return HttpResponse.json(kakaoLoginResponse);
  }),

  // 7. 토큰 갱신: POST /api/auth/refresh
  http.post(`${API_URL}/api/auth/refresh`, async ({ request }) => {
    const body = await request.json();
    console.log('MSW: 토큰 갱신 요청 받음', body);
    return HttpResponse.json(kakaoLoginResponse);
  }),

  // 8. 장바구니 아이템 조회: GET /api/rooms/:roomId/shopping-items
  http.get(`${API_URL}/api/rooms/:roomId/shopping-items`, ({ params }) => {
    const roomId = String(params.roomId);
    console.log(`MSW: 장바구니 아이템 조회 요청 받음 (roomId: ${roomId})`);

    // ShoppingCartResponse.json의 데이터를 ShoppingItem 형식으로 변환
    const items = shoppingCartResponse.data.items.map((item) => ({
      shopping_item_id: item.shopping_item_id,
      room_id: item.room_id,
      added_by_user_id: item.added_by_user_id,
      product_id: item.product_id,
      display_name: item.display_name,
      quantity: item.quantity,
      is_checked: item.is_checked,
      purchase_type: item.purchase_type,
    }));

    return HttpResponse.json({
      status: 'success',
      message: 'OK',
      data: { items },
    });
  }),

  // 9. 투표 목록 조회: GET /api/rooms/:roomId/votes?status=OPEN
  http.get(`${API_URL}/api/rooms/:roomId/votes`, ({ params, request }) => {
    const roomId = String(params.roomId);
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'OPEN';
    console.log(`MSW: 투표 목록 조회 요청 받음 (roomId: ${roomId}, status: ${status})`);

    // status에 따라 필터링 (현재는 OPEN만 있으므로 그대로 반환)
    const filteredItems = voteListResponse.data.items.filter(
      (vote) => vote.status === status,
    );

    return HttpResponse.json({
      status: 'success',
      message: 'OK',
      data: { items: filteredItems },
    });
  }),

  // 10. 투표 상세 조회: GET /api/rooms/:roomId/votes/:voteId
  http.get(`${API_URL}/api/rooms/:roomId/votes/:voteId`, ({ params }) => {
    const roomId = String(params.roomId);
    const voteId = String(params.voteId);
    console.log(`MSW: 투표 상세 조회 요청 받음 (roomId: ${roomId}, voteId: ${voteId})`);
    return HttpResponse.json(voteDetailResponse);
  }),

  // 11. 투표 참여: POST /api/rooms/:roomId/votes/:voteId/participants
  http.post(
    `${API_URL}/api/rooms/:roomId/votes/:voteId/participants`,
    async ({ params, request }) => {
      const roomId = String(params.roomId);
      const voteId = String(params.voteId);
      const body = await request.json();
      console.log(
        `MSW: 투표 참여 요청 받음 (roomId: ${roomId}, voteId: ${voteId}, optionId: ${(body as { option_id: number }).option_id})`,
      );

      return HttpResponse.json({
        status: 'success',
        message: 'OK',
        data: {
          vote_participant_id: 4001,
          vote_id: Number(voteId),
          option_id: (body as { option_id: number }).option_id,
          user_id: 1,
        },
      });
    },
  ),

  // 12. 투표 생성: POST /api/rooms/:roomId/votes
  http.post(`${API_URL}/api/rooms/:roomId/votes`, async ({ params, request }) => {
    const roomId = String(params.roomId);
    const body = await request.json();
    console.log(
      `MSW: 투표 생성 요청 받음 (roomId: ${roomId}, title: ${(body as { title: string }).title})`,
    );

    const createBody = body as { title: string; options: string[] };
    const newVoteId = 2004;
    const options = createBody.options.map((content, index) => ({
      option_id: 3003 + index,
      content,
    }));

    return HttpResponse.json({
      status: 'success',
      message: 'OK',
      data: {
        vote_id: newVoteId,
        room_id: Number(roomId),
        title: createBody.title,
        status: 'OPEN',
        created_at: new Date().toISOString(),
        closed_at: null,
        options,
      },
    });
  }),
];