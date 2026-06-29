import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"

const FeedbackContext = createContext(null)

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)
  const toastSeq = useRef(0)

  const dismissToast = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id))
  }, [])

  const showToast = useCallback(({ message, type = "info", duration = 2600 }) => {
    const id = ++toastSeq.current
    setToasts((items) => [...items, { id, message, type }])
    window.setTimeout(() => dismissToast(id), duration)
  }, [dismissToast])

  const confirmDialog = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        title: options.title || "확인",
        message: options.message,
        confirmText: options.confirmText || "확인",
        cancelText: options.cancelText || "취소",
        variant: options.variant || "default",
        resolve,
      })
    })
  }, [])

  const closeConfirm = useCallback((result) => {
    setConfirmState((current) => {
      current?.resolve(result)
      return null
    })
  }, [])

  const value = useMemo(() => ({ showToast, confirmDialog }), [showToast, confirmDialog])

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="fixed left-1/2 top-4 z-50 flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg ring-1 ring-border ${
              toast.type === "error"
                ? "bg-red-500 text-white"
                : toast.type === "success"
                  ? "bg-teal text-teal-foreground"
                  : "bg-dark text-dark-foreground"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-card p-5 shadow-2xl ring-1 ring-border">
            <h2 className="text-base font-bold text-foreground">{confirmState.title}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {confirmState.message}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="h-11 rounded-xl bg-background text-sm font-semibold text-foreground ring-1 ring-border"
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className={`h-11 rounded-xl text-sm font-semibold ${
                  confirmState.variant === "danger"
                    ? "bg-red-500 text-white"
                    : "bg-teal text-teal-foreground"
                }`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error("useFeedback must be used within FeedbackProvider")
  }
  return context
}
