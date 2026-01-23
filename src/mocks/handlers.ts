import { http, HttpResponse } from 'msw';
import productList from './productList.json';
import participantList from './ParticipantList.json';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const handlers = [
  // 1. 전체 상품 목록 조회: GET /api/products
  http.get(`${API_URL}/api/products`, () => {
    console.log('MSW: 전체 목록 조회 요청 받음');
    return HttpResponse.json(productList);
  }),

  // 2. 상품 키워드 검색: GET /api/products/search?q=검색어
  http.get(`${API_URL}/api/products/search`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('q'); // 쿼리 파라미터 q 추출

    console.log(`MSW: 검색 요청 받음 (검색어: ${keyword})`);

    // 검색어가 없으면 빈 배열 리턴 
    if (!keyword) {
      return HttpResponse.json([]); 
    }

    // 백엔드 로직 흉내: JSON 데이터에서 필터링 수행
    const filteredProducts = productList.filter((product) => 
      product.name.toLowerCase().includes(keyword.toLowerCase())
    );
    return HttpResponse.json(filteredProducts);
  }),

  // 3. 참여자 목록 조회: GET /api/rooms/members/member_list
  http.get(`${API_URL}/api/rooms/members/member_list`, () => {
    console.log('MSW: 참여자 목록 조회 요청 받음');
    return HttpResponse.json(participantList);
  }),
];