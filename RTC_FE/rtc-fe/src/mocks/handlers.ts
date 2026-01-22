import { http, HttpResponse } from 'msw';
import productList from './productList.json'; 

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const handlers = [
  // http.get('요청할 주소', (요청정보) => { ... })
  // 정확히 해당 api 주소로 가는 요청만 가로챔
  http.get(`${API_URL}/products`, () => {
    
    console.log('msw 성공');
    
    // HttpResponse.json() -> 데이터를 JSON 형식으로 변환
    return HttpResponse.json(productList);
  }),
];