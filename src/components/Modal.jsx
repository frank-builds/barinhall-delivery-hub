// Modal — shared overlay shell.
//
// Provides the standard pattern: full-screen backdrop, centered card, Escape to
// close, body-scroll lock, optional default header bar with title/description
// and close button.
//
// Consumers only render their body content as children. If a custom header is
// needed (e.g. with custom controls), omit the `title` prop and render the
// header inside `children`.
//
// Usage:
//   <Modal open={isOpen} onClose={close} title="Add Use Cases" description="...">
//     {bodyContent}
//   </Modal>
//
// Props:
//   open               boolean  — render the modal when true
//   onClose            ()=>void — called on Escape, backdrop click, and × button
//   title              node     — optional header title (string or React node)
//   description        node     — optional header subtitle
//   maxWidth           string   — Tailwind max-width class (default 'max-w-2xl')
//   closeOnBackdrop    boolean  — default true; set false for forms with unsaved data
//   children           node     — body content
//   bodyClassName      string   — extra classes for the children wrapper (advanced)
//
// The card is `flex flex-col` so children can use `flex-1 overflow-y-auto`
// to make scrollable bodies with sticky headers/footers.

import { useEffect } from 'react';

export function Modal({
  open,
  onClose,
  title,
  description,
  maxWidth        = 'max-w-2xl',
  closeOnBackdrop = true,
  children,
}) {
  // Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
      onMouseDown={e => { if (closeOnBackdrop && e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : 'Modal dialog'}
    >
      <div className={`bg-white rounded-2xl shadow-modal w-full ${maxWidth} flex flex-col my-auto`}>
        {(title || description) && (
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
            <div className="min-w-0">
              {title && (
                <h2 className="text-base font-semibold text-slate-900 leading-snug">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
