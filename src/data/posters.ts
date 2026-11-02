

export const categories = [
  "전체",
  "모집",
  "행사 안내",
  "공지/주의",
  "소개",
  "할인/프로모션",
]

export type LayoutKind = "top" | "bottom" | "middle" | "image"

export const layoutKinds: { key: LayoutKind; label: string }[] = [
  { key: "top", label: "상단 텍스트형" },
  { key: "bottom", label: "하단 텍스트형" },
  { key: "middle", label: "중간 텍스트형" },
  { key: "image", label: "이미지 중심형" },
]

export const posterThemes = [
  {
    category: "모집",
    label: "함께 만드는 작은 변화",
    type: "community",
  },
  {
    category: "행사 안내",
    label: "초여름의 음악 산책",
    type: "music",
  },
  {
    category: "공지/주의",
    label: "잠시 쉬어갑니다",
    type: "notice",
  },
  {
    category: "소개",
    label: "우리 동네 책방",
    type: "bookstore",
  },
  {
    category: "할인/프로모션",
    label: "여름맞이 특별 혜택",
    type: "promotion",
  },
]

export const posters = posterThemes.flatMap((theme) =>
  layoutKinds.map((layout) => ({
    ...theme,
    id: `${theme.type}-${layout.key}`,
    layout: layout.key,
    layoutLabel: layout.label,
  })),
)

export type Poster = typeof posters[number]
export type Page = "home" | "saved" | "guide" | "new"

export const posterContent: Record<string, {
  eyebrow: string
  title: string
  titleAccent: string
  copy: string
  date: string
  place: string
  issue: string
}> = {
  community: {
    eyebrow: "LOCAL PROJECT · OPEN CALL",
    title: "함께 만드는",
    titleAccent: "작은 변화",
    copy: "우리 동네를 더 다정하게 바꿀 새로운 이웃을 기다립니다.",
    date: "06.22 SAT · 14:00",
    place: "다정한 마을회관",
    issue: "01",
  },
  music: {
    eyebrow: "A WALK WITH MUSIC",
    title: "초여름의",
    titleAccent: "음악 산책",
    copy: "바람과 나무, 그리고 선율이 머무는 저녁에 초대합니다.",
    date: "06.29 SAT · 18:00",
    place: "숲길 야외무대",
    issue: "02",
  },
  notice: {
    eyebrow: "SERVICE NOTICE · JULY",
    title: "잠시",
    titleAccent: "쉬어갑니다",
    copy: "더 나은 공간을 준비하기 위해 잠시 문을 닫습니다.",
    date: "07.01 MON — 07.04 THU",
    place: "운영 재개 07.05",
    issue: "03",
  },
  bookstore: {
    eyebrow: "SLOW AFTERNOON BOOKS",
    title: "천천히 읽고",
    titleAccent: "오래 머무는 곳",
    copy: "매일 새로운 문장과 따뜻한 차를 준비합니다.",
    date: "TUE — SUN · 11:00–20:00",
    place: "느린 오후 책방",
    issue: "04",
  },
  promotion: {
    eyebrow: "SEASON SPECIAL · ONLINE/OFFLINE",
    title: "여름맞이",
    titleAccent: "특별 혜택",
    copy: "가볍고 산뜻한 여름의 물건을 특별한 가격으로 만나보세요.",
    date: "UP TO 50% · 07.15까지",
    place: "온·오프라인 동시 진행",
    issue: "05",
  },
}

export const questionsByCategory: Record<string, {
  key: string
  label: string
  hint: string
  placeholder: string
}[]> = {
  모집: [
    {
      key: "name",
      label: "어떤 사람을 모집하나요?",
      hint: "대상과 역할을 알려주세요.",
      placeholder: "예: 동네 기록 프로젝트에 참여할 사진가 5명",
    },
    {
      key: "purpose",
      label: "함께 무엇을 하게 되나요?",
      hint: "활동의 목적과 내용을 짧게 적어주세요.",
      placeholder: "예: 동네의 오래된 가게를 사진과 글로 기록해요",
    },
    {
      key: "schedule",
      label: "언제, 어디에서 진행하나요?",
      hint: "기간과 장소를 한 번에 적어도 좋아요.",
      placeholder: "예: 6월 22일부터 4주간, 매주 토요일 마을회관",
    },
    {
      key: "benefit",
      label: "참여자가 얻는 것은 무엇인가요?",
      hint: "혜택이나 특별한 경험을 알려주세요.",
      placeholder: "예: 결과물 전시, 활동 인증서, 소정의 활동비",
    },
  ],
  "행사 안내": [
    {
      key: "name",
      label: "행사 이름은 무엇인가요?",
      hint: "아직 정하지 않았다면 핵심 키워드만 적어주세요.",
      placeholder: "예: 초여름 숲길 음악회",
    },
    {
      key: "purpose",
      label: "어떤 경험을 주는 행사인가요?",
      hint: "프로그램과 분위기를 설명해주세요.",
      placeholder: "예: 숲속에서 어쿠스틱 공연과 피크닉을 즐겨요",
    },
    {
      key: "schedule",
      label: "행사 일시와 장소는요?",
      hint: "정확하지 않은 정보는 대략 적어도 괜찮아요.",
      placeholder: "예: 6월 29일 오후 6시, 서울숲 야외무대",
    },
    {
      key: "benefit",
      label: "꼭 알려야 할 참여 정보가 있나요?",
      hint: "입장료, 신청 방법, 준비물 등을 적어주세요.",
      placeholder: "예: 무료 입장, 돗자리 지참, 우천 시 실내 진행",
    },
  ],
  "공지/주의": [
    {
      key: "name",
      label: "무엇을 안내해야 하나요?",
      hint: "변경되거나 주의가 필요한 내용을 알려주세요.",
      placeholder: "예: 공간 리뉴얼에 따른 임시 휴무",
    },
    {
      key: "purpose",
      label: "이유를 어떻게 설명할까요?",
      hint: "방문자가 이해하기 쉽게 적어주세요.",
      placeholder: "예: 더 쾌적한 공간과 새로운 메뉴를 준비하고 있어요",
    },
    {
      key: "schedule",
      label: "적용 기간은 언제인가요?",
      hint: "시작일과 종료일을 적어주세요.",
      placeholder: "예: 7월 1일부터 4일까지, 5일부터 정상 운영",
    },
    {
      key: "benefit",
      label: "문의나 대체 이용 방법이 있나요?",
      hint: "연락처 또는 이용 가능한 채널을 적어주세요.",
      placeholder: "예: 온라인 주문은 정상 운영, 문의 02-123-4567",
    },
  ],
  소개: [
    {
      key: "name",
      label: "무엇을 소개하고 싶나요?",
      hint: "브랜드, 공간 또는 서비스를 알려주세요.",
      placeholder: "예: 동네 독립서점 ‘느린 오후’",
    },
    {
      key: "purpose",
      label: "가장 특별한 점은 무엇인가요?",
      hint: "다른 곳과 구별되는 매력을 적어주세요.",
      placeholder: "예: 독립출판물과 계절 차를 함께 즐길 수 있어요",
    },
    {
      key: "schedule",
      label: "언제, 어디에서 만날 수 있나요?",
      hint: "운영 시간과 위치를 알려주세요.",
      placeholder: "예: 화–일 11시–20시, 연남동 골목 2층",
    },
    {
      key: "benefit",
      label: "사람들에게 어떤 인상을 주고 싶나요?",
      hint: "원하는 분위기나 핵심 메시지를 적어주세요.",
      placeholder: "예: 천천히 둘러보고 오래 머물 수 있는 편안함",
    },
  ],
  "할인/프로모션": [
    {
      key: "name",
      label: "어떤 혜택을 제공하나요?",
      hint: "할인율이나 증정 혜택을 알려주세요.",
      placeholder: "예: 여름 컬렉션 최대 50% 할인",
    },
    {
      key: "purpose",
      label: "어떤 상품이 대상인가요?",
      hint: "대표 상품과 제외 항목을 적어주세요.",
      placeholder: "예: 의류와 라이프스타일 전 제품, 신상품 일부 제외",
    },
    {
      key: "schedule",
      label: "프로모션 기간은 언제인가요?",
      hint: "시작일과 종료일을 알려주세요.",
      placeholder: "예: 7월 1일부터 15일까지",
    },
    {
      key: "benefit",
      label: "어디에서 참여할 수 있나요?",
      hint: "매장, 웹사이트 또는 쿠폰 조건을 적어주세요.",
      placeholder: "예: 온·오프라인 동시 진행, 회원은 추가 5%",
    },
  ],
}
