import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 위에서 만든 핸들러(규칙들)를 가지고 워커(일꾼)를 설정
export const worker = setupWorker(...handlers);