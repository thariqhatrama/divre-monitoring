import Button from './Button'
import Modal from './Modal'

function ConfirmModal({
  cancelLabel = 'Batal',
  confirmLabel = 'Konfirmasi',
  description,
  loading = false,
  onCancel,
  onConfirm,
  open,
  title,
  variant = 'danger'
}) {
  return (
    <Modal description={description} onClose={loading ? undefined : onCancel} open={open} size="sm" title={title}>
      <div className="modal-footer">
        <Button disabled={loading} onClick={onCancel} type="button" variant="secondary">
          {cancelLabel}
        </Button>
        <Button disabled={loading} onClick={onConfirm} type="button" variant={variant}>
          {loading ? 'Memproses...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmModal
