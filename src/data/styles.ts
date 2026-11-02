

export type TextElement =
  | "title"
  | "subtitle"
  | "flavor"
  | "info"
  | "date"
  | "place"

export type TextObjectStyle = {
  color: string
  align: "left" | "center" | "right"
  font: string
  size: number
  width: number
  letterSpacing: number
  x: number
  y: number
}

export const defaultTextStyle: TextObjectStyle = {
  color: "#323232",
  align: "left",
  font: "mariburi",
  size: 100,
  width: 100,
  letterSpacing: 0,
  x: 0,
  y: 0,
}

export const fontCombinations = [
  {
    id: "mariburi",
    name: "부드러운 클래식",
    title: "마루부리",
    subtitle: "Pretendard Regular",
    body: "Pretendard Regular",
    families: {
      title: '"MaruBuri", "Noto Serif KR", serif',
      subtitle: "var(--font-sans)",
      body: "var(--font-sans)",
    },
  },
  {
    id: "bodoni",
    name: "우아한 명조",
    title: "Bodoni Moda",
    subtitle: "Noto Serif KR",
    body: "SUIT",
    families: {
      title: '"Bodoni Moda", "Noto Serif KR", serif',
      subtitle: '"Noto Serif KR", serif',
      body: '"SUIT", var(--font-sans)',
    },
  },
  {
    id: "archivo",
    name: "강렬한 포스터",
    title: "Archivo Black",
    subtitle: "Black Han Sans",
    body: "IBM Plex Sans KR",
    families: {
      title: '"Archivo Black", "Black Han Sans", sans-serif',
      subtitle: '"Black Han Sans", sans-serif',
      body: '"IBM Plex Sans KR", var(--font-sans)',
    },
  },
  {
    id: "gmarket",
    name: "친근한 브랜드",
    title: "Gmarket Sans Bold",
    subtitle: "Gmarket Sans Medium",
    body: "Pretendard",
    families: {
      title: '"GmarketSans", var(--font-sans)',
      subtitle: '"GmarketSans", var(--font-sans)',
      body: "var(--font-sans)",
    },
  },
  {
    id: "do-hyeon",
    name: "선명한 제목",
    title: "Do Hyeon",
    subtitle: "Gowun Dodum",
    body: "Gowun Dodum",
    families: {
      title: '"Do Hyeon", sans-serif',
      subtitle: '"Gowun Dodum", sans-serif',
      body: '"Gowun Dodum", sans-serif',
    },
  },
  {
    id: "jua",
    name: "둥글고 친근한",
    title: "Jua",
    subtitle: "Nanum Gothic",
    body: "Nanum Gothic",
    families: {
      title: '"Jua", sans-serif',
      subtitle: '"Nanum Gothic", sans-serif',
      body: '"Nanum Gothic", sans-serif',
    },
  },
  {
    id: "gaegu",
    name: "손글씨 감성",
    title: "Gaegu",
    subtitle: "Gowun Dodum",
    body: "Gowun Dodum",
    families: {
      title: '"Gaegu", cursive',
      subtitle: '"Gowun Dodum", sans-serif',
      body: '"Gowun Dodum", sans-serif',
    },
  },
  {
    id: "gowun-batang",
    name: "고운 명조",
    title: "Gowun Batang",
    subtitle: "Gowun Dodum",
    body: "Gowun Batang",
    families: {
      title: '"Gowun Batang", serif',
      subtitle: '"Gowun Dodum", sans-serif',
      body: '"Gowun Batang", serif',
    },
  },
  {
    id: "gowun-dodum",
    name: "단정한 고딕",
    title: "Gowun Dodum",
    subtitle: "Gowun Dodum",
    body: "Gowun Dodum",
    families: {
      title: '"Gowun Dodum", sans-serif',
      subtitle: '"Gowun Dodum", sans-serif',
      body: '"Gowun Dodum", sans-serif',
    },
  },
  {
    id: "hahmlet",
    name: "현대적인 명조",
    title: "Hahmlet",
    subtitle: "SUIT",
    body: "SUIT",
    families: {
      title: '"Hahmlet", serif',
      subtitle: '"SUIT", var(--font-sans)',
      body: '"SUIT", var(--font-sans)',
    },
  },
  {
    id: "nanum-gothic",
    name: "편안한 정보형",
    title: "Nanum Gothic",
    subtitle: "Nanum Gothic",
    body: "Nanum Gothic",
    families: {
      title: '"Nanum Gothic", sans-serif',
      subtitle: '"Nanum Gothic", sans-serif',
      body: '"Nanum Gothic", sans-serif',
    },
  },
  {
    id: "nanum-myeongjo",
    name: "정갈한 전통형",
    title: "Nanum Myeongjo",
    subtitle: "Nanum Gothic",
    body: "Nanum Myeongjo",
    families: {
      title: '"Nanum Myeongjo", serif',
      subtitle: '"Nanum Gothic", sans-serif',
      body: '"Nanum Myeongjo", serif',
    },
  },
  {
    id: "song-myung",
    name: "힘 있는 명조",
    title: "Song Myung",
    subtitle: "Gowun Dodum",
    body: "Gowun Batang",
    families: {
      title: '"Song Myung", serif',
      subtitle: '"Gowun Dodum", sans-serif',
      body: '"Gowun Batang", serif',
    },
  },
  {
    id: "sunflower",
    name: "밝은 브랜드형",
    title: "Sunflower",
    subtitle: "Nanum Gothic",
    body: "Nanum Gothic",
    families: {
      title: '"Sunflower", sans-serif',
      subtitle: '"Nanum Gothic", sans-serif',
      body: '"Nanum Gothic", sans-serif',
    },
  },
] as const

export const moodPresets = [
  {
    id: "auto",
    title: "AI가 사진에 맞게",
    caption: "업로드한 이미지에서 자동 추천",
    tone: "색감과 대비 자동 분석",
    palettes: [
      ["#E8E5DF", "#424B54", "#FFFFFF"],
      ["#D8DDD7", "#34443E", "#F6F2E9"],
      ["#E4D8CF", "#5A4038", "#FFF8F0"],
    ],
  },
  {
    id: "modern",
    title: "깔끔하고 모던한",
    caption: "여백이 돋보이는 미니멀",
    tone: "차분한 회백색",
    palettes: [
      ["#F0EFEB", "#363B3F", "#CAD0CF"],
      ["#E8EDF0", "#24313A", "#AAB8C2"],
      ["#F7F3ED", "#424B54", "#D7CFC3"],
    ],
  },
  {
    id: "maximal",
    title: "화려하고 눈에 띄는",
    caption: "시선을 끄는 이벤트 무드",
    tone: "강렬한 대비",
    palettes: [
      ["#FF4C24", "#5631BE", "#FFEF5B"],
      ["#E6007E", "#151515", "#62F5D2"],
      ["#FF7A00", "#164BFF", "#FFF5E1"],
    ],
  },
  {
    id: "natural",
    title: "따뜻하고 내추럴한",
    caption: "우드와 햇살의 감성",
    tone: "따뜻한 베이지",
    palettes: [
      ["#E9D9BD", "#57412F", "#9BA47C"],
      ["#F0E6D2", "#465843", "#C58D62"],
      ["#D8C6A7", "#6D4C3D", "#F7F0E5"],
    ],
  },
  {
    id: "retro",
    title: "레트로·빈티지 감성",
    caption: "정겨운 노포와 주점 무드",
    tone: "빛바랜 오렌지",
    palettes: [
      ["#C8492C", "#334E50", "#F5BD55"],
      ["#D96B3B", "#503C2F", "#E9D5A1"],
      ["#A83F2D", "#173F3A", "#F2C14E"],
    ],
  },
  {
    id: "dark",
    title: "고급스러운 다크",
    caption: "깊이 있는 프리미엄 무드",
    tone: "차콜과 골드",
    palettes: [
      ["#101112", "#D5AD5A", "#F3EEE4"],
      ["#202126", "#B98A50", "#D8D0C5"],
      ["#19231F", "#C6A96C", "#F2E8D8"],
    ],
  },
  {
    id: "fresh",
    title: "상큼하고 팝한",
    caption: "시즌 메뉴와 생과일 무드",
    tone: "라임과 코랄",
    palettes: [
      ["#D7F65B", "#145847", "#FF8D75"],
      ["#B8F2E6", "#FF5D6C", "#273043"],
      ["#FFF06A", "#6A4CFF", "#FF9F80"],
    ],
  },
] as const

export function adjustHexBrightness(hex: string, brightness: number) {
  const value = hex.replace("#", "")
  const amount = brightness / 100
  return `#${[0, 2, 4]
    .map((offset) =>
      Math.max(
        0,
        Math.min(
          255,
          Math.round(parseInt(value.slice(offset, offset + 2), 16) * amount),
        ),
      )
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`
}
