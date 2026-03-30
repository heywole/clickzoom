import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-dark-card border border-dark-border rounded-2xl w-full ${sizes[size]} shadow-2xl animate-slide-up`}>
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-cz-gray hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-hover">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="px-6 pb-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
