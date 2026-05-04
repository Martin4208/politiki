-- politicians INSERT（人物の重複を排除）
INSERT INTO politicians (party_id, name, name_yomi, name_en, house, is_active) VALUES
(1, '高市 早苗', 'たかいち さなえ', 'Sanae Takaichi', '衆議院', TRUE),
(1, '石破 茂',   'いしば しげる',   'Shigeru Ishiba',  '衆議院', TRUE),
(1, '岸田 文雄', 'きしだ ふみお',   'Fumio Kishida',   '衆議院', TRUE),
(1, '菅 義偉',   'すが よしひで',   'Yoshihide Suga',  '衆議院', TRUE),
(NULL, '安倍 晋三', 'あべ しんぞう',   'Shinzo Abe',      '衆議院', FALSE),
(2, '野田 佳彦', 'のだ よしひこ',   'Yoshihiko Noda',  '衆議院', TRUE),
(NULL, '菅 直人',   'かん なおと',     'Naoto Kan',       '衆議院', FALSE),
(NULL, '鳩山 由紀夫','はとやま ゆきお', 'Yukio Hatoyama',  '衆議院', FALSE),
(1, '麻生 太郎', 'あそう たろう',   'Taro Aso',        '衆議院', TRUE),
(NULL, '福田 康夫', 'ふくだ やすお',   'Yasuo Fukuda',    '衆議院', FALSE),
(NULL, '小泉 純一郎','こいずみ じゅんいちろう','Junichiro Koizumi','衆議院', FALSE)
ON CONFLICT (name, name_yomi) DO NOTHING;