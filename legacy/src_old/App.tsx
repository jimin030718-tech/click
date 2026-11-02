import { useEffect, useState, type ChangeEvent } from "react";
import StepBar from "./StepBar";
import { ContentPage, DonePage, templateFor, type Draft } from "./ContentPage";
import { THEME_MOOD, themeTexts } from "./posterRender";


const categories = ["전체", "모집", "행사 안내", "공지/주의", "소개", "할인/프로모션"];

type LayoutKind = "top" | "bottom" | "middle" | "image";

const layoutKinds: { key: LayoutKind; label: string }[] = [
  { key: "top", label: "상단 텍스트형" },
  { key: "bottom", label: "하단 텍스트형" },
  { key: "middle", label: "중간 텍스트형" },
  { key: "image", label: "이미지 중심형" },
];

const posterThemes = [
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
];

const posters = posterThemes.flatMap((theme) =>
  layoutKinds.map((layout) => ({
    ...theme,
    id: `${theme.type}-${layout.key}`,
    layout: layout.key,
    layoutLabel: layout.label,
  })),
);

type Poster = (typeof posters)[number];

type PosterProps = {
  layout: LayoutKind;
};

function CommunityPoster({ layout }: PosterProps) {
  return (
    <div className={`poster community-poster layout-${layout}`}>
      <div className="poster-topline">
        <span>참여자 모집</span>
        <span>마을 프로젝트</span>
      </div>
      <div className="community-orbit" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="community-title">
        <span>함께 만드는</span>
        <strong>작은 변화</strong>
      </div>
      <p className="poster-copy">우리 동네를 더 다정하게 바꿀 새로운 이웃을 기다립니다.</p>
      <div className="poster-details">
        <div>
          <span>일시</span>
          <b>유월 이십이일 토요일</b>
        </div>
        <div>
          <span>장소</span>
          <b>다정한 마을회관</b>
        </div>
      </div>
    </div>
  );
}

function MusicPoster({ layout }: PosterProps) {
  return (
    <div className={`poster music-poster layout-${layout}`}>
      <div className="music-sun" aria-hidden="true">
        <span />
      </div>
      <div className="music-intro">도심 속 작은 연주회</div>
      <div className="music-title">
        <strong>초여름의</strong>
        <strong>음악 산책</strong>
      </div>
      <div className="music-wave" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <p className="poster-copy">바람과 나무, 그리고 선율이 머무는 저녁에 초대합니다.</p>
      <div className="music-footer">
        <span>유월 이십구일 오후 여섯 시</span>
        <span>숲길 야외무대</span>
      </div>
    </div>
  );
}

function NoticePoster({ layout }: PosterProps) {
  return (
    <div className={`poster notice-poster layout-${layout}`}>
      <div className="notice-badge">운영 안내</div>
      <div className="notice-title">
        <span>잠시</span>
        <strong>쉬어갑니다</strong>
      </div>
      <div className="notice-divider" />
      <p className="poster-copy">
        더 나은 공간을 준비하기 위해
        <br />
        잠시 문을 닫습니다.
      </p>
      <div className="notice-date">
        <span>휴무 기간</span>
        <strong>칠월 일일 — 칠월 사일</strong>
      </div>
      <div className="notice-mark" aria-hidden="true">
        <i />
        <i />
      </div>
    </div>
  );
}

function BookstorePoster({ layout }: PosterProps) {
  return (
    <div className={`poster bookstore-poster layout-${layout}`}>
      <div className="bookstore-kicker">동네에서 만나는 새로운 취향</div>
      <div className="bookstore-title">
        <span>천천히 읽고</span>
        <strong>오래 머무는 곳</strong>
      </div>
      <div className="book-stack" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="bookstore-name">느린 오후 책방</div>
      <p className="poster-copy">매일 새로운 문장과 따뜻한 차를 준비합니다.</p>
      <div className="bookstore-footer">
        <span>화요일부터 일요일</span>
        <span>오전 열한 시 — 오후 여덟 시</span>
      </div>
    </div>
  );
}

function PromotionPoster({ layout }: PosterProps) {
  return (
    <div className={`poster promotion-poster layout-${layout}`}>
      <div className="promo-tag">계절 특별전</div>
      <div className="promo-title">
        <span>여름맞이</span>
        <strong>특별 혜택</strong>
      </div>
      <div className="promo-burst">
        <span>최대</span>
        <strong>오십</strong>
        <span>퍼센트</span>
      </div>
      <p className="poster-copy">가볍고 산뜻한 여름의 물건을 특별한 가격으로 만나보세요.</p>
      <div className="promo-footer">
        <span>칠월 십오일까지</span>
        <b>온·오프라인 동시 진행</b>
      </div>
    </div>
  );
}

function TalkPoster() {
  return (
    <div className="poster talk-poster">
      <div className="talk-header">
        <span>한 달에 한 번</span>
        <span>마음 대화</span>
      </div>
      <div className="talk-shape" aria-hidden="true">
        <i />
        <i />
      </div>
      <div className="talk-title">
        <span>나를 돌보는</span>
        <strong>다정한 이야기</strong>
      </div>
      <p className="poster-copy">서로의 마음에 조용히 귀 기울이는 작은 대화 모임입니다.</p>
      <div className="talk-details">
        <span>칠월 여섯째 날 오후 두 시</span>
        <span>고요한 대화실</span>
      </div>
    </div>
  );
}

function PosterArtwork({ type, layout }: { type: string; layout: LayoutKind }) {
  switch (type) {
    case "community":
      return <CommunityPoster layout={layout} />;
    case "music":
      return <MusicPoster layout={layout} />;
    case "notice":
      return <NoticePoster layout={layout} />;
    case "bookstore":
      return <BookstorePoster layout={layout} />;
    case "promotion":
      return <PromotionPoster layout={layout} />;
    default:
      return <TalkPoster />;
  }
}

type UploadFieldProps = {
  id: string;
  title: string;
  description: string;
  accept: string;
  preview: string;
  previewAlt: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
};

function UploadField({
  id,
  title,
  description,
  accept,
  preview,
  previewAlt,
  onChange,
  onRemove,
}: UploadFieldProps) {
  return (
    <div className={`upload-field ${preview ? "has-preview" : ""}`}>
      <input id={id} type="file" accept={accept} onChange={onChange} />
      {preview ? (
        <>
          <img src={preview} alt={previewAlt} />
          <div className="upload-preview-actions">
            <label htmlFor={id}>파일 변경</label>
            <button type="button" onClick={onRemove}>
              삭제
            </button>
          </div>
        </>
      ) : (
        <label htmlFor={id} className="upload-empty">
          <span className="upload-icon" aria-hidden="true">
            <i />
          </span>
          <strong>{title}</strong>
          <span>{description}</span>
          <b>파일 선택</b>
        </label>
      )}
    </div>
  );
}

function UploadPage({
  poster,
  onBack,
  photoPreview,
  setPhotoPreview,
  logoPreview,
  setLogoPreview,
  onNext,
}: {
  poster: Poster;
  onBack: () => void;
  photoPreview: string;
  setPhotoPreview: (value: string) => void;
  logoPreview: string;
  setLogoPreview: (value: string) => void;
  onNext: () => void;
}) {
  const readFile = (
    event: ChangeEvent<HTMLInputElement>,
    setPreview: (value: string) => void,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <main className="upload-page">
      <StepBar current={2} />

      <section className="upload-heading">
        <button type="button" className="back-button" onClick={onBack} aria-label="템플릿 선택으로 돌아가기">
          ←
        </button>
        <div>
          <span className="section-kicker">디자인 만들기 · 2단계</span>
          <h1>사진과 로고를 추가해주세요</h1>
          <p>선택한 템플릿에 사용할 이미지를 올려주세요. 로고는 선택 사항이에요.</p>
        </div>
      </section>

      <div className="upload-layout">
        <aside className="selected-template">
          <div className="selected-poster">
            <PosterArtwork type={poster.type} layout={poster.layout} />
          </div>
          <div className="selected-template-meta">
            <span>선택한 템플릿</span>
            <strong>{poster.label}</strong>
            <p>
              {poster.category} · {poster.layoutLabel}
            </p>
          </div>
          <button type="button" onClick={onBack}>
            다른 템플릿 선택
          </button>
        </aside>

        <section className="upload-form" aria-label="이미지 업로드">
          <div className="upload-group">
            <div className="upload-group-heading">
              <div>
                <strong>메인 사진</strong>
                <span>필수</span>
              </div>
              <p>JPG, PNG 또는 WEBP · 최대 10MB</p>
            </div>
            <UploadField
              id="photo-upload"
              title="포스터에 사용할 사진을 올려주세요"
              description="클릭해서 파일을 선택할 수 있어요"
              accept="image/jpeg,image/png,image/webp"
              preview={photoPreview}
              previewAlt="업로드한 메인 사진 미리보기"
              onChange={(event) => readFile(event, setPhotoPreview)}
              onRemove={() => setPhotoPreview("")}
            />
          </div>

          <div className="upload-group">
            <div className="upload-group-heading">
              <div>
                <strong>브랜드 로고</strong>
                <span className="optional">선택</span>
              </div>
              <p>투명 배경의 PNG 또는 SVG를 권장해요</p>
            </div>
            <UploadField
              id="logo-upload"
              title="로고가 있다면 추가해주세요"
              description="나중에 건너뛸 수도 있어요"
              accept="image/png,image/svg+xml,image/webp"
              preview={logoPreview}
              previewAlt="업로드한 로고 미리보기"
              onChange={(event) => readFile(event, setLogoPreview)}
              onRemove={() => setLogoPreview("")}
            />
          </div>

          <div className="upload-form-footer">
            <p>업로드한 이미지는 이 디자인을 만드는 데에만 사용됩니다.</p>
            <button type="button" className="next-button" disabled={!photoPreview} onClick={onNext}>
              <span>내용 입력하기</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

type Page = "upload" | "content" | "done";

export default function App() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [selectedPosterId, setSelectedPosterId] = useState("");
  const [page, setPage] = useState<Page>("upload");
  const [photoPreview, setPhotoPreview] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [finalImage, setFinalImage] = useState("");
  const filteredPosters =
    activeCategory === "전체"
      ? posters
      : posters.filter((poster) => poster.category === activeCategory);
  const selectedPoster = posters.find((poster) => poster.id === selectedPosterId);

  // 화면이 바뀔 때마다 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedPosterId, page]);

  const goHome = () => {
    setSelectedPosterId("");
    setPage("upload");
  };

  // 템플릿마다 처음 들어올 때 기본 문구·분위기를 채운다
  const draftFor = (poster: Poster): Draft =>
    drafts[poster.id] ?? {
      texts: themeTexts(templateFor(poster.layout), poster.type),
      pos: {},
      mood: THEME_MOOD[poster.type] ?? "모던 / 깔끔",
    };

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" aria-label="CLICK 홈" onClick={goHome}>
          <img className="brand-mark" src="/assets/click-logo.png" alt="" />
          <span className="brand-name">CLICK</span>
        </button>
        <nav className="navigation" aria-label="주요 메뉴">
          <button>템플릿</button>
          <button>내 디자인</button>
          <button>이용 안내</button>
          <button
            className="create-button"
            onClick={() => {
              goHome();
              setTimeout(() => document.querySelector(".template-section")?.scrollIntoView({ behavior: "smooth" }), 50);
            }}
          >
            <span>새 디자인 만들기</span>
            <span aria-hidden="true">＋</span>
          </button>
        </nav>
      </header>

      {selectedPoster && page === "upload" ? (
        <UploadPage
          poster={selectedPoster}
          onBack={goHome}
          photoPreview={photoPreview}
          setPhotoPreview={setPhotoPreview}
          logoPreview={logoPreview}
          setLogoPreview={setLogoPreview}
          onNext={() => setPage("content")}
        />
      ) : selectedPoster && page === "content" ? (
        <ContentPage
          poster={selectedPoster}
          photoSrc={photoPreview}
          logoSrc={logoPreview}
          draft={draftFor(selectedPoster)}
          onDraft={(d) => setDrafts((prev) => ({ ...prev, [selectedPoster.id]: d }))}
          onBack={() => setPage("upload")}
          onDone={(url) => {
            setFinalImage(url);
            setPage("done");
          }}
        />
      ) : selectedPoster && page === "done" ? (
        <DonePage
          imageUrl={finalImage}
          onEdit={() => setPage("content")}
          onRestart={() => {
            setPhotoPreview("");
            setLogoPreview("");
            setDrafts({});
            goHome();
          }}
        />
      ) : (
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title">
            어떤 디자인을 만들고 싶으세요?
          </h1>
          <p className="hero-copy">
            간단하게 &quot;딸깍&quot;하고 포스터를 생성해보세요.
          </p>
          <div className="category-tabs" role="tablist" aria-label="포스터 분류">
            {categories.map((category) => (
              <button
                key={category}
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}
                role="tab"
                aria-selected={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="template-section" aria-label="포스터 템플릿">
          <div className="section-heading">
            <div>
              <span className="section-kicker">추천 템플릿</span>
              <h2>{activeCategory === "전체" ? "지금 인기 있는 디자인" : `${activeCategory} 디자인`}</h2>
            </div>
            <p>{filteredPosters.length}개의 템플릿</p>
          </div>

          <div className="template-grid">
            {filteredPosters.map((poster) => (
              <article className="template-card" key={poster.id}>
                <button
                  className="poster-button"
                  aria-label={`${poster.label} ${poster.layoutLabel} 템플릿 선택`}
                  onClick={() => {
                    setSelectedPosterId(poster.id);
                    setPage("upload");
                  }}
                >
                  <PosterArtwork type={poster.type} layout={poster.layout} />
                  <span className="card-action">
                    <span>이 디자인 사용하기</span>
                    <span aria-hidden="true">→</span>
                  </span>
                </button>
                <div className="card-meta">
                  <div>
                    <strong>{poster.layoutLabel}</strong>
                    <span>{poster.category}</span>
                  </div>
                  <button
                    aria-label={`${poster.label} ${poster.layoutLabel} 저장`}
                    className="save-button"
                  >
                    <span aria-hidden="true">♡</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      )}

      <footer>
        <span>CLICK</span>
        <p>누구나 쉽게, 좋은 디자인을 시작할 수 있도록.</p>
      </footer>
    </div>
  );
}
