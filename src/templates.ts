// 자동 생성: 디자인팀 Figma JSON에서 추출한 템플릿 데이터
export type TextZone = { id: string; role: string; x: number; y: number; w: number; h: number };
// slot=true 인 도형에 업로드한 사진이 들어간다
export type PhotoZone = { shape: 'ellipse' | 'rect'; kind: string; slot: boolean; x: number; y: number; w: number; h: number };
export type Template = { name: string; group: string; w: number; h: number; texts: TextZone[]; photos: PhotoZone[] };

export const templates: Template[] = [
  {
    "name": "A형_정중앙",
    "group": "A",
    "w": 1240,
    "h": 1754,
    "texts": [
      {
        "id": "12:15",
        "role": "문구",
        "x": 409,
        "y": 78,
        "w": 423,
        "h": 62
      },
      {
        "id": "12:17",
        "role": "제목",
        "x": 409,
        "y": 208,
        "w": 423,
        "h": 62
      },
      {
        "id": "12:23",
        "role": "문구",
        "x": 409,
        "y": 338,
        "w": 423,
        "h": 62
      },
      {
        "id": "12:25",
        "role": "가격",
        "x": 186,
        "y": 520,
        "w": 223,
        "h": 62
      },
      {
        "id": "12:27",
        "role": "기간·상호",
        "x": 763,
        "y": 520,
        "w": 306,
        "h": 62
      }
    ],
    "photos": [
      {
        "shape": "ellipse",
        "kind": "ELLIPSE",
        "x": 69,
        "y": 701,
        "w": 1102,
        "h": 932,
        "slot": true
      }
    ]
  },
  {
    "name": "B형_사진 2분할 + 세부 정보형",
    "group": "B",
    "w": 1240,
    "h": 1754,
    "texts": [
      {
        "id": "15:27",
        "role": "문구",
        "x": 56,
        "y": 1113,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:29",
        "role": "제목",
        "x": 15,
        "y": 1258,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:30",
        "role": "문구",
        "x": 56,
        "y": 1403,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:31",
        "role": "문구",
        "x": 56,
        "y": 1569,
        "w": 259,
        "h": 62
      }
    ],
    "photos": [
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 0,
        "w": 1240,
        "h": 1051,
        "slot": false
      },
      {
        "shape": "rect",
        "kind": "RECTANGLE",
        "x": 0,
        "y": 0,
        "w": 609,
        "h": 1051,
        "slot": true
      },
      {
        "shape": "rect",
        "kind": "RECTANGLE",
        "x": 631,
        "y": 0,
        "w": 609,
        "h": 1051,
        "slot": true
      },
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 1051,
        "w": 1240,
        "h": 703,
        "slot": false
      }
    ]
  },
  {
    "name": "C형_위아래 사진 + 중앙 제목",
    "group": "C",
    "w": 1240,
    "h": 1754,
    "texts": [
      {
        "id": "15:70",
        "role": "문구",
        "x": 490,
        "y": 700,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:72",
        "role": "제목",
        "x": 490,
        "y": 813,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:73",
        "role": "가격",
        "x": 490,
        "y": 959,
        "w": 259,
        "h": 62
      }
    ],
    "photos": [
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 0,
        "w": 1240,
        "h": 600,
        "slot": false
      },
      {
        "shape": "rect",
        "kind": "RECTANGLE",
        "x": 0,
        "y": 0,
        "w": 1240,
        "h": 600,
        "slot": true
      },
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 600,
        "w": 1240,
        "h": 550,
        "slot": false
      },
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 1150,
        "w": 1240,
        "h": 604,
        "slot": false
      },
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 1150,
        "w": 1240,
        "h": 604,
        "slot": false
      },
      {
        "shape": "rect",
        "kind": "RECTANGLE",
        "x": 0,
        "y": 2300,
        "w": 1240,
        "h": 600,
        "slot": false
      }
    ]
  },
  {
    "name": "A형_대각선",
    "group": "A",
    "w": 1240,
    "h": 1754,
    "texts": [
      {
        "id": "12:39",
        "role": "문구",
        "x": 69,
        "y": 146,
        "w": 423,
        "h": 62
      },
      {
        "id": "12:40",
        "role": "제목",
        "x": 20,
        "y": 256,
        "w": 423,
        "h": 62
      },
      {
        "id": "12:41",
        "role": "문구",
        "x": 69,
        "y": 398,
        "w": 423,
        "h": 62
      },
      {
        "id": "12:42",
        "role": "가격",
        "x": 467,
        "y": 532,
        "w": 223,
        "h": 62
      },
      {
        "id": "12:43",
        "role": "맛 종류",
        "x": 105,
        "y": 532,
        "w": 306,
        "h": 62
      }
    ],
    "photos": [
      {
        "shape": "rect",
        "kind": "VECTOR",
        "x": -191,
        "y": 1713,
        "w": 1764,
        "h": 604,
        "slot": false
      }
    ]
  },
  {
    "name": "A형_화면 밖 확장형",
    "group": "A",
    "w": 1240,
    "h": 1754,
    "texts": [
      {
        "id": "13:4",
        "role": "문구",
        "x": 69,
        "y": 146,
        "w": 423,
        "h": 62
      },
      {
        "id": "13:5",
        "role": "제목",
        "x": 20,
        "y": 256,
        "w": 423,
        "h": 62
      },
      {
        "id": "13:6",
        "role": "문구",
        "x": 69,
        "y": 398,
        "w": 423,
        "h": 62
      },
      {
        "id": "13:7",
        "role": "가격",
        "x": 467,
        "y": 532,
        "w": 223,
        "h": 62
      },
      {
        "id": "13:8",
        "role": "맛 종류",
        "x": 105,
        "y": 532,
        "w": 306,
        "h": 62
      }
    ],
    "photos": [
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 701,
        "w": 1240,
        "h": 1053,
        "slot": false
      },
      {
        "shape": "ellipse",
        "kind": "ELLIPSE",
        "x": 15,
        "y": 701,
        "w": 1211,
        "h": 990,
        "slot": true
      },
      {
        "shape": "ellipse",
        "kind": "ELLIPSE",
        "x": 139,
        "y": 852,
        "w": 963,
        "h": 688,
        "slot": false
      }
    ]
  },
  {
    "name": "B형_겹친 사진 + 왼쪽 글형",
    "group": "B",
    "w": 1240,
    "h": 1754,
    "texts": [
      {
        "id": "15:49",
        "role": "문구",
        "x": 56,
        "y": 1113,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:50",
        "role": "제목",
        "x": 15,
        "y": 1258,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:51",
        "role": "문구",
        "x": 56,
        "y": 1403,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:52",
        "role": "문구",
        "x": 56,
        "y": 1569,
        "w": 259,
        "h": 62
      }
    ],
    "photos": [
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": -174,
        "w": 1240,
        "h": 1051,
        "slot": false
      },
      {
        "shape": "rect",
        "kind": "RECTANGLE",
        "x": 89,
        "y": 117,
        "w": 723,
        "h": 739,
        "slot": true
      },
      {
        "shape": "ellipse",
        "kind": "ELLIPSE",
        "x": 531,
        "y": 352,
        "w": 620,
        "h": 525,
        "slot": true
      },
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 1051,
        "w": 1240,
        "h": 703,
        "slot": false
      }
    ]
  },
  {
    "name": "B형_확대사진 + 오른쪽 글 형",
    "group": "B",
    "w": 1240,
    "h": 1754,
    "texts": [
      {
        "id": "15:55",
        "role": "문구",
        "x": 888,
        "y": 1144,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:56",
        "role": "제목",
        "x": 976,
        "y": 1289,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:57",
        "role": "문구",
        "x": 919,
        "y": 1434,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:58",
        "role": "문구",
        "x": 925,
        "y": 1600,
        "w": 259,
        "h": 62
      }
    ],
    "photos": [
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 0,
        "w": 1240,
        "h": 1051,
        "slot": false
      },
      {
        "shape": "rect",
        "kind": "RECTANGLE",
        "x": 0,
        "y": 0,
        "w": 1240,
        "h": 1051,
        "slot": true
      },
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 1051,
        "w": 1240,
        "h": 703,
        "slot": false
      }
    ]
  },
  {
    "name": "C형_대각 크롭 + 오른쪽 글",
    "group": "C",
    "w": 1240,
    "h": 1754,
    "texts": [
      {
        "id": "15:79",
        "role": "문구",
        "x": 934,
        "y": 655,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:80",
        "role": "제목",
        "x": 934,
        "y": 827,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:81",
        "role": "가격",
        "x": 934,
        "y": 973,
        "w": 259,
        "h": 62
      }
    ],
    "photos": [
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 0,
        "w": 1240,
        "h": 636,
        "slot": false
      },
      {
        "shape": "rect",
        "kind": "VECTOR",
        "x": 1239,
        "y": 1786,
        "w": 1012,
        "h": 636,
        "slot": false
      },
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 600,
        "w": 1240,
        "h": 550,
        "slot": false
      },
      {
        "shape": "rect",
        "kind": "VECTOR",
        "x": 0,
        "y": 0,
        "w": 1012,
        "h": 600,
        "slot": true
      }
    ]
  },
  {
    "name": "C형_기본 사진 + 확대사진",
    "group": "C",
    "w": 1240,
    "h": 1754,
    "texts": [
      {
        "id": "15:91",
        "role": "문구",
        "x": 490,
        "y": 700,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:92",
        "role": "제목",
        "x": 490,
        "y": 813,
        "w": 259,
        "h": 62
      },
      {
        "id": "15:93",
        "role": "가격",
        "x": 490,
        "y": 959,
        "w": 259,
        "h": 62
      }
    ],
    "photos": [
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 0,
        "w": 1240,
        "h": 600,
        "slot": false
      },
      {
        "shape": "rect",
        "kind": "RECTANGLE",
        "x": 144,
        "y": 46,
        "w": 952,
        "h": 508,
        "slot": true
      },
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 600,
        "w": 1240,
        "h": 550,
        "slot": false
      },
      {
        "shape": "rect",
        "kind": "FRAME",
        "x": 0,
        "y": 1150,
        "w": 1240,
        "h": 604,
        "slot": false
      },
      {
        "shape": "ellipse",
        "kind": "ELLIPSE",
        "x": -218,
        "y": 1150,
        "w": 1675,
        "h": 741,
        "slot": true
      }
    ]
  }
];

export const groups = ['A','B','C'] as const;
export function byGroup(g: string){ return templates.filter(t => t.group === g); }
