import { http, HttpResponse } from 'msw';
import productList from './productList.json';
import participantList from './ParticipantList.json';
import roomCreateResponse from './RoomCreateResponse.json';
import roomJoinResponse from './RoomJoinresponse.json';
import kakaoLoginResponse from './kakaoLoginResponse.json';
import voteListResponse from './VoteListResponse.json';
import voteDetailResponse from './VoteDetailResponse.json';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// 동적 투표 목록 관리 (MSW 메모리 내 상태)
const dynamicVoteList = [...voteListResponse.data.items];
let nextVoteId = 2004; // 다음 투표 ID
let nextOptionId = 3003; // 다음 옵션 ID

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
    console.log('MSW: 참여자 목록 조회 요청 받음 (roomId:', params.roomId, ')');
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

  // 8. 투표 목록 조회: GET /api/rooms/:roomId/votes?status=OPEN
  http.get(`${API_URL}/api/rooms/:roomId/votes`, ({ params, request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    console.log('MSW: 투표 목록 조회 요청 받음 (roomId:', params.roomId, ', status:', status, ')');
    return HttpResponse.json({
      status: 'success',
      message: 'OK',
      data: { items: dynamicVoteList },
    });
  }),

  // 9. 투표 상세 조회: GET /api/rooms/:roomId/votes/:voteId
  http.get(`${API_URL}/api/rooms/:roomId/votes/:voteId`, ({ params }) => {
    console.log('MSW: 투표 상세 조회 요청 받음 (roomId:', params.roomId, ', voteId:', params.voteId, ')');
    return HttpResponse.json(voteDetailResponse);
  }),

  // 10. 투표 참여: POST /api/rooms/:roomId/votes/:voteId/participants
  http.post(`${API_URL}/api/rooms/:roomId/votes/:voteId/participants`, async ({ params, request }) => {
    const body = await request.json() as { option_id: number };
    console.log('MSW: 투표 참여 요청 받음 (roomId:', params.roomId, ', voteId:', params.voteId, ', optionId:', body.option_id, ')');
    return HttpResponse.json({
      status: 'success',
      message: 'OK',
      data: {
        vote_participant_id: 7001,
        vote_id: Number(params.voteId),
        option_id: body.option_id,
        user_id: 22,
      },
    });
  }),

  // 11. 투표 생성: POST /api/rooms/:roomId/votes
  http.post(`${API_URL}/api/rooms/:roomId/votes`, async ({ params, request }) => {
    const body = await request.json() as { title: string; options: string[] };
    console.log('MSW: 투표 생성 요청 받음 (roomId:', params.roomId, ', title:', body.title, ', options:', body.options, ')');
    
    const now = new Date().toISOString();
    const voteId = nextVoteId++;
    const newVote = {
      vote_id: voteId,
      room_id: Number(params.roomId),
      title: body.title,
      status: 'OPEN' as const,
      created_at: now,
      closed_at: null,
      options: body.options.map((content) => ({
        option_id: nextOptionId++,
        content,
      })),
    };

    // 동적 목록에 추가
    dynamicVoteList.push({
      vote_id: voteId,
      title: body.title,
      status: 'OPEN' as const,
      created_at: now,
      closed_at: null,
    });

    return HttpResponse.json({
      status: 'success',
      message: 'OK',
      data: newVote,
    });
  }),
];