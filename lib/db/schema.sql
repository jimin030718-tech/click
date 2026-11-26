-- 딸깍 포스터 DB 테이블 (C 담당)
-- 처음 한 번만 실행: npm run db:setup
-- 여러 번 실행해도 이미 있는 테이블은 건드리지 않아요 (IF NOT EXISTS).

-- 회원: 카카오 로그인한 사장님
CREATE TABLE IF NOT EXISTS users (
  kakao_id    TEXT PRIMARY KEY,              -- 카카오 회원번호 (session.user.id)
  name        TEXT,                          -- 카카오 닉네임
  image       TEXT,                          -- 카카오 프로필 사진 주소
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 가게 기본정보: 사장님 1명당 1개
CREATE TABLE IF NOT EXISTS business_info (
  kakao_id    TEXT PRIMARY KEY REFERENCES users(kakao_id) ON DELETE CASCADE,
  shop_name   TEXT NOT NULL DEFAULT '',      -- 가게 이름
  phone       TEXT NOT NULL DEFAULT '',      -- 전화번호
  instagram   TEXT NOT NULL DEFAULT '',      -- 인스타그램 아이디
  address     TEXT NOT NULL DEFAULT '',      -- 주소 / 위치
  hours       TEXT NOT NULL DEFAULT '',      -- 영업시간
  logo_url    TEXT,                          -- 로고 이미지 주소 (사진 업로드 기능 후 사용)
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 찜한 템플릿: 사장님 × 템플릿
CREATE TABLE IF NOT EXISTS favorites (
  kakao_id    TEXT NOT NULL REFERENCES users(kakao_id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,                 -- lib/posters.ts 의 템플릿 id
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (kakao_id, template_id)
);

-- AI 사용 기록: 누가, 언제, 무슨 AI 기능을 썼는지 (1인당 횟수 제한에 사용)
CREATE TABLE IF NOT EXISTS ai_usage (
  id          BIGSERIAL PRIMARY KEY,
  kakao_id    TEXT NOT NULL REFERENCES users(kakao_id) ON DELETE CASCADE,
  feature     TEXT NOT NULL,                 -- 기능 이름 (lib/db/aiUsage.ts 의 AI_LIMITS 참고)
  detail      TEXT,                          -- 참고용 메모 (예: 템플릿 id) — 선택
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- "이 사람이 오늘 이 기능을 몇 번 썼나"를 빨리 세기 위한 색인
CREATE INDEX IF NOT EXISTS ai_usage_user_feature_time
  ON ai_usage (kakao_id, feature, created_at);
