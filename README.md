# 🛒 같이 사요, Shoppy (쇼피)

> **SSAFY 14기 특화 프로젝트 (2026.01.06 ~ 2026.02.21)**
> **실시간 화상 채팅 기반 쇼핑 플랫폼**

---

## 🤔 왜 Shoppy가 필요할까요?

**"쇼핑은 원래 친구랑 수다 떨면서 하는 게 제맛인데..."**

기존의 온라인 쇼핑은 편리하지만, 오프라인 쇼핑처럼 친구와 의견을 나누고 함께 구경하는 즐거움이 부족했습니다.
메신저로 링크를 공유하고, "이거 어때?"라고 물어보고, 다시 답장을 기다리는 과정은 너무 번거롭고 단절된 경험이었습니다.

**Shoppy는 이 "함께하는 즐거움"을 온라인으로 가져왔습니다.**
친구와 얼굴을 마주 보고 대화하며, 같은 상품을 동시에 보고, 장바구니를 함께 채우는 경험.
Shoppy는 단순한 기능 제공을 넘어, **사용자 간의 연결과 소통을 통한 새로운 쇼핑 경험**을 제공합니다.

---

## 🏃 풍부한 쇼핑 경험 (Key Features)

Shoppy는 사용자가 **"마치 옆에 있는 것처럼"** 느낄 수 있도록 다양한 실시간 기능을 제공합니다.

### 1. 같이 사요 (Real-time Sync)
- **실시간 커서 동기화**: 친구의 마우스 커서가 내 화면에 실시간으로 표시되어, 서로 어디를 보고 있는지 직관적으로 알 수 있습니다.
- **스크롤 동기화**: 내가 스크롤을 내리면 친구의 화면도 같이 내려갑니다. 같은 속도로 정보를 탐색하며 대화에 집중할 수 있습니다.
- **실시간 장바구니**: 내가 담은 물건이 친구의 장바구니에도 즉시 담깁니다.

### 2. 얼굴 보고 사요 (Video Chat)
- **화상 채팅 (OpenVidu)**: 별도의 설치 없이 브라우저에서 바로 친구와 얼굴을 보며 대화할 수 있습니다.
- **음성 대화**: 타이핑할 필요 없이 목소리로 생생한 의견을 나눌 수 있습니다.

### 3. 똑똑하게 사요 (Smart Settlement)
- **영수증 OCR 정산**: 오프라인에서 구매한 영수증도 사진만 찍으면 OK! GPT mini 4.1 API가 품목과 가격을 자동으로 인식합니다.
- **AI 분석**: OCR 결과 중 모호한 부분은 GPT 기반 AI가 보정하여 정확한 정산 내역을 만들어줍니다.
- **자동 정산**: 참여자별로 부담해야 할 금액을 자동으로 계산해 줍니다.

---

## 👨👩 사용자 친화적인 UI/UX

- **직관적인 방 생성 및 초대**: 복잡한 절차 없이 방을 만들고, 링크 하나로 친구를 초대할 수 있습니다.
- **반응형 디자인**: PC, 태블릿, 모바일 등 어떤 기기에서도 최적화된 화면으로 쇼핑을 즐길 수 있습니다. (PWA 지원)

---

## 📚 기술 스택 (Tech Stack)

### Backend
![Java](https://img.shields.io/badge/Java%2017-007396?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot%203-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![JPA](https://img.shields.io/badge/JPA-6DB33F?style=for-the-badge&logo=hibernate&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL%208-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![OpenVidu](https://img.shields.io/badge/OpenVidu-000000?style=for-the-badge&logo=webrtc&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-orange?style=for-the-badge)

### Infra & DevOps
![AWS EC2](https://img.shields.io/badge/AWS%20EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

---

## 🏗️ 아키텍처 (Architecture)

![Architecture](img/Architecture.png)

---

## 💾 ERD (Entity Relationship)

![ERD](img/ERD.png)

---

## 👥 팀원 소개 (Team)

| 이름 | 역할 | 담당 업무 |
| :--- | :--- | :--- |
| **김민상** | Backend / Infra | 프로젝트 리딩, 인프라 구축, 배포 파이프라인 |
| **김민우** | Backend | OpenVidu 연동, Core API 개발, 주요 API 개발 |
| **송주헌** | Backend | 주요 API 개발, OAuth2 |
| **송이룸** | Frontend | WebSocket 연동, 반응형 디자인 |
| **기장선** | AI | 영수증 OCR, LLM AI 모델 연동 |
| **추지인** | Frontend | 메인 UI 개발, WebSocket 연동, UI/UX 디자인 |

---

Copyleft 2026. **Shoppy Team**. All wrongs reserved.
