import Modal from './Modal';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger',
  loading = false,
}) {
  const btnClass = {
    danger: 'btn-danger',
    primary: 'btn-primary',
    success: 'btn-success',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`btn ${btnClass[variant] || btnClass.danger}`}
          disabled={loading}
          id="confirm-modal-btn"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Memproses...
            </span>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
}
