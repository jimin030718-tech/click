// DB 데이터 모양 (C 담당) — 화면·서버 어디서나 import 해도 되는 파일

/** 가게 기본정보 (사장님 1명당 1개) */
export type BusinessInfo = {
  shopName: string // 가게 이름
  phone: string // 전화번호
  instagram: string // 인스타그램 아이디 (@ 없이)
  address: string // 주소 / 위치
  hours: string // 영업시간
}

export const emptyBusinessInfo: BusinessInfo = {
  shopName: "",
  phone: "",
  instagram: "",
  address: "",
  hours: "",
}

/** 칸마다 최대 글자 수 (화면 입력칸과 서버 저장에서 같이 사용) */
export const businessInfoLimits: Record<keyof BusinessInfo, number> = {
  shopName: 24,
  phone: 20,
  instagram: 30,
  address: 60,
  hours: 60,
}
