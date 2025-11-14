import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "./badge"

export interface MultiValueInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: string[]
  onChange?: (value: string[]) => void
}

function splitInput(value: string): string[] {
  return value
    .split(/\r?\n|,|;|\u2022|\u2023|\u25E6|\u2043|\u2219/)
    .map((part) => part.replace(/^[-*•◦‣∙]+\s*/, "").trim())
    .filter((part) => part.length > 0)
}

export const MultiValueInput = React.forwardRef<HTMLInputElement, MultiValueInputProps>(
  (
    { value = [], onChange, placeholder, disabled, className, onBlur, onKeyDown, ...props },
    forwardedRef,
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const assignRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node
        if (typeof forwardedRef === "function") {
          forwardedRef(node)
        } else if (forwardedRef) {
          forwardedRef.current = node
        }
      },
      [forwardedRef],
    )

    const [inputValue, setInputValue] = React.useState("")

    const emitChange = React.useCallback(
      (next: string[]) => {
        onChange?.(next)
      },
      [onChange],
    )

    const addValues = React.useCallback(
      (raw: string) => {
        const parts = splitInput(raw)
        if (parts.length === 0) return

        const existing = new Set(value)
        const next = [...value]
        for (const part of parts) {
          if (existing.has(part)) continue
          existing.add(part)
          next.push(part)
        }
        emitChange(next)
      },
      [emitChange, value],
    )

    const removeValue = React.useCallback(
      (index: number) => {
        const next = value.filter((_, i) => i !== index)
        emitChange(next)
      },
      [emitChange, value],
    )

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (disabled) return

        if (["Enter", ",", "Semicolon", "Tab"].includes(event.key)) {
          event.preventDefault()
          if (inputValue.trim().length > 0) {
            addValues(inputValue)
            setInputValue("")
          }
          return
        }

        if (event.key === "Backspace" && inputValue.length === 0 && value.length > 0) {
          event.preventDefault()
          removeValue(value.length - 1)
        }
      },
      [addValues, disabled, inputValue, onKeyDown, removeValue, value],
    )

    const handlePaste = React.useCallback(
      (event: React.ClipboardEvent<HTMLInputElement>) => {
        if (disabled) return
        const text = event.clipboardData.getData("text")
        if (!text) return
        event.preventDefault()
        addValues(text)
      },
      [addValues, disabled],
    )

    const handleBlur = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        if (!disabled && inputValue.trim().length > 0) {
          addValues(inputValue)
          setInputValue("")
        }
        onBlur?.(event)
      },
      [addValues, disabled, inputValue, onBlur],
    )

    const focusInput = React.useCallback(() => {
      if (disabled) return
      inputRef.current?.focus()
    }, [disabled])

    return (
      <div
        className={cn(
          "flex min-h-9 w-full flex-wrap items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors", 
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
        onClick={focusInput}
      >
        {value.map((item, index) => (
          <Badge
            key={`${item}-${index}`}
            variant="secondary"
            className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
          >
            <span>{item}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  removeValue(index)
                }}
                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            )}
          </Badge>
        ))}
        <input
          ref={assignRef}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : undefined}
          disabled={disabled}
          className="flex-1 min-w-[8rem] bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          {...props}
        />
      </div>
    )
  },
)

MultiValueInput.displayName = "MultiValueInput"
