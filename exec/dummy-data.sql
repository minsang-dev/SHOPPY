-- ============================================================
-- Shoppy 더미 데이터 SQL
-- 실행 전 JPA ddl-auto로 테이블이 생성된 상태여야 합니다.
-- ============================================================

-- 기존 데이터 초기화 (FK 제약조건 때문에 역순 삭제)
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE receipt_ocr_item;
TRUNCATE TABLE receipt_ocr_analysis;
TRUNCATE TABLE AiChecklistItem;
TRUNCATE TABLE AiChecklist;
TRUNCATE TABLE room_constraints;
TRUNCATE TABLE RecommendationTemplate;
TRUNCATE TABLE VoteParticipant;
TRUNCATE TABLE VoteOption;
TRUNCATE TABLE Vote;
TRUNCATE TABLE ChatMessage;
TRUNCATE TABLE ItemAllocation;
TRUNCATE TABLE PurchaseItem;
TRUNCATE TABLE Receipt;
TRUNCATE TABLE Purchase;
TRUNCATE TABLE ShoppingItem;
TRUNCATE TABLE RoomMember;
TRUNCATE TABLE web_rtc_session_entity;
TRUNCATE TABLE Room;
TRUNCATE TABLE product;
TRUNCATE TABLE product_master;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. users (회원)
-- ============================================================
INSERT INTO users (user_id, nickname, email, profile_image, bank_name, account_number, qr_code_url, oauth_id, provider, refresh_token) VALUES
(1, '김민수', 'minsu@example.com',   'https://example.com/profile/1.jpg', '카카오뱅크', '3333-01-1234567', NULL, 'kakao_001', 'kakao', NULL),
(2, '이서연', 'seoyeon@example.com', 'https://example.com/profile/2.jpg', '신한은행',   '110-123-456789',  NULL, 'kakao_002', 'kakao', NULL),
(3, '박지훈', 'jihun@example.com',   'https://example.com/profile/3.jpg', '국민은행',   '123-45-6789012',  NULL, 'kakao_003', 'kakao', NULL),
(4, '최예린', 'yerin@example.com',   'https://example.com/profile/4.jpg', '우리은행',   '1002-123-456789', NULL, 'kakao_004', 'kakao', NULL),
(5, '정하준', 'hajun@example.com',   'https://example.com/profile/5.jpg', NULL,         NULL,              NULL, 'kakao_005', 'kakao', NULL);

-- ============================================================
-- 2. product (상품)
-- ============================================================
INSERT INTO product (product_id, name, price, image_url) VALUES
(1, '곰곰 무항생제 신선한 대란, 30구, 1개', 8370.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2215512493945149-f801fa53-33fd-482b-abcf-20dda5817093.jpg'),
(2, '곰곰 아삭한 콩나물, 500g, 1봉', 1000.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/1052513687379823-df863522-e52c-4f82-8cc7-7a6af214e231.jpg'),
(3, '곰곰 신선한 1A 우유, 900ml, 2개', 3690.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/233351842351776-df7a26c5-d4b8-4870-8646-5751ecddce86.jpg'),
(4, '곰곰 무항생제 신선한 왕란 30구, 1팩', 9970.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/123076081610037-db6638d2-a4e0-4cc8-a6a8-3760c52602ae.png'),
(5, '곰곰 아삭한 숙주나물, 300g, 1봉', 1410.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/4081916517944651-6a597c5f-3037-4b48-8a32-0b385bdfac47.jpg'),
(6, '곰곰 아삭한 숙주나물, 500g, 1개', 1540.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/1053006107569335-ce333ede-2dd5-425d-ba8d-442458773e05.jpg'),
(7, '곰곰 데일리 우유, 900ml, 2개', 2900.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/3461840475598-156fbfa6-a473-4bb7-a46c-3ee747361b6b.jpg'),
(8, '곰곰 만능두부, 300g, 1개', 940.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/623014999248534-b4f1c0c1-532b-496f-838f-a53ab690deb4.jpg'),
(9, '곰곰 완숙 토마토, 1kg, 1개', 5480.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/712722502290473-7cd913a1-5d74-470c-aea5-e74f54190a8d.jpg'),
(10, '곰곰 맥반석 구운란, 30구, 1개', 11400.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/1742566438571959-53a5ab6a-b98d-4301-94ed-7b5c6d1d3b8c.jpg'),
(18, '곰곰 냉동 흰다리 새우살, 300g(24~33미), 1개', 7390.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/81754283992067-7b1ab2e2-76c1-4ada-874e-a23519f89997.jpg'),
(84, '곰곰 설향딸기, 500g(L), 1팩', 9390.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/331151908774651-2e3cb83f-941c-4888-a6c4-9c09b69839b0.jpg'),
(89, '곰곰 세척 사과 (햇), 2kg(소과), 1개', 18500.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/1012107513562-e687b1db-a6b8-4fdb-b72b-14131e8ee9c6.jpg'),
(92, '곰곰 프렌치 버터롤, 260g, 1개', 3470.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/4372414645538191-c615720b-f26b-4bdc-8bb6-8834d2ca7776.jpg'),
(93, '곰곰 쌀 떡국떡, 1kg, 2개', 5090.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/5148405659247263-7c420bfb-c44b-4c5a-9996-4a75566c5384.jpg'),
(98, '곰곰 달달 꿀호떡, 70g, 10개입, 1개', 9450.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/21728771005358-ca430c71-5a71-4e6d-afd8-5c6de78dcb88.jpg'),
(99, '곰곰 한돈 등심 잡채용 (냉장), 400g, 1개', 6910.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/1247949269944349-29552df1-6b3e-42b8-ab2a-3033202272d4.jpg'),
(147, '곰곰 국산 참 바지락, 1kg, 1개', 8820.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/1161852292384355-d3516be6-95f8-4730-b109-f600e8a7790b.jpg'),
(149, '곰곰 사누끼 우동면 (냉동), 1.15kg, 1개', 4110.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/1025_amir_coupang_oct_80k/3b36/b6e89d237bd59d9445d8a7ed00d72704898f77dba340f74564ae26aa0fc1.jpg'),
(169, '곰곰 샌드위치 햄, 100g, 3팩', 5440.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/68900736750125-ae68bfa2-f47f-4d87-8241-c9e15eef3178.jpg'),
(170, '곰곰 고소한 보리차 무라벨, 12개, 1.5L', 11790.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/44017695813525-8aeb99df-6f10-466f-b553-6f11ec21c2ff.jpg'),
(181, '곰곰 한돈 삼겹살 구이용 (냉장), 500g, 1개', 13060.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/1749464982204633-a0f2a709-0713-49b7-aa8b-9ba25b93f72f.jpg'),
(205, '곰곰 이탈리아 정통 스파게티, 500g, 2개', 3860.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/751090031081794-b985a43f-09d7-4815-8443-c4f1397fbf51.png'),
(207, '곰곰 작은 바게트 4개입 (냉동), 300g, 1개', 3590.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2732513760624385-72d79abf-bea3-462f-ab1e-41ed2f237133.jpg'),
(246, '곰곰 포마스 올리브오일, 1개, 1000ml', 10790.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/696398380738592-933ed13e-0e41-4b7a-b2aa-4ab0bf5b1d9d.jpg'),
(254, '곰곰 국내산 포기 김치, 2kg, 1개', 13490.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/1847406067326389-9ea17d13-c646-4cf4-8786-94dfbb770da7.jpg'),
(256, '곰곰 간식 소시지 오리지널, 1kg, 1개', 10490.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/880381770107-aa82c70a-8780-44fc-ac27-fe3120e08306.jpg'),
(517, '곰곰 초콜릿 우유, 190ml, 24개', 13490.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/54963900826407-8fbf45ee-9849-4654-945f-3bb97cf91b92.jpg'),
(593, '곰곰 맛있는 콘치즈 (냉동), 200g, 2개입', 6990.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/286637806943515-6545edfe-fb2c-4e15-9122-f51ebbf3ebc1.jpg'),
(764, '곰곰 웨이퍼롤 치즈, 132g, 1개', 1390.00, 'https://thumbnail.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/111792733143739-bed12683-e5fa-471a-84d6-443dcbf39e57.jpg');

-- ============================================================
-- 3. product_master (상품 마스터)
-- ============================================================
INSERT INTO product_master (id, brand, product_alias, normalized_alias, keywords, category) VALUES
(1,  '곰곰', '대란',       '대란',       '계란,달걀,대란,무항생제',       '식품'),
(2,  '곰곰', '콩나물',     '콩나물',     '콩나물,나물,채소',              '식품'),
(3,  '곰곰', '우유',       '우유',       '우유,유제품,1A우유',            '음료'),
(4,  '곰곰', '왕란',       '왕란',       '계란,달걀,왕란,무항생제',       '식품'),
(5,  '곰곰', '숙주나물',   '숙주나물',   '숙주,나물,채소',               '식품');

-- ============================================================
-- 4. Room (쇼핑 방)
-- ============================================================
INSERT INTO Room (room_id, host_id, title, room_code, status, target_budget, host_current_url) VALUES
(1, 1, '이번주 장보기',       'A1B2C3D4', 'ACTIVE', 50000.00,  'https://www.coupang.com/'),
(2, 2, '캠핑 준비 쇼핑',     'E5F6G7H8', 'ACTIVE', 100000.00, 'https://www.11st.co.kr/'),
(3, 3, '사무실 간식 구매',   'I9J0K1L2', 'CLOSED', 30000.00,  NULL);

-- ============================================================
-- 5. RoomMember (방 참여자)
-- ============================================================
INSERT INTO RoomMember (member_id, room_id, user_id, nickname, role, status, is_camera_on, sync_mode, joined_at) VALUES
-- 방 1: 김민수(HOST), 이서연, 최예린
(1, 1, 1, '김민수', 'HOST',    'ACTIVE', true,  'FREE',   '2026-02-09 10:00:00'),
(2, 1, 2, '이서연', 'GUEST',   'ACTIVE', false, 'FOLLOW', '2026-02-09 10:05:00'),
(3, 1, 4, '최예린', 'SHOPPER', 'ACTIVE', true,  'FREE',   '2026-02-09 10:10:00'),
-- 방 2: 이서연(HOST), 박지훈, 정하준
(4, 2, 2, '이서연', 'HOST',    'ACTIVE', true,  'FREE',   '2026-02-09 11:00:00'),
(5, 2, 3, '박지훈', 'GUEST',   'ACTIVE', false, 'FOLLOW', '2026-02-09 11:05:00'),
(6, 2, 5, '정하준', 'GUEST',   'ACTIVE', false, 'FREE',   '2026-02-09 11:10:00'),
-- 방 3: 박지훈(HOST), 김민수 (CLOSED 방)
(7, 3, 3, '박지훈', 'HOST',    'LEFT',   false, 'FREE',   '2026-02-08 09:00:00'),
(8, 3, 1, '김민수', 'GUEST',   'LEFT',   false, 'FREE',   '2026-02-08 09:05:00');

-- ============================================================
-- 6. WebRtcSessionEntity (WebRTC 세션)
-- ============================================================
INSERT INTO web_rtc_session_entity (id, room_id, max_participants) VALUES
(1, 1, 4),
(2, 2, 6);

-- ============================================================
-- 7. ShoppingItem (쇼핑 목록)
-- ============================================================
INSERT INTO ShoppingItem (shopping_item_id, room_id, added_by_user_id, product_id, display_name, quantity, is_checked, purchase_type, expected_unit_price) VALUES
-- 방 1 아이템
(1,  1, 1, 1,    '곰곰 무항생제 신선한 대란',  2, false, true,  '8370'),
(2,  1, 2, 3,    '곰곰 신선한 1A 우유',        3, false, true,  '3690'),
(3,  1, 4, NULL, '주방세제',                   1, true,  false, '3000'),
(4,  1, 1, 2,    '곰곰 아삭한 콩나물',         6, false, true,  '1000'),
(5,  1, 2, 6,    '곰곰 아삭한 숙주나물',       4, false, false, '1540'),
-- 방 2 아이템
(6,  2, 2, 5,    '곰곰 아삭한 숙주나물',       5, false, true,  '1410'),
(7,  2, 3, 9,    '곰곰 완숙 토마토',           3, false, true,  '5480'),
(8,  2, 5, NULL, '숯',                        2, false, false, '8000'),
(9,  2, 5, NULL, '일회용 접시 세트',           1, true,  false, '5000'),
-- 방 3 아이템 (완료된 방)
(10, 3, 3, 3,    '곰곰 신선한 1A 우유',        2, true,  true,  '3690'),
(11, 3, 1, 8,    '곰곰 만능두부',              3, true,  true,  '940'),
(12, 3, 3, 10,   '곰곰 맥반석 구운란',         5, true,  false, '11400');

-- ============================================================
-- 8. ChatMessage (채팅 메시지)
-- ============================================================
INSERT INTO ChatMessage (chat_id, room_id, sender_member_id, content, is_deleted, is_edited, created_at, edited_at) VALUES
-- 방 1 채팅
(1,  1, 1, '장보기 시작할까요?',                false, false, '2026-02-09 10:10:00', NULL),
(2,  1, 2, '네! 계란이랑 우유 위주로 봐요',      false, false, '2026-02-09 10:11:00', NULL),
(3,  1, 3, '저는 간식도 좀 추가할게요',          false, false, '2026-02-09 10:12:00', NULL),
(4,  1, 1, '콩나물 6개면 충분할까요?',           false, false, '2026-02-09 10:15:00', NULL),
(5,  1, 2, '그 정도면 될 것 같아요!',            false, false, '2026-02-09 10:16:00', NULL),
(6,  1, 1, '잘못 보냈어요',                     true,  false, '2026-02-09 10:17:00', NULL),
-- 방 2 채팅
(7,  2, 4, '캠핑 가기 전에 미리 준비하자!',      false, false, '2026-02-09 11:10:00', NULL),
(8,  2, 5, '숯은 어디서 사는게 좋아요?',         false, false, '2026-02-09 11:12:00', NULL),
(9,  2, 6, '마트가 제일 싼 것 같아요',           false, true,  '2026-02-09 11:13:00', '2026-02-09 11:14:00'),
(10, 2, 4, '그러면 과자도 같이 사요',            false, false, '2026-02-09 11:15:00', NULL);

-- ============================================================
-- 9. Vote (투표)
-- ============================================================
INSERT INTO Vote (vote_id, room_id, title, status, created_at, closed_at) VALUES
(1, 1, '우유 브랜드 뭐로 할까요?',   'CLOSED', '2026-02-09 10:20:00', '2026-02-09 10:30:00'),
(2, 1, '채소 추가 구매 할까요?',      'OPEN',   '2026-02-09 10:35:00', NULL),
(3, 2, '캠핑 장소 어디로?',           'OPEN',   '2026-02-09 11:20:00', NULL);

-- ============================================================
-- 10. VoteOption (투표 선택지)
-- ============================================================
INSERT INTO VoteOption (option_id, vote_id, content) VALUES
-- 투표 1: 우유 브랜드
(1, 1, '곰곰 1A 우유'),
(2, 1, '곰곰 데일리 우유'),
(3, 1, '곰곰 저지방우유'),
-- 투표 2: 음료 추가 구매
(4, 2, '추가 구매 찬성'),
(5, 2, '지금 충분'),
-- 투표 3: 캠핑 장소
(6, 3, '가평'),
(7, 3, '춘천'),
(8, 3, '양평');

-- ============================================================
-- 11. VoteParticipant (투표 참여)
-- ============================================================
INSERT INTO VoteParticipant (vote_participant_id, vote_id, option_id, user_id, voted_at) VALUES
-- 투표 1 결과 (곰곰 1A 우유 2표, 데일리 우유 1표)
(1, 1, 1, 1, '2026-02-09 10:22:00'),
(2, 1, 2, 2, '2026-02-09 10:23:00'),
(3, 1, 1, 4, '2026-02-09 10:25:00'),
-- 투표 2 진행 중
(4, 2, 4, 1, '2026-02-09 10:36:00'),
(5, 2, 5, 2, '2026-02-09 10:37:00'),
-- 투표 3 진행 중
(6, 3, 6, 2, '2026-02-09 11:22:00'),
(7, 3, 7, 3, '2026-02-09 11:23:00');

-- ============================================================
-- 12. Purchase (구매)
-- ============================================================
INSERT INTO Purchase (purchase_id, room_id, payer_member_id, total_amount, kakao_order_id, status) VALUES
(1, 3, 3, 67200.00, 'KO-20260208-001', 'COMPLETE'),
(2, 1, 1, 27810.00, NULL,               'PENDING');

-- ============================================================
-- 13. PurchaseItem (구매 항목)
-- ============================================================
INSERT INTO PurchaseItem (purchase_item_id, purchase_id, item_name, unit_price, quantity, payer_member_id, payer_bank_name, payer_account_number) VALUES
-- 구매 1 (방 3, 완료)
(1, 1, '곰곰 신선한 1A 우유',        3690.00, 2, 3, '국민은행', '123-45-6789012'),
(2, 1, '곰곰 만능두부',              940.00,  3, 3, '국민은행', '123-45-6789012'),
(3, 1, '곰곰 맥반석 구운란',         11400.00, 5, 3, '국민은행', '123-45-6789012'),
-- 구매 2 (방 1, 진행중)
(4, 2, '곰곰 무항생제 신선한 대란',   8370.00, 2, 1, '카카오뱅크', '3333-01-1234567'),
(5, 2, '곰곰 신선한 1A 우유',        3690.00, 3, 1, '카카오뱅크', '3333-01-1234567');

-- ============================================================
-- 14. ItemAllocation (정산 배분)
-- ============================================================
INSERT INTO ItemAllocation (allocation_id, purchase_item_id, member_id, amount_to_pay, diff_amount, settlement_status) VALUES
-- 구매 1 - 곰곰 신선한 1A 우유 (7380원 / 2명)
(1, 1, 3, 3690.00, 0.00, 1),
(2, 1, 1, 3690.00, 0.00, 1),
-- 구매 1 - 곰곰 만능두부 (2820원 / 2명)
(3, 2, 3, 1410.00, 0.00, 1),
(4, 2, 1, 1410.00, 0.00, 1),
-- 구매 1 - 곰곰 맥반석 구운란 (57000원 / 2명)
(5, 3, 3, 28500.00, 0.00, 1),
(6, 3, 1, 28500.00, 0.00, 1),
-- 구매 2 - 곰곰 무항생제 신선한 대란 (16740원 / 3명 = 5580원)
(7, 4, 1, 5580.00, 0.00, 0),
(8, 4, 2, 5580.00, 0.00, 0),
(9, 4, 4, 5580.00, 0.00, 0),
-- 구매 2 - 곰곰 신선한 1A 우유 (11070원 / 3명 = 3690원)
(10, 5, 1, 3690.00, 0.00, 0),
(11, 5, 2, 3690.00, 0.00, 0),
(12, 5, 4, 3690.00, 0.00, 0);

-- ============================================================
-- 15. Receipt (영수증)
-- ============================================================
INSERT INTO Receipt (receipt_id, purchase_id, image_url, recognized_total, original_filename, created_at) VALUES
(1, 1, 'https://example.com/receipts/receipt-001.jpg', 67200.00, 'receipt_20260208.jpg', '2026-02-08 15:30:00');

-- ============================================================
-- 16. room_constraints (방 제약조건 / AI 메타)
-- ============================================================
INSERT INTO room_constraints (room_id, purpose_code, people_count, min_budget, target_budget, interest_category_codes, trait_codes, created_at, updated_at) VALUES
(1, 'GROCERY',  3, 30000.00, 50000.00,  '["FOOD","DRINK"]',           '["BUDGET_FRIENDLY"]',          '2026-02-09 10:00:00', '2026-02-09 10:00:00'),
(2, 'CAMPING',  3, 50000.00, 100000.00, '["SNACK","OUTDOOR","FOOD"]', '["OUTDOOR_LOVER","FUN"]',      '2026-02-09 11:00:00', '2026-02-09 11:00:00');

-- ============================================================
-- 17. AiChecklist (AI 체크리스트)
-- ============================================================
INSERT INTO AiChecklist (checklist_id, room_id, status, generated_at) VALUES
(1, 1, 'ACTIVE', '2026-02-09 10:01:00'),
(2, 2, 'ACTIVE', '2026-02-09 11:01:00');

-- ============================================================
-- 18. AiChecklistItem (AI 체크리스트 항목)
-- ============================================================
INSERT INTO AiChecklistItem (checklist_item_id, checklist_id, category_code, item_name, item_size, reason, is_checked, sort_order) VALUES
-- 체크리스트 1 (방 1: 장보기)
(1,  1, 'FOOD',  '쌀',             '10kg',  '일주일치 밥 분량',         false, 1),
(2,  1, 'FOOD',  '라면',           '5개입', '간편식으로 필수',           true,  2),
(3,  1, 'DRINK', '생수',           '2L 6팩','식수 및 요리용',           true,  3),
(4,  1, 'FOOD',  '계란',           '30구',  '다양한 요리에 활용',       false, 4),
(5,  1, 'DRINK', '우유',           '1L',    '아침 식사용',              false, 5),
-- 체크리스트 2 (방 2: 캠핑)
(6,  2, 'SNACK',   '과자 모음',     NULL,    '캠핑 간식용',             true,  1),
(7,  2, 'OUTDOOR', '숯',           '3kg',   '바베큐용 필수',            false, 2),
(8,  2, 'FOOD',    '소시지',       '500g',  '바베큐 재료',              false, 3),
(9,  2, 'DRINK',   '맥주',         '6캔',   '캠핑 분위기를 위해',       false, 4),
(10, 2, 'OUTDOOR', '일회용 식기',   NULL,    '편의를 위해',             true,  5);

-- ============================================================
-- 19. RecommendationTemplate (추천 템플릿)
-- ============================================================
INSERT INTO RecommendationTemplate (template_id, purpose_code, category_code, new_category_code, item_name, item_size, trait_excludes, ban_traits, template_tags, priority, is_active) VALUES
(1, 'GROCERY', 'FOOD',    'FOOD_STAPLE',  '쌀',       '10kg', '[]',              '[]',              '["필수","주식"]',     1, true),
(2, 'GROCERY', 'FOOD',    'FOOD_INSTANT', '라면',     '5개입','[]',              '[]',              '["간편식","인기"]',   2, true),
(3, 'GROCERY', 'DRINK',   'DRINK_WATER',  '생수',     '2L',   '[]',              '[]',              '["필수","음료"]',     1, true),
(4, 'CAMPING', 'OUTDOOR', 'OUTDOOR_FIRE', '숯',       '3kg',  '[]',              '[]',              '["바베큐","필수"]',   1, true),
(5, 'CAMPING', 'SNACK',   'SNACK_SALTY',  '새우깡',   NULL,   '["HEALTH_FIRST"]','["NO_SNACK"]',    '["간식","인기"]',     2, true),
(6, NULL,      'FOOD',    'FOOD_DAIRY',   '우유',     '1L',   '["LACTOSE_FREE"]','["NO_DAIRY"]',    '["아침","필수"]',     3, true);

-- ============================================================
-- 20. receipt_ocr_analysis (영수증 OCR 분석)
-- ============================================================
INSERT INTO receipt_ocr_analysis (ocr_analysis_id, receipt_id, purchase_id, room_id, user_id, model, status, currency, warnings_json, error_code, error_message, processing_time_ms, created_at) VALUES
(1, 1, 1, 3, 3, 'gpt-4o', 'SUCCESS', 'KRW', '["일부 항목 가격이 보정되었습니다"]', NULL, NULL, 2340, '2026-02-08 15:31:00');

-- ============================================================
-- 21. receipt_ocr_item (영수증 OCR 항목)
-- ============================================================
INSERT INTO receipt_ocr_item (ocr_item_id, ocr_analysis_id, item_name, unit_price, quantity, amount, created_at) VALUES
(1, 1, '곰곰 신선한 1A 우유',   3690.00,  2, 7380.00,  '2026-02-08 15:31:00'),
(2, 1, '곰곰 만능두부',         940.00,   3, 2820.00,  '2026-02-08 15:31:00'),
(3, 1, '곰곰 맥반석 구운란',    11400.00, 5, 57000.00, '2026-02-08 15:31:00');

-- ============================================================
-- 완료
-- ============================================================
