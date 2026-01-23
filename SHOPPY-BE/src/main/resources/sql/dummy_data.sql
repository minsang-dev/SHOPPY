-- 1. 유저 생성 (내가 1번 유저가 됨)
INSERT INTO User (nickname, email) VALUES ('김싸피', 'ssafy@test.com');

-- 2. 상품 생성 (이미 있으면 패스)
INSERT INTO Product (name, price, image_url) VALUES ('제주 흑돼지 삼겹살', 15000, 'http://img.url');
INSERT INTO Product (name, price, image_url) VALUES ('곰곰 우유', 2500, 'http://img.url');

-- 3. 방 생성 (내가 방장인 방)
-- 중요: host_id는 위에서 만든 user_id여야 함
INSERT INTO Room (host_id, title, status, room_code) VALUES (1, '삼겹살 파티방', 'active', 'CODE1234');