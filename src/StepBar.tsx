// StepBar.tsx - "1. 템플릿 선택 → 2. 사진 및 로고 업로드 → 3. 내용 입력 → 4. 완성" 진행 표시 (팀 피그마 디자인 그대로)
const STEPS = ["템플릿 선택", "사진 및 로고 업로드", "내용 입력", "완성"];

export default function StepBar({ current }: { current: number }) {
  return (
    <div className="upload-steps" aria-label="디자인 만들기 진행 단계">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const cls = n < current ? "complete" : n === current ? "active" : "";
        return (
          <span key={label} style={{ display: "contents" }}>
            {i > 0 && <i />}
            <span className={cls}>
              {n}. {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}
