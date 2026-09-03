import { useEffect } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
  };

    return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto px-4 py-6 sm:px-0"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-all animate-fade-in"
        onClick={onClose}
      />

      {/* Centering wrapper */}
      <div className="relative flex items-center justify-center min-h-full">
        {/* Modal content */}
        <div className={`bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} overflow-hidden z-10 transform transition-all flex flex-col animate-slide-up`}>
          {/* Header */}
          {title && (
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-white sticky top-0 z-20">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all group"
                aria-label="Tutup modal"
              >
                <svg className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Body — ubah max-h-[70vh] menjadi max-h-[85vh] agar lebih panjang ke bawah */}
          <div className="p-6 overflow-y-auto max-h-[85vh] custom-scrollbar">
            {children}
          </div>

          {/* Footer (optional) */}
          {footer && (
            <div className="px-6 py-5 bg-slate-50 flex flex-row-reverse gap-3 border-t border-slate-100">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
