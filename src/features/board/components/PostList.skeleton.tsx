import { motion } from 'framer-motion';
import { css } from 'styled-system/css';

function SkeletonCard() {
  return (
    <motion.div
      className={css({
        p: '6',
        borderRadius: 'lg',
        border: '1px solid',
        borderColor: 'brand.100',
        bg: 'white',
      })}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className={css({ h: '20px', w: '55%', bg: 'gray.100', borderRadius: 'sm', mb: '3' })} />
      <div className={css({ h: '14px', w: '90%', bg: 'gray.100', borderRadius: 'sm', mb: '2' })} />
      <div className={css({ h: '14px', w: '70%', bg: 'gray.100', borderRadius: 'sm', mb: '5' })} />
      <div className={css({ h: '11px', w: '28%', bg: 'gray.100', borderRadius: 'sm' })} />
    </motion.div>
  );
}

export function PostListSkeleton() {
  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
      {[0, 1, 2].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
