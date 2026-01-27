-- AI checklist tables
CREATE TABLE IF NOT EXISTS RoomConstraints (
  room_id BIGINT NOT NULL PRIMARY KEY,
  purpose_code VARCHAR(20) NOT NULL,
  people_count INT NOT NULL,
  min_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  interest_category_codes JSON NOT NULL,
  trait_codes JSON NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_roomconstraints_room
    FOREIGN KEY (room_id) REFERENCES Room(room_id)
);

CREATE TABLE IF NOT EXISTS RecommendationTemplate (
  template_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  purpose_code VARCHAR(20) NULL,
  category_code VARCHAR(30) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  trait_excludes JSON NULL,
  priority INT NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS AiChecklist (
  checklist_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT NOT NULL UNIQUE,
  status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
  generated_at DATETIME NOT NULL,
  CONSTRAINT fk_aichecklist_room
    FOREIGN KEY (room_id) REFERENCES Room(room_id)
);

CREATE TABLE IF NOT EXISTS AiChecklistItem (
  checklist_item_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  checklist_id BIGINT NOT NULL,
  category_code VARCHAR(30) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  reason VARCHAR(255) NULL,
  is_checked BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NULL,
  CONSTRAINT fk_item_checklist
    FOREIGN KEY (checklist_id) REFERENCES AiChecklist(checklist_id)
);
