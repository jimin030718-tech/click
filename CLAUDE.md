@AGENTS.md

# CLICK — 소상공인용 AI 포스터 제작 웹

Claude Code가 작업을 시작할 때마다 자동으로 읽는 프로젝트 안내서입니다.

## 사용자
- 개발 초보자(비전공)입니다. **항상 한국어로**, 단계별로 짧게 설명해 주세요.
- 명령어는 Windows PowerShell 기준으로 안내해 주세요.
- 큰 변경 전에는 무엇을 바꿀지 먼저 한두 줄로 말하고, 작업 전에 커밋해 주세요.

## 프로젝트
- 2026-2 창업공모전 팀 프로젝트. 소상공인이 템플릿 선택 → 정보 입력 → 분위기 설정 → 부분 수정 → 내보내기(5단계)로 포스터를 만드는 웹 서비스.
- 화면 디자인 원본은 팀의 Figma Make 파일(2026-11-03 최종본)입니다. 이후 화면 수정은 이 프로젝트에서 합니다. 디자인팀 의견은 캡처 + 한 줄로 받아 반영합니다.

## 기술
- React 19 + Vite + TypeScript + Tailwind 4
- 실행: `npm run dev` → http://localhost:8443
- 확인: `npm run build` (수정 후 에러가 없는지 반드시 확인)

## 파일 구조 (src/)
- `App.tsx` — 상단 메뉴, 페이지 이동, 홈(템플릿 목록), 맨 위로 가기 버튼
- `pages/DesignFlow.tsx` — 디자인 만들기 2~5단계 전체(정보 입력, 분위기, 편집기, 내보내기)
- `pages/SavedPage.tsx` — 찜한 템플릿 / `pages/GuidePage.tsx` — 이용 안내 / `pages/NewDesignPage.tsx` — 새 디자인(크기 선택)
- `components/PosterArtwork.tsx` — 포스터 그리기(사진·글자·로고, 편집기에서 글자 직접 수정·끌기)
- `components/TemplateCard.tsx`, `components/UploadField.tsx`, `components/WorkflowSteps.tsx`
- `data/posters.ts` — 카테고리, 템플릿 20종, 예시 문구, 카테고리별 질문
- `data/styles.ts` — 폰트 조합, 분위기 7종과 색 조합
- `index.css` — 전체 스타일
- 루트의 `legacy/` — 예전 VS Code 버전(캔버스 렌더러, 스마트 가이드 PosterEditor 등). 빌드에 포함되지 않음. 스마트 가이드를 옮겨올 때 참고.

## 규칙
- `.env`(API 키)는 절대 커밋하거나 화면 코드에 넣지 마세요. AI 호출은 서버(Netlify Functions)에서만.
- 포스터 글자 위치는 포스터 크기 대비 비율(cqw/cqh)로 저장합니다. 편집기와 완성본이 같은 모습이어야 합니다.
- 수정 후 `npm run build`, 그리고 휴대폰 폭(390px)에서도 깨지지 않는지 확인하고, 브라우저에서 무엇을 눌러 확인하면 되는지 알려 주세요.

## 개발 순서
1. (완료) Figma Make 최종본 옮기기, 파일 나누기
2. 내보내기 버튼 3개가 실제 PNG 파일을 저장하게 (1240×1754 / 2480×3508 / SNS 크기)
3. Netlify 배포 + 팀 GitHub
4. AI 배경 생성 연결 (Netlify Functions + OpenAI), 배경만 새로 생성
5. 생성권(베타 코드별 10회)과 만족도 결과 서버 저장
6. 스마트 가이드 옮겨오기, "AI가 사진에 맞게"·참고 이미지·한 줄 요청 반영, 휴대폰 속도 개선
