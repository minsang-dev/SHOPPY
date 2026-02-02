-- SQL 참고용: 추천 시스템(LLM) DB 구조 요약
-- 이 파일은 실제 마이그레이션/적용용이 아니라 참고 문서용입니다.

-- 1) RecommendationTemplate
-- 테이블: RecommendationTemplate
-- 주요 컬럼:
--   template_id (PK, BIGINT, IDENTITY)
--   purpose_code (VARCHAR(20))
--   category_code (VARCHAR(30), NOT NULL)
--   new_category_code (VARCHAR(50))
--   item_name (VARCHAR(255), NOT NULL)
--   item_size (VARCHAR(50))
--   trait_excludes (JSON)
--   ban_traits (JSON)
--   template_tags (JSON)
--   priority (INT, NOT NULL)
--   is_active (BOOLEAN, NOT NULL)

-- 2) room_constraints
-- 테이블: room_constraints
-- 주요 컬럼:
--   room_id (PK, BIGINT)
--   purpose_code (VARCHAR(20), NOT NULL)
--   people_count (INT, NOT NULL)
--   min_budget (DECIMAL(12,2), NOT NULL)
--   target_budget (DECIMAL(12,2), NOT NULL)
--   interest_category_codes (JSON, NOT NULL)
--   trait_codes (JSON, NOT NULL)
--   created_at (DATETIME, NOT NULL)
--   updated_at (DATETIME, NOT NULL)

-- 3) AiChecklist
-- 테이블: AiChecklist
-- 주요 컬럼:
--   checklist_id (PK, BIGINT, IDENTITY)
--   room_id (BIGINT, NOT NULL, UNIQUE)
--   status (VARCHAR(10), NOT NULL)
--   generated_at (DATETIME, NOT NULL)

-- 4) AiChecklistItem
-- 테이블: AiChecklistItem
-- 주요 컬럼:
--   checklist_item_id (PK, BIGINT, IDENTITY)
--   checklist_id (FK -> AiChecklist.checklist_id)
--   category_code (VARCHAR(30), NOT NULL)
--   item_name (VARCHAR(255), NOT NULL)
--   item_size (VARCHAR(50))
--   reason (VARCHAR(255))
--   is_checked (BOOLEAN, NOT NULL)
--   sort_order (INT)

-- 5) 관계 요약
--   AiChecklist (1) --- (N) AiChecklistItem
--   Room (1) --- (1) room_constraints (room_id 기준)

-- 6) 출처
--   엔티티(ORM) 기준으로 정리:
--   SHOPPY-BE/src/main/java/ssafy/rtc/shoppy/ai/LLM/entity/

-- 7) RecommendationTemplate 예시 데이터 (참고용)
-- 컬럼 순서:
-- (template_id, purpose_code, category_code, item_name, item_size, trait_excludes, priority, is_active, new_category_code, ban_traits, template_tags)
INSERT INTO RecommendationTemplate
(template_id, purpose_code, category_code, item_name, item_size, trait_excludes, priority, is_active, new_category_code, ban_traits, template_tags)
VALUES
('1', NULL, 'MEAT_PROTEIN', '삼겹살', NULL, '[]', '100', '1', 'MEAT_RAW', '[]', '[]'),
('2', NULL, 'MEAT_PROTEIN', '목살', NULL, '[]', '100', '1', 'MEAT_RAW', '[]', '[]'),
('3', NULL, 'MEAT_PROTEIN', '소시지', NULL, '[]', '90', '1', 'FOOD_READY', '[]', '[]'),
('4', NULL, 'MEAT_PROTEIN', '닭꼬치', NULL, '[]', '80', '1', 'MEAT_RAW', '[]', '[]'),
('5', NULL, 'MEAT_PROTEIN', '새우', NULL, '[]', '80', '1', 'MEAT_RAW', '[]', '[]'),
('6', NULL, 'VEGETABLE', '상추/깻잎', NULL, '[]', '100', '1', 'VEGETABLE_RAW', '[]', '[]'),
('7', NULL, 'VEGETABLE', '마늘/고추', NULL, '[]', '100', '1', 'VEGETABLE_RAW', '[]', '[]'),
('8', NULL, 'VEGETABLE', '버섯 모둠', NULL, '[]', '90', '1', 'VEGETABLE_RAW', '[]', '[]'),
('9', NULL, 'VEGETABLE', '양파', NULL, '[]', '80', '1', 'VEGETABLE_RAW', '[]', '[]'),
('10', NULL, 'VEGETABLE', '파채', NULL, '[]', '80', '1', 'VEGETABLE_RAW', '[]', '[]'),
('11', NULL, 'FRESH', '김치', NULL, '[]', '100', '1', 'FOOD_READY', '[]', '[]'),
('12', NULL, 'FRESH', '쌈무', NULL, '[]', '90', '1', 'FOOD_READY', '[]', '[]'),
('13', NULL, 'FRESH', '과일(수박/포도)', NULL, '[]', '80', '1', 'FRESH_READY', '[]', '[]'),
('14', NULL, 'DRINK', '생수(2L)', NULL, '[]', '100', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('15', NULL, 'DRINK', '콜라/사이다', NULL, '[]', '100', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('16', NULL, 'DRINK', '이온음료', NULL, '[]', '80', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('17', NULL, 'ALCOHOL', '소주', NULL, '[]', '100', '1', 'ALCOHOL', '[]', '[]'),
('18', NULL, 'ALCOHOL', '맥주', NULL, '[]', '100', '1', 'ALCOHOL', '[]', '[]'),
('19', NULL, 'ALCOHOL', '막걸리', NULL, '[]', '90', '1', 'ALCOHOL', '[]', '[]'),
('20', NULL, 'SNACK', '라면', NULL, '[]', '100', '1', 'SNACK', '[]', '[]'),
('21', NULL, 'SNACK', '과자(감자칩)', NULL, '[]', '90', '1', 'SNACK', '[]', '[]'),
('22', NULL, 'COOKING', '부탄가스', NULL, '[]', '100', '1', 'COOKING_TOOL', '[]', '[]'),
('23', NULL, 'COOKING', '일회용 접시/컵', NULL, '[]', '90', '1', 'COOKING_TOOL', '[]', '[]'),
('24', NULL, 'SUPPLY', '휴지', NULL, '["CONSUMABLE"]', '91', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('25', NULL, 'SUPPLY', '쓰레기봉투', NULL, '["CONSUMABLE"]', '95', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('51', NULL, 'DRINK', '생수', NULL, '[]', '10', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('52', NULL, 'DRINK', '탄산수', NULL, '[]', '20', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('53', NULL, 'DRINK', '제로콜라', NULL, '[]', '30', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('54', NULL, 'DRINK', '콜라', NULL, '[]', '40', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('55', NULL, 'DRINK', '사이다', NULL, '[]', '50', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('56', NULL, 'DRINK', '이온음료', NULL, '[]', '60', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('57', NULL, 'DRINK', '커피', NULL, '[]', '70', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('58', NULL, 'DRINK', '얼음', NULL, '[]', '80', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('59', NULL, 'ALCOHOL', '소주', NULL, '["ALCOHOL_NO"]', '20', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('60', NULL, 'ALCOHOL', '맥주', NULL, '["ALCOHOL_NO"]', '30', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('61', NULL, 'ALCOHOL', '기타주류', NULL, '["ALCOHOL_NO"]', '40', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('62', NULL, 'SNACK', '감자칩', NULL, '[]', '30', '1', 'SNACK', '[]', '[]'),
('63', NULL, 'SNACK', '과자모음', NULL, '[]', '40', '1', 'SNACK', '[]', '[]'),
('64', NULL, 'SNACK', '초콜릿', NULL, '[]', '50', '1', 'SNACK', '[]', '[]'),
('65', NULL, 'SNACK', '젤리', NULL, '[]', '60', '1', 'SNACK', '[]', '[]'),
('66', NULL, 'SNACK', '견과류', NULL, '[]', '70', '1', 'SNACK', '[]', '[]'),
('67', NULL, 'SNACK', '육포', NULL, '["VEGGIE"]', '80', '1', 'SNACK', '["VEGGIE"]', '[]'),
('68', NULL, 'SNACK', '오징어채', NULL, '["VEGGIE"]', '90', '1', 'SNACK', '["VEGGIE"]', '[]'),
('69', NULL, 'COOKING', '종이컵', NULL, '["CONSUMABLE"]', '95', '1', 'COOKING_TOOL', '[]', '["CONSUMABLE"]'),
('70', NULL, 'COOKING', '일회용접시', NULL, '[]', '30', '1', 'COOKING_TOOL', '[]', '[]'),
('71', NULL, 'COOKING', '일회용수저', NULL, '[]', '40', '1', 'COOKING_TOOL', '[]', '[]'),
('72', NULL, 'COOKING', '일회용젓가락', NULL, '[]', '50', '1', 'COOKING_TOOL', '[]', '[]'),
('73', NULL, 'COOKING', '호일', NULL, '["CONSUMABLE"]', '88', '1', 'COOKING_TOOL', '[]', '["CONSUMABLE"]'),
('74', NULL, 'COOKING', '랩', NULL, '["CONSUMABLE"]', '86', '1', 'COOKING_TOOL', '[]', '["CONSUMABLE"]'),
('75', NULL, 'COOKING', '키친가위', NULL, '[]', '80', '1', 'COOKING_TOOL', '[]', '[]'),
('76', NULL, 'COOKING', '집게', NULL, '["TOOL"]', '62', '1', 'COOKING_TOOL', '[]', '["TOOL"]'),
('77', NULL, 'COOKING', '부루스타 가스', NULL, '["EQUIPMENT"]', '45', '1', 'COOKING_TOOL', '[]', '["EQUIPMENT"]'),
('78', NULL, 'COOKING', '라이터', NULL, '[]', '25', '1', 'COOKING_TOOL', '[]', '[]'),
('79', NULL, 'SUPPLY', '쓰레기봉투', NULL, '["CONSUMABLE"]', '95', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('80', NULL, 'SUPPLY', '물티슈', NULL, '["CONSUMABLE"]', '92', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('81', NULL, 'SUPPLY', '키친타월', NULL, '[]', '30', '1', 'SUPPLY', '[]', '[]'),
('82', NULL, 'SUPPLY', '휴지', NULL, '["CONSUMABLE"]', '91', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('83', NULL, 'SUPPLY', '위생장갑', NULL, '[]', '50', '1', 'SUPPLY', '[]', '[]'),
('84', NULL, 'SUPPLY', '비닐봉투', NULL, '["CONSUMABLE"]', '87', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('85', NULL, 'SUPPLY', '손세정제', NULL, '["CONSUMABLE"]', '88', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('86', NULL, 'VEGETABLE', '상추', NULL, '[]', '30', '1', 'VEGETABLE_RAW', '[]', '[]'),
('87', NULL, 'VEGETABLE', '깻잎', NULL, '[]', '40', '1', 'VEGETABLE_RAW', '[]', '[]'),
('88', NULL, 'VEGETABLE', '마늘', NULL, '[]', '50', '1', 'VEGETABLE_RAW', '[]', '[]'),
('89', NULL, 'VEGETABLE', '고추', NULL, '[]', '60', '1', 'VEGETABLE_RAW', '[]', '[]'),
('90', NULL, 'VEGETABLE', '양파', NULL, '[]', '70', '1', 'VEGETABLE_RAW', '[]', '[]'),
('91', NULL, 'FRESH', '계란', NULL, '["VEGGIE"]', '40', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('92', NULL, 'FRESH', '두부', NULL, '[]', '50', '1', 'FOOD_READY', '[]', '[]'),
('93', NULL, 'FRESH', '햄', NULL, '["VEGGIE"]', '60', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('94', NULL, 'FRESH', '치즈', NULL, '[]', '70', '1', 'FOOD_READY', '[]', '[]'),
('95', 'MT', 'MEAT_PROTEIN', '삼겹살', NULL, '["VEGGIE"]', '10', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('96', 'MT', 'MEAT_PROTEIN', '목살', NULL, '["VEGGIE"]', '20', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('97', 'MT', 'MEAT_PROTEIN', '소시지', NULL, '["VEGGIE"]', '30', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('98', 'MT', 'MEAT_PROTEIN', '닭꼬치', NULL, '["VEGGIE"]', '40', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('99', 'MT', 'MEAT_PROTEIN', '새우', NULL, '["VEGGIE"]', '50', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('100', NULL, 'MEAT_PROTEIN', '비엔나 소세지', NULL, '["VEGGIE"]', '78', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('101', NULL, 'MEAT_PROTEIN', '대패 삼겹살', NULL, '["VEGGIE"]', '117', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('102', NULL, 'MEAT_PROTEIN', '새우(생물)', NULL, '["VEGGIE"]', '63', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('103', NULL, 'MEAT_PROTEIN', '새우(냉동)', NULL, '["VEGGIE"]', '79', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('104', NULL, 'MEAT_PROTEIN', '햄(통조림)', NULL, '["VEGGIE"]', '108', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('105', NULL, 'MEAT_PROTEIN', '햄(팩)', NULL, '["VEGGIE"]', '108', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('106', NULL, 'MEAT_PROTEIN', '삼겹살', NULL, '["VEGGIE"]', '120', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('107', NULL, 'MEAT_PROTEIN', '목살', NULL, '["VEGGIE"]', '110', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('108', NULL, 'MEAT_PROTEIN', '항정살', NULL, '["VEGGIE"]', '112', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('109', NULL, 'MEAT_PROTEIN', '차돌박이', NULL, '["VEGGIE"]', '114', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('110', NULL, 'MEAT_PROTEIN', '치마살', NULL, '["VEGGIE"]', '108', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('111', NULL, 'MEAT_PROTEIN', '불고기용 고기', NULL, '["VEGGIE"]', '90', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('112', NULL, 'MEAT_PROTEIN', '제육볶음용 고기', NULL, '["VEGGIE"]', '87', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('113', NULL, 'MEAT_PROTEIN', '훈제 오리', NULL, '["VEGGIE"]', '67', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('114', NULL, 'MEAT_PROTEIN', '닭다리살', NULL, '["VEGGIE"]', '81', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('115', NULL, 'MEAT_PROTEIN', '치킨텐더', NULL, '["VEGGIE"]', '75', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('116', NULL, 'MEAT_PROTEIN', '군만두', NULL, '["VEGGIE"]', '72', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('117', NULL, 'MEAT_PROTEIN', '베이컨', NULL, '["VEGGIE"]', '69', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('118', NULL, 'MEAT_PROTEIN', '소시지', NULL, '["VEGGIE"]', '66', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('119', NULL, 'MEAT_PROTEIN', '갈비만두', NULL, '["VEGGIE"]', '63', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('120', NULL, 'MEAT_PROTEIN', '김치만두', NULL, '["VEGGIE"]', '63', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('121', NULL, 'MEAT_PROTEIN', '닭다리', NULL, '["VEGGIE"]', '63', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('122', NULL, 'MEAT_PROTEIN', '다짐육', NULL, '["VEGGIE"]', '60', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('123', NULL, 'VEGETABLE', '상추', NULL, '[]', '100', '1', 'VEGETABLE_RAW', '[]', '[]'),
('124', NULL, 'VEGETABLE', '깻잎', NULL, '[]', '99', '1', 'VEGETABLE_RAW', '[]', '[]'),
('125', NULL, 'VEGETABLE', '쌈채소 믹스', NULL, '[]', '105', '1', 'VEGETABLE_RAW', '[]', '[]'),
('126', NULL, 'VEGETABLE', '콩나물', NULL, '[]', '90', '1', 'VEGETABLE_RAW', '[]', '[]'),
('127', NULL, 'VEGETABLE', '숙주나물', NULL, '[]', '88', '1', 'VEGETABLE_RAW', '[]', '[]'),
('128', NULL, 'VEGETABLE', '버섯', NULL, '[]', '88', '1', 'VEGETABLE_RAW', '[]', '[]'),
('129', NULL, 'VEGETABLE', '대파(손질)', NULL, '[]', '85', '1', 'VEGETABLE_RAW', '[]', '[]'),
('130', NULL, 'VEGETABLE', '양파(깐양파)', NULL, '[]', '84', '1', 'VEGETABLE_RAW', '[]', '[]'),
('131', NULL, 'VEGETABLE', '토마토', NULL, '[]', '55', '1', 'VEGETABLE_RAW', '[]', '[]'),
('132', NULL, 'VEGETABLE', '다진마늘', NULL, '[]', '82', '1', 'VEGETABLE_RAW', '[]', '[]'),
('133', NULL, 'VEGETABLE', '깻잎', NULL, '[]', '95', '1', 'VEGETABLE_RAW', '[]', '[]'),
('134', NULL, 'VEGETABLE', '쌈무', NULL, '[]', '78', '1', 'VEGETABLE_RAW', '[]', '[]'),
('135', NULL, 'VEGETABLE', '감자', NULL, '[]', '74', '1', 'VEGETABLE_RAW', '[]', '[]'),
('136', NULL, 'VEGETABLE', '양파', NULL, '[]', '72', '1', 'VEGETABLE_RAW', '[]', '[]'),
('137', NULL, 'VEGETABLE', '고추', NULL, '[]', '86', '1', 'VEGETABLE_RAW', '[]', '[]'),
('138', NULL, 'VEGETABLE', '고구마', NULL, '[]', '78', '1', 'VEGETABLE_RAW', '[]', '[]'),
('139', NULL, 'VEGETABLE', '샐러드', NULL, '[]', '59', '1', 'VEGETABLE_RAW', '[]', '[]'),
('140', NULL, 'VEGETABLE', '우거지', NULL, '[]', '50', '1', 'VEGETABLE_RAW', '[]', '[]'),
('141', NULL, 'VEGETABLE', '마늘분말', NULL, '[]', '50', '1', 'VEGETABLE_RAW', '[]', '[]'),
('142', NULL, 'FRESH', '두부', NULL, '[]', '86', '1', 'FOOD_READY', '[]', '[]'),
('143', NULL, 'FRESH', '순두부', NULL, '[]', '78', '1', 'FOOD_READY', '[]', '[]'),
('144', NULL, 'FRESH', '계란', NULL, '["VEGGIE"]', '70', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('145', NULL, 'FRESH', '치즈', NULL, '[]', '88', '1', 'FOOD_READY', '[]', '[]'),
('146', NULL, 'FRESH', '요거트', NULL, '[]', '75', '1', 'FRESH_READY', '[]', '[]'),
('147', NULL, 'FRESH', '볶음밥', NULL, '[]', '64', '1', 'FOOD_READY', '[]', '[]'),
('148', NULL, 'FRESH', '김치', NULL, '[]', '93', '1', 'FOOD_READY', '[]', '[]'),
('149', NULL, 'FRESH', '어묵탕', NULL, '[]', '60', '1', 'FOOD_READY', '[]', '[]'),
('150', NULL, 'FRESH', '냉동 블루베리', NULL, '[]', '58', '1', 'FRESH_READY', '[]', '[]'),
('151', NULL, 'FRESH', '국내산 딸기', NULL, '[]', '68', '1', 'FRESH_READY', '[]', '[]'),
('152', NULL, 'FRESH', '어묵', NULL, '[]', '77', '1', 'FOOD_READY', '[]', '[]'),
('153', NULL, 'FRESH', '냉동 피자', NULL, '[]', '70', '1', 'FOOD_READY', '[]', '[]'),
('154', NULL, 'DRINK', '생수', NULL, '[]', '100', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('155', NULL, 'DRINK', '우유', NULL, '[]', '63', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('156', NULL, 'DRINK', '가공 우유', NULL, '[]', '77', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('157', NULL, 'DRINK', '탄산 음료', NULL, '[]', '85', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('158', NULL, 'DRINK', '탄산 음료(제로)', NULL, '[]', '94', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('159', NULL, 'DRINK', '커피(캔)', NULL, '[]', '72', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('160', NULL, 'DRINK', '커피(대용량)', NULL, '[]', '58', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('161', NULL, 'DRINK', '이온 음료', NULL, '[]', '81', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('162', NULL, 'DRINK', '에너지 음료', NULL, '[]', '79', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('163', NULL, 'DRINK', '숙취해소 음료', NULL, '[]', '86', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('164', NULL, 'SNACK', '과자(봉지)', NULL, '[]', '100', '1', 'SNACK', '[]', '[]'),
('165', NULL, 'SNACK', '과자(대용량)', NULL, '[]', '95', '1', 'SNACK', '[]', '[]'),
('166', NULL, 'SNACK', '초콜릿/바', NULL, '[]', '79', '1', 'SNACK', '[]', '[]'),
('167', NULL, 'SNACK', '쿠키/비스킷', NULL, '[]', '80', '1', 'SNACK', '[]', '[]'),
('168', NULL, 'SNACK', '젤리/캔디', NULL, '[]', '73', '1', 'SNACK', '[]', '[]'),
('169', NULL, 'SNACK', '빵/베이커리', NULL, '[]', '88', '1', 'SNACK', '[]', '[]'),
('170', NULL, 'SNACK', '케이크/디저트', NULL, '[]', '78', '1', 'SNACK', '[]', '[]'),
('171', NULL, 'SNACK', '아이스크림', NULL, '[]', '84', '1', 'SNACK', '[]', '[]'),
('172', NULL, 'SNACK', '냉동 디저트', NULL, '[]', '86', '1', 'SNACK', '[]', '[]'),
('173', NULL, 'SNACK', '견과류', NULL, '[]', '70', '1', 'SNACK', '[]', '[]'),
('174', NULL, 'SNACK', '마른안주', NULL, '[]', '89', '1', 'SNACK', '[]', '[]'),
('175', NULL, 'SNACK', '아이스크림', NULL, '[]', '92', '1', 'SNACK', '[]', '[]'),
('176', NULL, 'ALCOHOL', '소주', NULL, '["ALCOHOL_NO"]', '70', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('177', NULL, 'ALCOHOL', '맥주', NULL, '["ALCOHOL_NO"]', '65', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('178', NULL, 'ALCOHOL', '기타주류', NULL, '["ALCOHOL_NO"]', '60', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('179', NULL, 'ALCOHOL', '막걸리', NULL, '["ALCOHOL_NO"]', '55', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('180', NULL, 'ALCOHOL', '가벼운 와인', NULL, '["ALCOHOL_NO"]', '50', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('181', NULL, 'ALCOHOL', '하이볼 캔', NULL, '["ALCOHOL_NO"]', '45', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('182', NULL, 'COOKING', '부루스타 가스', NULL, '["EQUIPMENT"]', '45', '1', 'COOKING_TOOL', '[]', '["EQUIPMENT"]'),
('183', NULL, 'COOKING', '휴대용 가스버너', NULL, '["EQUIPMENT"]', '42', '1', 'COOKING_TOOL', '[]', '["EQUIPMENT"]'),
('184', NULL, 'COOKING', '불판', NULL, '["EQUIPMENT"]', '38', '1', 'COOKING_TOOL', '[]', '["EQUIPMENT"]'),
('185', NULL, 'COOKING', '코팅팬', NULL, '["EQUIPMENT"]', '36', '1', 'COOKING_TOOL', '[]', '["EQUIPMENT"]'),
('186', NULL, 'COOKING', '냄비', NULL, '["EQUIPMENT"]', '34', '1', 'COOKING_TOOL', '[]', '["EQUIPMENT"]'),
('187', NULL, 'COOKING', '집게', NULL, '["TOOL"]', '62', '1', 'COOKING_TOOL', '[]', '["TOOL"]'),
('188', NULL, 'COOKING', '뒤집개', NULL, '["TOOL"]', '60', '1', 'COOKING_TOOL', '[]', '["TOOL"]'),
('189', NULL, 'COOKING', '국자', NULL, '["TOOL"]', '58', '1', 'COOKING_TOOL', '[]', '["TOOL"]'),
('190', NULL, 'COOKING', '가위', NULL, '["TOOL"]', '56', '1', 'COOKING_TOOL', '[]', '["TOOL"]'),
('191', NULL, 'COOKING', '칼', NULL, '["TOOL"]', '52', '1', 'COOKING_TOOL', '[]', '["TOOL"]'),
('192', NULL, 'COOKING', '도마', NULL, '["TOOL"]', '50', '1', 'COOKING_TOOL', '[]', '["TOOL"]'),
('193', NULL, 'COOKING', '호일', NULL, '["CONSUMABLE"]', '88', '1', 'COOKING_TOOL', '[]', '["CONSUMABLE"]'),
('194', NULL, 'COOKING', '랩', NULL, '["CONSUMABLE"]', '86', '1', 'COOKING_TOOL', '[]', '["CONSUMABLE"]'),
('195', NULL, 'COOKING', '종이컵', NULL, '["CONSUMABLE"]', '95', '1', 'COOKING_TOOL', '[]', '["CONSUMABLE"]'),
('196', NULL, 'COOKING', '일회용 접시', NULL, '["CONSUMABLE"]', '93', '1', 'COOKING_TOOL', '[]', '["CONSUMABLE"]'),
('197', NULL, 'COOKING', '일회용 수저', NULL, '["CONSUMABLE"]', '92', '1', 'COOKING_TOOL', '[]', '["CONSUMABLE"]'),
('198', NULL, 'COOKING', '일회용 젓가락', NULL, '["CONSUMABLE"]', '91', '1', 'COOKING_TOOL', '[]', '["CONSUMABLE"]'),
('199', NULL, 'COOKING', '키친타월', NULL, '["CONSUMABLE"]', '90', '1', 'COOKING_TOOL', '[]', '["CONSUMABLE"]'),
('200', NULL, 'SUPPLY', '쓰레기봉투', NULL, '["CONSUMABLE"]', '95', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('201', NULL, 'SUPPLY', '종량제 봉투', NULL, '["CONSUMABLE"]', '94', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('202', NULL, 'SUPPLY', '물티슈', NULL, '["CONSUMABLE"]', '92', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('203', NULL, 'SUPPLY', '휴지', NULL, '["CONSUMABLE"]', '91', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('204', NULL, 'SUPPLY', '알코올 티슈', NULL, '[]', '89', '1', 'SUPPLY', '[]', '[]'),
('205', NULL, 'SUPPLY', '손세정제', NULL, '["CONSUMABLE"]', '88', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('206', NULL, 'SUPPLY', '비닐봉투', NULL, '["CONSUMABLE"]', '87', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('207', NULL, 'SUPPLY', '지퍼백', NULL, '["CONSUMABLE"]', '86', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('208', NULL, 'SUPPLY', '행주', NULL, '["CONSUMABLE"]', '70', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('209', NULL, 'SUPPLY', '수세미', NULL, '["CONSUMABLE"]', '68', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('210', NULL, 'SUPPLY', '일회용 장갑', NULL, '["CONSUMABLE"]', '82', '1', 'SUPPLY', '[]', '["CONSUMABLE"]'),
('211', NULL, 'SUPPLY', '고무장갑', NULL, '["TOOL"]', '60', '1', 'SUPPLY', '[]', '["TOOL"]'),
('212', NULL, 'SUPPLY', '구급상자', NULL, '["TOOL"]', '66', '1', 'SUPPLY', '[]', '["TOOL"]'),
('213', NULL, 'SUPPLY', '구급밴드', NULL, '["TOOL"]', '65', '1', 'SUPPLY', '[]', '["TOOL"]'),
('214', NULL, 'SUPPLY', '모기기피제', NULL, '["TOOL"]', '64', '1', 'SUPPLY', '[]', '["TOOL"]'),
('215', NULL, 'SUPPLY', '모기향', NULL, '["TOOL"]', '55', '1', 'SUPPLY', '[]', '["TOOL"]'),
('216', NULL, 'SUPPLY', '멀티탭', NULL, '["EQUIPMENT"]', '58', '1', 'SUPPLY', '[]', '["EQUIPMENT"]'),
('217', NULL, 'SUPPLY', '연장선', NULL, '["EQUIPMENT"]', '52', '1', 'SUPPLY', '[]', '["EQUIPMENT"]'),
('218', NULL, 'SUPPLY', '랜턴/후레쉬', NULL, '["EQUIPMENT"]', '57', '1', 'SUPPLY', '[]', '["EQUIPMENT"]'),
('219', NULL, 'SUPPLY', '라이터', NULL, '["TOOL"]', '50', '1', 'SUPPLY', '[]', '["TOOL"]'),
('220', NULL, 'FRESH', '만두', '용량: 1kg', '[]', '50', '1', 'FOOD_READY', '["VEGGIE"]', '[]'),
('221', NULL, 'FRESH', '피자', '용량: 1판', '[]', '50', '1', 'FOOD_READY', '[]', '[]'),
('222', NULL, 'FRESH', '김밥', '용량: 1줄', '[]', '50', '1', 'FOOD_READY', '[]', '[]'),
('223', NULL, 'FRESH', '라면', '용량: 5봉', '[]', '50', '1', 'FOOD_READY', '[]', '[]'),
('224', NULL, 'FRESH', '주먹밥', '용량: 5개', '[]', '50', '1', 'FOOD_READY', '[]', '[]'),
('225', NULL, 'MEAT_PROTEIN', '소고기', '용량: 1kg', '[]', '50', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('226', NULL, 'MEAT_PROTEIN', '돼지고기', '용량: 1kg', '[]', '50', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('227', NULL, 'MEAT_PROTEIN', '닭고기', '용량: 1kg', '[]', '50', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('228', NULL, 'MEAT_PROTEIN', '오리고기', '용량: 1kg', '[]', '50', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('229', NULL, 'FRESH', '과일', '용량: 1kg', '[]', '50', '1', 'FRESH_READY', '[]', '[]'),
('230', NULL, 'FRESH', '사과', '용량: 1kg', '[]', '50', '1', 'FRESH_READY', '[]', '[]'),
('231', NULL, 'FRESH', '바나나', '용량: 1송이', '[]', '50', '1', 'FRESH_READY', '[]', '[]'),
('232', NULL, 'FRESH', '딸기', '용량: 500g', '[]', '50', '1', 'FRESH_READY', '[]', '[]'),
('233', NULL, 'FRESH', '포도', '용량: 1kg', '[]', '50', '1', 'FRESH_READY', '[]', '[]'),
('234', NULL, 'FRESH', '샐러드', '용량: 300g', '[]', '50', '1', 'FRESH_READY', '[]', '[]'),
('235', NULL, 'FRESH', '치즈', '용량: 200g', '[]', '50', '1', 'FRESH_READY', '[]', '[]'),
('236', NULL, 'FRESH', '우유', '용량: 1L', '[]', '50', '1', 'FRESH_READY', '[]', '[]'),
('237', NULL, 'FRESH', '빵', '용량: 1봉', '[]', '50', '1', 'FRESH_READY', '[]', '[]'),
('238', NULL, 'FRESH', '아이스크림', '용량: 1통', '[]', '50', '1', 'FRESH_READY', '[]', '[]'),
('239', NULL, 'FRESH', '디저트', '용량: 1개', '[]', '50', '1', 'FRESH_READY', '[]', '[]'),
('240', NULL, 'VEGETABLE', '대파', '용량: 1단', '[]', '50', '1', 'VEGETABLE_RAW', '[]', '[]'),
('241', NULL, 'VEGETABLE', '오이', '용량: 3개', '[]', '50', '1', 'VEGETABLE_RAW', '[]', '[]'),
('242', NULL, 'VEGETABLE', '양배추', '용량: 1통', '[]', '50', '1', 'VEGETABLE_RAW', '[]', '[]'),
('243', NULL, 'DRINK', '보리차', '용량: 1.5L', '[]', '50', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('244', NULL, 'DRINK', '주스', '용량: 1L', '[]', '50', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('245', NULL, 'DRINK', '녹차', '용량: 1L', '[]', '50', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('246', NULL, 'DRINK', '홍차', '용량: 1L', '[]', '50', '1', 'DRINK_NON_ALCOHOL', '[]', '[]'),
('247', NULL, 'SNACK', '쿠키', '용량: 300g', '[]', '50', '1', 'SNACK', '[]', '[]'),
('248', NULL, 'SNACK', '비스킷', '용량: 300g', '[]', '50', '1', 'SNACK', '[]', '[]'),
('249', NULL, 'SNACK', '캔디', '용량: 100g', '[]', '50', '1', 'SNACK', '[]', '[]'),
('250', NULL, 'SNACK', '프레첼', '용량: 200g', '[]', '50', '1', 'SNACK', '[]', '[]'),
('251', NULL, 'COOKING', '가스버너', '용량: 1개', '[]', '50', '1', 'COOKING_TOOL', '[]', '["EQUIPMENT"]'),
('252', NULL, 'COOKING', '후라이팬', '용량: 1개', '[]', '50', '1', 'COOKING_TOOL', '[]', '["EQUIPMENT"]'),
('253', NULL, 'SUPPLY', '장갑', '용량: 1팩', '[]', '50', '1', 'SUPPLY', '[]', '[]'),
('254', NULL, 'ALCOHOL', '와인', '용량: 1병', '[]', '50', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('255', NULL, 'ALCOHOL', '하이볼', '용량: 4캔', '[]', '50', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('256', NULL, 'ALCOHOL', '전통주', '용량: 1병', '[]', '50', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('257', NULL, 'ALCOHOL', '보드카', '용량: 1병', '[]', '50', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('258', NULL, 'ALCOHOL', '위스키', '용량: 1병', '[]', '50', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('259', NULL, 'ALCOHOL', '사케', '용량: 1병', '[]', '50', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('260', NULL, 'ALCOHOL', '럼', '용량: 1병', '[]', '50', '1', 'ALCOHOL', '["ALCOHOL_NO"]', '[]'),
('261', NULL, 'MEAT_PROTEIN', '갈비살', '', '[]', '50', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('262', NULL, 'MEAT_PROTEIN', '앞다리살', '', '[]', '50', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('263', NULL, 'MEAT_PROTEIN', '뒷다리살', '', '[]', '50', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('264', NULL, 'MEAT_PROTEIN', '등심', '', '[]', '50', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('265', NULL, 'MEAT_PROTEIN', '안심', '', '[]', '50', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('266', NULL, 'MEAT_PROTEIN', '채끝', '', '[]', '50', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('267', NULL, 'MEAT_PROTEIN', '부채살', '', '[]', '50', '1', 'MEAT_RAW', '["VEGGIE"]', '[]'),
('268', NULL, 'MEAT_PROTEIN', '살치살', '', '[]', '50', '1', 'MEAT_RAW', '["VEGGIE"]', '[]');
