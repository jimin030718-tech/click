

export function WorkflowSteps({ step }: { step: 2 | 3 | 4 | 5 }) {
  const steps = [
    [1, "템플릿 선택"],
    [2, "정보 입력"],
    [3, "분위기 설정"],
    [4, "부분 수정"],
    [5, "내보내기"],
  ] as const

  return (
    <div className="workflow-steps" aria-label="디자인 만들기 진행 단계">
      {steps.map(([number, label], index) => (
        <div
          key={number}
          className={
            number < step ? "complete" : number === step ? "active" : ""
          }
        >
          <span>{number < step ? "✓" : number}</span>
          <b>{label}</b>
          {index < steps.length - 1 && <i />}
        </div>
      ))}
    </div>
  )
}
