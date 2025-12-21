import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import type { CaseItem } from '@/http/caseAPI';
import { useTranslate } from '@/utils/useTranslate';
import LazyMediaRenderer from '@/utils/lazy-media-renderer';

type CaseItemsRibbonProps = {
  items?: CaseItem[];
  animations: { [url: string]: Record<string, unknown> };
};

const PrizeIcon: React.FC<{ item: CaseItem; className?: string }> = ({ item, className = '' }) => {
  if (item.type === 'gems') {
    return <i className={`fa-solid fa-gem text-amber-400 ${className}`} />;
  }
  if (item.type === 'energy') {
    return <i className={`fa-solid fa-bolt text-purple-400 ${className}`} />;
  }
  return <i className={`fas fa-gift text-white ${className}`} />;
};

const CaseItemsRibbon: React.FC<CaseItemsRibbonProps> = ({ items = [], animations }) => {
  const { t } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);

  const sortedItems = useMemo(() => {
    const list = [...items];
    list.sort((a, b) => (b.weight || 0) - (a.weight || 0));
    return list;
  }, [items]);

  if (!sortedItems.length) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-sm text-gray-300 font-semibold">{t('caseContents')}</div>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="w-8 h-8 hover:bg-primary-700 rounded-md flex items-center justify-center cursor-pointer"
          aria-label="Toggle case contents"
        >
          <motion.i
            className="fa-solid fa-chevron-down text-gray-300"
            animate={{ rotate: isOpen ? 0 : -90 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          />
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ overflow: 'hidden', pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {sortedItems.map((item) => {
            const isReward = item.type === 'reward';
            const title = isReward
              ? item.reward?.name || 'Reward'
              : item.type === 'gems'
                ? `+${item.amount ?? 0} ${t('gems')}`
                : `+${item.amount ?? 0} ${t('energy')}`;

            return (
              <div
                key={item.id}
                className="flex-shrink-0 flex flex-col gap-2 items-center w-28 bg-primary-800 border border-primary-700 rounded-xl p-3"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {isReward ? (
                    <LazyMediaRenderer
                      mediaFile={item.reward?.mediaFile}
                      imageUrl={item.reward?.mediaFile?.mimeType !== 'application/json' ? item.reward?.mediaFile?.url : undefined}
                      animations={animations}
                      name={item.reward?.name || ''}
                      className="w-8 h-8 object-contain"
                      loop={false}
                      loadOnIntersect={true}
                    />
                  ) : (
                    <PrizeIcon item={item} className="text-xl" />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="text-xs text-gray-200 text-center font-medium truncate">{title}</div>
                  {/* probability/weight can be shown here if needed */}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default CaseItemsRibbon;

