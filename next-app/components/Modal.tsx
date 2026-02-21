import React, { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}


const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap and restore
  useEffect(() => {
    if (!open) return;
    lastActiveElement.current = document.activeElement as HTMLElement;
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      lastActiveElement.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 py-8 sm:py-0 font-primary"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Module details"
    >
      <div
        ref={modalRef}
        className="bg-paper-white rounded-md shadow-2xl max-w-2xl w-full mx-2 p-4 sm:p-8 relative animate-fadeIn outline-none focus-visible:ring-4 focus-visible:ring-electric-cyan max-h-[90vh] overflow-auto mt-8 border-2 border-signal-yellow box-border"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-2xl text-signal-yellow hover:text-deep-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan rounded-full bg-paper-white border-2 border-signal-yellow shadow"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="pt-2 sm:pt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
