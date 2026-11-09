# CLICK (딸깍 포스터) — 작업 안내

이 저장소에서 코드를 고치는 사람과 AI 도우미가 모두 지켜야 할 규칙입니다.

## 프로젝트
- 소상공인(사장님)이 템플릿 선택 → 정보 입력 → 분위기 설정 → 부분 수정 → 내보내기 5단계로 포스터를 만드는 웹 서비스입니다.
- 기술: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 (`@tailwindcss/postcss`)
- import 경로는 `@/` = 저장소 루트입니다. 예: `@/lib/posters`, `@/components/ui/TemplateCard`

## 실행 방법
```
npm install      # 처음 한 번 (package.json이 바뀌었을 때도)
npm run dev      # 개발 서버 → http://localhost:3000
npm run build    # 고친 뒤 에러가 없는지 반드시 확인
```
- 빌드와 개발 서버는 webpack 모드(`--webpack`)로 돌립니다. 기본 모드(Turbopack)에서는 `app/globals.css` 맨 위의 Google 웹폰트 `@import`가 빠져서 글꼴이 바뀝니다.

## 폴더 지도와 담당
| 담당 | 폴더·파일 |
|---|---|
| **A (편집)** | `components/editor/`, `app/editor/` |
| **B (AI 흐름)** | `app/api/`, `lib/ai/`, `templates/` |
| **C (로그인·DB)** | `app/(auth)/`, `app/create/`, `lib/db/`, `components/create/` |
| **공용** — 고치기 전에 팀에 먼저 공유 | `components/ui/`, `app/layout.tsx`, `types/poster.ts`, `package.json` |

위 표에 없는 파일(`app/page.tsx`, `app/saved/` 등 다른 페이지, `app/globals.css`, `components/layout/`, `components/screens/`, `state/`, `lib/posters.ts`, `lib/styles.ts`, `public/`)은 담당이 정해질 때까지 **공용처럼** 다룹니다. 고치기 전에 팀에 먼저 공유하세요.

### 폴더 설명
```
app/                      주소(페이지). 폴더 이름 = 주소
  layout.tsx              모든 페이지 공통 틀 (상단 메뉴·푸터)
  globals.css             전체 스타일 (맨 위 웹폰트 @import 유지)
  page.tsx                홈 /  (카테고리 탭 + 템플릿 카드)
  saved/ guide/ new/      /saved 찜한 템플릿, /guide 이용 안내, /new 새 디자인
  create/[templateId]/    /create/템플릿id  디자인 만들기 2~5단계 (한 페이지 안에서 단계 이동)
  api/                    서버 API (AI 호출 등)
components/
  create/                 디자인 만들기 흐름: DesignFlow(단계 고르기), useDesignFlow(공유 상태),
                          InfoStep(2단계 정보 입력), MoodStep(3단계 분위기), CreateScreen(주소 연결)
  editor/                 PosterArtwork(포스터 그리기), EditorStep(4단계 편집), ExportStep(5단계 내보내기)
  ui/                     여러 곳에서 쓰는 조각 (TemplateCard, UploadField, WorkflowSteps)
  layout/                 AppShell: 상단 메뉴, 모바일 메뉴, 푸터, 맨 위로 가기, '나갈까요?' 확인 창
  screens/                찜한 템플릿·이용 안내·새 디자인 화면
lib/                      posters.ts(카테고리·템플릿·예시 문구), styles.ts(분위기·색·폰트), ai/, db/
types/poster.ts           팀 공통 Poster 데이터 모양
state/AppState.tsx        여러 페이지가 같이 쓰는 값 (찜 목록 등)
templates/                템플릿 자료
public/                   이미지 (/assets/... 주소로 사용)
legacy/                   예전 버전 코드(스마트 가이드 등). 빌드에 포함 안 됨. 참고용이니 지우지 않기
```

## 작업 규칙
- **남의 폴더는 고치지 않습니다.** 꼭 필요하면 담당자에게 먼저 말합니다.
- **범위를 정해서 작게** 작업합니다. 한 번에 한 기능·한 문제만 고칩니다.
- **"전체 정리", "전체 리팩토링" 같은 큰 작업은 하지 않습니다.** 요청받은 범위 밖의 파일 이름 바꾸기, 옮기기, 서식 일괄 변경도 하지 않습니다.
- 디자인 만들기 단계 화면(`InfoStep`, `MoodStep`, `EditorStep`, `ExportStep`)은 `<InfoStep />`이 아니라 `renderInfoStep(flow)`처럼 **함수로 호출**합니다. 상태는 `useDesignFlow` 한 곳에 있어서 단계를 넘겨도 입력 내용·사진·되돌리기 기록이 유지됩니다.
- 포스터 글자 위치는 포스터 크기 대비 **비율**(cqw/cqh)로 저장합니다. 편집기와 완성본이 같은 모습이어야 합니다.
- 사용자(사장님)가 보는 화면을 고쳤다면 **휴대폰 폭(390px)에서도** 깨지지 않는지 확인합니다.
- 고친 뒤에는 `npm run build`가 에러 없이 끝나는지 확인합니다.

## 브랜치와 커밋
- 브랜치 이름: `feature/기능이름` (새 기능), `fix/고칠내용` (버그 수정)
- **main에 직접 push하지 않습니다.** 브랜치에서 작업한 뒤 Pull Request(PR)로만 합칩니다.
- 커밋 메시지 앞머리:
  - `feat:` 새 기능
  - `fix:` 버그 수정
  - `style:` 화면 모양·스타일 수정
  - `docs:` 문서 수정
- 예: `feat: 내보내기 PNG 저장`, `fix: 휴대폰에서 메뉴가 안 닫히는 문제`

## 비밀 값 (API 키)
- API 키는 **`.env.local` 파일에만** 넣습니다. 이 파일은 **절대 커밋하지 않습니다.** (`.gitignore`에 들어 있음)
- API 키를 화면 코드(`"use client"` 파일)에 넣지 않습니다. AI 호출은 서버 쪽(`app/api/`, `lib/ai/`)에서만 합니다.

## 코드 작성 참고
- 브라우저에서 상태(state)나 클릭을 쓰는 파일은 맨 위에 `"use client"`를 붙입니다.
- 작은따옴표 문자열 안에 아포스트로피(')가 있으면 빌드가 깨집니다. 큰따옴표를 쓰거나 이스케이프하세요.
- JSX 태그가 닫혔는지, 괄호 짝이 맞는지 확인하세요.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
