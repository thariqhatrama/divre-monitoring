import { useEffect, useId, useRef } from 'react'

function Modal({ children, description, onClose, open, size = 'md', title }) {
  const titleId = useId()
  const descriptionId = useId()
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={`modal-dialog modal-${size}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          <button ref={closeButtonRef} aria-label="Tutup modal" className="modal-close" onClick={onClose} type="button">
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  )
}

export default Modal
