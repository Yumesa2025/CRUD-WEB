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

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useSetAtom(removeToastAtom);
  const Icon = ICONS[toast.variant];

  const variantStyle = {
    success: css({ bg: 'green.50', borderColor: 'green.200' }),
    error:   css({ bg: 'red.50',   borderColor: 'red.200'   }),
    warning: css({ bg: 'yellow.50',borderColor: 'yellow.200'}),
    info:    css({ bg: 'blue.50',  borderColor: 'blue.200'  }),
  }[toast.variant];

  const iconColor = {
    success: 'var(--colors-green-500)',
    error:   'var(--colors-red-500)',
    warning: 'var(--colors-yellow-500)',
    info:    'var(--colors-blue-500)',
  }[toast.variant];

  const titleColor = {
    success: css({ color: 'green.800' }),
    error:   css({ color: 'red.800'   }),
    warning: css({ color: 'yellow.800'}),
    info:    css({ color: 'blue.800'  }),
  }[toast.variant];

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
      }) + ' ' + variantStyle}
    >
      <Icon size={18} color={iconColor} style={{ flexShrink: 0, marginTop: 1 }} />
      <div className={css({ flex: '1', minW: '0' })}>
        <p className={css({ fontSize: 'sm', fontWeight: 'semibold' }) + ' ' + titleColor}>
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
