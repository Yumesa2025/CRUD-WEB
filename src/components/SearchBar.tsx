import { useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { css } from 'styled-system/css';
import { searchQueryAtom } from '@/stores/uiStore';

export function SearchBar() {
  const [query, setQuery] = useAtom(searchQueryAtom);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleClear = () => {
    setQuery('');
    setIsExpanded(false);
  };

  const handleBlur = () => {
    if (!query) setIsExpanded(false);
  };

  return (
    <div className={css({ display: 'flex', alignItems: 'center' })}>
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ width: 36, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 36, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '1',
              border: '1px solid',
              borderColor: 'brand.300',
              borderRadius: 'md',
              px: '2',
              py: '1.5',
              bg: 'white',
              boxShadow: '0 0 0 3px token(colors.brand.100)',
            })}
          >
            <Search size={14} className={css({ color: 'gray.400', flexShrink: '0' })} />
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={handleBlur}
              placeholder="검색어를 입력하세요"
              className={css({
                flex: '1',
                fontSize: 'sm',
                border: 'none',
                outline: 'none',
                bg: 'transparent',
                color: 'gray.700',
                minW: '0',
              })}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className={css({
                  color: 'gray.400',
                  border: 'none',
                  bg: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  p: '0',
                  flexShrink: '0',
                  _hover: { color: 'gray.600' },
                })}
              >
                <X size={14} />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            type="button"
            onClick={handleExpand}
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              w: '9',
              h: '9',
              borderRadius: 'md',
              border: '1px solid token(colors.brand.100)',
              color: 'brand.600',
              bg: 'transparent',
              cursor: 'pointer',
              _hover: { bg: 'brand.50' },
            })}
          >
            <Search size={16} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
