import { type ChangeEvent } from "react"

export type UploadFieldProps = {
  id: string
  title: string
  description: string
  accept: string
  preview: string
  previewAlt: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}

export function UploadField({
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
  )
}
