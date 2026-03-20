import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { css } from 'styled-system/css';
import { toastsAtom, removeToastAtom, type Toast } from '@/stores/uiStore';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { bg: 'green.50', border: 'green.200', icon: 'var(--colors-green-500)', text: 'green.800' },
  error:   { bg: 'red.50',   border: 'red.200',   icon: 'var(--colors-red-500)',   text: 'red.800'   },
  warning: { bg: 'yellow.50',border: 'yellow.200',icon: 'var(--colors-yellow-500)',text: 'yellow.800'},
  info:    { bg: 'blue.50',  border: 'blue.200',  icon: 'var(--colors-blue-500)',  text: 'blue.800'  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useSetAtom(removeToastAtom);
  const Icon = ICONS[toast.variant];
  const colors = COLORS[toast.variant];

  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), toast.duration ?? 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, remove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={css({
        display: 'flex',
        alignItems: 'flex-start',
        gap: '3',
        minW: '280px',
        maxW: '360px',
        p: '4',
        borderRadius: 'lg',
        border: '1px solid',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        bg: colors.bg as Parameters<typeof css>[0]['bg'],
        borderColor: colors.border as Parameters<typeof css>[0]['borderColor'],
      })}
    >
      <Icon size={18} color={colors.icon} style={{ flexShrink: 0, marginTop: 1 }} />
      <div className={css({ flex: '1', minW: '0' })}>
        <p className={css({ fontSize: 'sm', fontWeight: 'semibold', color: colors.text as Parameters<typeof css>[0]['color'] })}>
          {toast.title}
        </p>
        {toast.description && (
          <p className={css({ mt: '0.5', fontSize: 'xs', color: 'gray.600' })}>
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => remove(toast.id)}
        className={css({
          flexShrink: '0',
          color: 'gray.400',
          cursor: 'pointer',
          border: 'none',
          bg: 'transparent',
          p: '0',
          _hover: { color: 'gray.600' },
        })}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function Toast() {
  const toasts = useAtomValue(toastsAtom);

  return (
    <div
      className={css({
        position: 'fixed',
        bottom: '6',
        right: '6',
        display: 'flex',
        flexDirection: 'column',
        gap: '3',
        zIndex: '9999',
      })}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
