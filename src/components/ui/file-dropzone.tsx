"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
  LockIcon,
  RotateCcwIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * File states, in the order they happen. `refused` is for files that will never work as sent
 * (encrypted, unsupported, too large); `failed` can be retried.
 */
export type FileState = "queued" | "uploading" | "processing" | "ready" | "failed" | "refused"

export type FileItem = {
  id: string
  name: string
  /** Bytes. */
  size?: number
  state: FileState
  /** 0–100 while uploading. */
  progress?: number
  /** Processing: "Reading 3 sheets". Ready: "12 pages · 2 tables". Failed/refused: what happened and what to do. */
  detail?: string
}

export function formatBytes(n?: number) {
  if (n === undefined) return ""
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${Math.round(n / 1024)} KB`
  return `${(n / 1024 ** 2).toFixed(1)} MB`
}

function iconFor(name: string, state: FileState) {
  if (state === "refused") return LockIcon
  const ext = name.split(".").pop()?.toLowerCase()
  if (["xlsx", "xls", "csv"].includes(ext ?? "")) return FileSpreadsheetIcon
  if (["pdf", "doc", "docx", "txt", "md", "eml", "msg"].includes(ext ?? "")) return FileTextIcon
  if (["png", "jpg", "jpeg", "gif", "webp", "heic"].includes(ext ?? "")) return ImageIcon
  if (["zip", "rar", "7z"].includes(ext ?? "")) return FileArchiveIcon
  return FileIcon
}

const STATE_WORD: Record<FileState, string> = {
  queued: "Waiting",
  uploading: "Uploading",
  processing: "Reading",
  ready: "Ready",
  failed: "Couldn't upload",
  refused: "Can't use this file",
}

/**
 * One file with its state. Progress is a real <progress> while uploading; failures say what
 * happened and offer Retry; refusals say why and what to send instead. Use in chat composers,
 * forms and the dropzone list.
 */
function FileRow({
  file,
  onRemove,
  onRetry,
  compact,
  className,
}: {
  file: FileItem
  onRemove?: () => void
  onRetry?: () => void
  /** Chip-sized, for composers. */
  compact?: boolean
  className?: string
}) {
  const icon = React.createElement(iconFor(file.name, file.state), { className: "size-4" })
  const bad = file.state === "failed" || file.state === "refused"
  return (
    <div
      className={cn(
        "relative flex min-w-0 items-center gap-2.5 rounded-lg border bg-surface-container-lowest",
        compact ? "max-w-80 py-1.5 pr-1.5 pl-2" : "p-3",
        bad ? "border-error/60" : "border-outline-variant",
        className
      )}
      data-slot="file-row"
      data-state={file.state}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md",
          compact ? "size-7" : "size-9",
          bad ? "bg-error-container text-on-error-container" : file.state === "ready" ? "bg-surface-container-high text-on-surface" : "bg-surface-container text-on-surface-variant"
        )}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-on-surface" title={file.name}>
          {file.name}
        </span>
        <span className={cn("flex min-w-0 gap-1 text-body-sm", bad ? "items-start text-error [&>svg]:mt-0.5" : "items-center text-on-surface-variant")}>
          {bad && <AlertTriangleIcon aria-hidden className="size-3.5 shrink-0" />}
          {file.state === "ready" && <CheckCircle2Icon aria-hidden className="size-3.5 shrink-0 text-success" />}
          {/* Problems wrap instead of truncating: the reason is the point (WCAG 1.4.12). */}
          <span className={cn(compact && !bad && "truncate")}>
            {STATE_WORD[file.state]}
            {file.state === "uploading" && file.progress !== undefined ? ` ${Math.round(file.progress)}%` : ""}
            {file.detail ? `: ${file.detail}` : file.size !== undefined && !bad ? ` · ${formatBytes(file.size)}` : ""}
          </span>
        </span>
        {file.state === "uploading" && (
          <progress
            aria-label={`Uploading ${file.name}`}
            className="mt-1 h-1 w-full appearance-none overflow-hidden rounded-full [&::-moz-progress-bar]:bg-on-surface [&::-webkit-progress-bar]:bg-surface-container-high [&::-webkit-progress-value]:bg-on-surface"
            max={100}
            value={file.progress ?? 0}
          />
        )}
        {file.state === "processing" && (
          <span aria-hidden className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-container-high">
            <span className="block h-full w-1/3 animate-[lark-indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-tertiary motion-reduce:animate-none" />
          </span>
        )}
      </span>
      {file.state === "failed" && onRetry && (
        <Button aria-label={`Retry ${file.name}`} onClick={onRetry} size={compact ? "icon-xs" : "sm"} variant="ghost">
          <RotateCcwIcon />
          {!compact && "Retry"}
        </Button>
      )}
      {onRemove && (
        <Button aria-label={`Remove ${file.name}`} onClick={onRemove} size={compact ? "icon-xs" : "icon-sm"} variant="ghost">
          <XIcon />
        </Button>
      )}
    </div>
  )
}

/**
 * Drop zone with a real file input (keyboard and screen-reader path is the button). Says what
 * is accepted and the limit before anyone tries. Validation happens in `onFiles`; return files
 * to the list with `refused` and a reason rather than silently dropping them.
 */
function FileDropzone({
  onFiles,
  accept,
  multiple = true,
  hint,
  label = "Drop files here or",
  buttonLabel = "Choose files",
  disabled,
  className,
}: {
  onFiles: (files: File[]) => void
  /** input accept, e.g. ".pdf,.xlsx,.docx" */
  accept?: string
  multiple?: boolean
  /** "PDF, Word or Excel, up to 25 MB each" */
  hint?: React.ReactNode
  label?: string
  buttonLabel?: string
  disabled?: boolean
  className?: string
}) {
  const input = React.useRef<HTMLInputElement>(null)
  const [over, setOver] = React.useState(false)
  const id = React.useId()
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-outline bg-surface-container-lowest px-4 py-6 text-center transition-colors",
        over && "border-primary bg-primary-container/40",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      data-slot="file-dropzone"
      onDragLeave={() => setOver(false)}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        onFiles([...e.dataTransfer.files])
      }}
    >
      <UploadIcon aria-hidden className="size-5 text-on-surface-variant" />
      <p className="text-sm text-on-surface">
        {label}{" "}
        <Button className="h-auto px-0 align-baseline" onClick={() => input.current?.click()} variant="link">
          {buttonLabel.toLowerCase()}
        </Button>
      </p>
      {hint && (
        <p className="text-body-sm text-on-surface-variant" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <input
        accept={accept}
        aria-describedby={hint ? `${id}-hint` : undefined}
        aria-label={buttonLabel}
        className="sr-only"
        disabled={disabled}
        multiple={multiple}
        onChange={(e) => {
          onFiles([...(e.target.files ?? [])])
          e.target.value = ""
        }}
        ref={input}
        tabIndex={-1}
        type="file"
      />
    </div>
  )
}

export { FileDropzone, FileRow }
