-- Migration for recommendation_template (current DB state: new_category_code, ban_traits, template_tags exist)

-- 1) Initialize JSON columns if NULL
UPDATE recommendation_template
SET ban_traits = JSON_ARRAY()
WHERE ban_traits IS NULL;

UPDATE recommendation_template
SET template_tags = JSON_ARRAY()
WHERE template_tags IS NULL;

-- 2) Base category mapping
UPDATE recommendation_template
SET new_category_code =
  CASE category_code
    WHEN 'DRINK' THEN 'DRINK_NON_ALCOHOL'
    WHEN 'ALCOHOL' THEN 'ALCOHOL'
    WHEN 'COOKING' THEN 'COOKING_TOOL'
    WHEN 'SUPPLY' THEN 'SUPPLY'
    WHEN 'VEGETABLE' THEN 'VEGETABLE_RAW'
    ELSE new_category_code
  END
WHERE category_code IN ('DRINK', 'ALCOHOL', 'COOKING', 'SUPPLY', 'VEGETABLE')
  AND template_id > 0;

-- 3) MEAT_PROTEIN split
UPDATE recommendation_template
SET new_category_code =
  CASE
    WHEN item_name REGEXP '삼겹|목살|항정|차돌|불고기|제육|다짐육|생물|냉동|닭다리|닭다리살|치마살'
      THEN 'MEAT_RAW'
    WHEN item_name REGEXP '훈제|치킨텐더|햄|치즈|소시지|비엔나|만두'
      THEN 'FOOD_READY'
    ELSE 'MEAT_RAW'
  END
WHERE category_code = 'MEAT_PROTEIN'
  AND template_id > 0;

-- 4) FRESH split
UPDATE recommendation_template
SET new_category_code =
  CASE
    WHEN item_name REGEXP '요거트|딸기|블루베리|토마토|과일|샐러드'
      THEN 'FRESH_READY'
    WHEN item_name REGEXP '볶음밥|냉동피자|냉동 피자|어묵탕|어묵|김치|쌈무'
      THEN 'FOOD_READY'
    WHEN item_name REGEXP '계란|두부|순두부'
      THEN 'FOOD_READY'
    ELSE 'FRESH_READY'
  END
WHERE category_code = 'FRESH'
  AND template_id > 0;

-- 5) ban_traits split (ALCOHOL_NO, VEGGIE)
UPDATE recommendation_template
SET ban_traits = JSON_ARRAY_APPEND(ban_traits, '$', 'ALCOHOL_NO')
WHERE trait_excludes IS NOT NULL
  AND JSON_CONTAINS(trait_excludes, JSON_QUOTE('ALCOHOL_NO'))
  AND NOT JSON_CONTAINS(ban_traits, JSON_QUOTE('ALCOHOL_NO'))
  AND template_id > 0;

UPDATE recommendation_template
SET ban_traits = JSON_ARRAY_APPEND(ban_traits, '$', 'VEGGIE')
WHERE trait_excludes IS NOT NULL
  AND JSON_CONTAINS(trait_excludes, JSON_QUOTE('VEGGIE'))
  AND NOT JSON_CONTAINS(ban_traits, JSON_QUOTE('VEGGIE'))
  AND template_id > 0;

-- 6) template_tags split (CONSUMABLE / TOOL / EQUIPMENT)
UPDATE recommendation_template
SET template_tags = JSON_ARRAY_APPEND(template_tags, '$', 'CONSUMABLE')
WHERE trait_excludes IS NOT NULL
  AND JSON_CONTAINS(trait_excludes, JSON_QUOTE('CONSUMABLE'))
  AND NOT JSON_CONTAINS(template_tags, JSON_QUOTE('CONSUMABLE'))
  AND template_id > 0;

UPDATE recommendation_template
SET template_tags = JSON_ARRAY_APPEND(template_tags, '$', 'TOOL')
WHERE trait_excludes IS NOT NULL
  AND JSON_CONTAINS(trait_excludes, JSON_QUOTE('TOOL'))
  AND NOT JSON_CONTAINS(template_tags, JSON_QUOTE('TOOL'))
  AND template_id > 0;

UPDATE recommendation_template
SET template_tags = JSON_ARRAY_APPEND(template_tags, '$', 'EQUIPMENT')
WHERE trait_excludes IS NOT NULL
  AND JSON_CONTAINS(trait_excludes, JSON_QUOTE('EQUIPMENT'))
  AND NOT JSON_CONTAINS(template_tags, JSON_QUOTE('EQUIPMENT'))
  AND template_id > 0;

-- 7) Verification
-- SELECT new_category_code, COUNT(*) FROM recommendation_template GROUP BY new_category_code ORDER BY COUNT(*) DESC;
-- SELECT category_code, item_name, new_category_code, ban_traits, template_tags
-- FROM recommendation_template
-- WHERE item_name REGEXP '계란|두부|순두부|김치|쌈무|햄|치즈|소시지|비엔나|훈제'
-- ORDER BY category_code, item_name;
-- SELECT category_code, item_name FROM recommendation_template WHERE new_category_code IS NULL;
