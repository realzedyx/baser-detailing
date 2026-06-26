'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ErrorToast({ message, onClose }: { message: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-start gap-3 rounded-xl shadow-2xl"
          style={{
            background: 'rgba(28, 6, 6, 0.96)',
            border: '1px solid rgba(192,57,43,0.45)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            padding: '12px 14px 12px 16px',
            minWidth: 280,
            maxWidth: 420,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-px">
            <circle cx="8" cy="8" r="7" stroke="rgba(192,57,43,0.9)" strokeWidth="1.5" />
            <path d="M8 5v3.5M8 11h.01" stroke="rgba(192,57,43,0.9)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: 13, color: 'rgba(232,232,232,0.82)', flex: 1, lineHeight: 1.55 }}>
            {message}
          </p>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0 0 8px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
