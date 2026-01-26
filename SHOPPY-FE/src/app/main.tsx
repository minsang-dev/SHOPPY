import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function enableMocking() {
  // 환경 변수가 true가 아니면 아무것도 안 하고 끝냄
  if (import.meta.env.VITE_USE_MOCK !== 'true') {
  return;
  }

  const { worker } = await import('../shared/mocks/browser');

  // 워커 시작 
  // (onUnhandledRequest: 'bypass'는 모르는 요청은 그냥 통과시키라는 뜻)
  return worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
  )
})
