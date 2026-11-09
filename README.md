# CLICK — 딸깍 포스터

디자인을 몰라도 **"딸깍"** 몇 번으로 가게 포스터를 만들 수 있는 소상공인용 AI 포스터 제작 웹 서비스입니다.
2026-2 창업공모전 팀 프로젝트입니다.

## 이렇게 만들어요
1. **템플릿 고르기** — 행사, 할인, 공지 등 목적에 맞는 템플릿 선택
2. **정보 입력** — 가게 사진, 로고, 포스터에 들어갈 문구 입력
3. **분위기 설정** — 원하는 분위기와 색 조합을 고르면 AI가 배경을 생성
4. **부분 수정** — 글자, 사진, 배경, 로고를 직접 끌고 고치기
5. **내보내기** — 인쇄용·SNS용 크기로 저장

## 실행 방법
[Node.js](https://nodejs.org/) 22 이상이 필요합니다.

```
npm install      # 처음 한 번
npm run dev      # 개발 서버 실행
```
브라우저에서 http://localhost:3000 을 엽니다.

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 (고치면 바로 반영) |
| `npm run build` | 배포용 빌드 + 에러 확인 |
| `npm run start` | 빌드한 결과 실행 |

API 키가 필요한 기능은 루트에 `.env.local` 파일을 만들어 넣습니다. 이 파일은 커밋하지 않습니다.

## 기술
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4

## 폴더 구조
```
app/                  페이지 (폴더 이름 = 주소)
  page.tsx            홈 — 템플릿 목록
  saved/ guide/ new/  찜한 템플릿 · 이용 안내 · 새 디자인
  create/[templateId] 디자인 만들기 (정보 입력 → 분위기 → 편집 → 내보내기)
  api/                서버 API
components/
  create/             디자인 만들기 흐름 (정보 입력, 분위기)
  editor/             포스터 그리기, 편집, 내보내기
  ui/                 공용 조각 (템플릿 카드 등)
  layout/             상단 메뉴 · 푸터
  screens/            찜한 템플릿 · 이용 안내 · 새 디자인 화면
lib/                  템플릿·분위기·폰트 데이터, ai/, db/
types/                공용 데이터 타입 (Poster)
state/                여러 페이지가 같이 쓰는 값 (찜 목록)
templates/            템플릿 자료
public/               이미지
legacy/               예전 버전 코드 (참고용)
```

## 팀 작업 규칙
폴더별 담당, 브랜치·커밋 규칙, API 키 관리는 [AGENTS.md](./AGENTS.md)를 참고하세요.
