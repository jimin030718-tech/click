"use client"

import { WorkflowSteps } from "@/components/ui/WorkflowSteps"
import { ExportOptions } from "@/components/editor/ExportOptions"
import type { DesignFlowState } from "@/components/create/useDesignFlow"

// 5단계: 내보내기
// 상태는 useDesignFlow에 있고, 이 함수는 화면만 그립니다.
// (컴포넌트 <X />가 아니라 함수로 호출해야 단계를 넘길 때 화면이 예전과 똑같이 이어집니다.)
export function renderExportStep(flow: DesignFlowState) {
  const {
    step,
    downloaded,
    rating,
    setRating,
    timeSaved,
    setTimeSaved,
    goBackStep,
    preview,
  } = flow

    return (
      <main className="workflow-page export-page-view">
        <WorkflowSteps step={step} />
        <section className="workflow-heading export-heading">
          <button
            type="button"
            className="back-button"
            onClick={goBackStep}
            aria-label="에디터로 돌아가기"
          >
            ←
          </button>
          <div>
            <span className="section-kicker">디자인 만들기 · 마지막 단계</span>
            <h1>포스터가 완성됐어요</h1>
            <p>사용할 곳에 맞는 크기를 고르면 선명한 파일로 준비해드려요.</p>
          </div>
        </section>
        <div className="export-layout">
          <aside className="export-preview">
            {preview}
            <span>최종 미리보기 · 1240 × 1754 px</span>
          </aside>
          <section className="export-options">
            {/* 파일 형식 고르기 + 내보내기 버튼(실제 PNG/PDF 저장) */}
            <ExportOptions flow={flow} />
            {downloaded && (
              <div className="download-success">
                <span>✓</span>
                <div>
                  <strong>파일을 저장했어요</strong>
                  <p>브라우저의 다운로드 폴더를 확인해 주세요.</p>
                </div>
              </div>
            )}
            <section className="feedback-card">
              <span>빠른 만족도 조사</span>
              <h2>오늘 포스터 제작은 만족스러우셨나요?</h2>
              <div className="rating-row" aria-label="별점 선택">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={star <= rating ? "selected" : ""}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p>기존 방식보다 시간이 얼마나 줄었나요?</p>
              <div className="time-chips">
                {["10분 이내", "30분 이상", "1시간 이상", "반나절 이상"].map(
                  (time) => (
                    <button
                      type="button"
                      key={time}
                      className={timeSaved === time ? "selected" : ""}
                      onClick={() => setTimeSaved(time)}
                    >
                      {time}
                    </button>
                  ),
                )}
              </div>
              {(rating > 0 || timeSaved) && (
                <small>
                  소중한 답변이 저장됐어요. 다음 포스터를 더 쉽게 만드는 데
                  활용할게요.
                </small>
              )}
            </section>
          </section>
        </div>
      </main>
    )
}
