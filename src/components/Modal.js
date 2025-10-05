'use client';

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
      <div className="bg-card-background text-foreground p-8 rounded-lg shadow-xl w-full max-w-md border border-border relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-2xl leading-none">
          &times;
        </button>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
}