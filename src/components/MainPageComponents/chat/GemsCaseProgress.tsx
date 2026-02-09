import React, { useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import { useAnimationLoader } from '@/utils/useAnimationLoader';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';
import type { CaseBox } from '@/http/caseAPI';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

const GEM_GRADIENT = 'linear-gradient(to right, #eab308, #f97316)';
const FILL_ANIMATION_DURATION_MS = 1600;
const SEGMENT_HEIGHT_NORMAL = 12;
const SEGMENT_HEIGHT_ANIMATING = 20;

const sortedCasesByPrice = (cases: CaseBox[]): CaseBox[] =>
  [...cases].sort((a, b) => a.price - b.price);

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

const GemsCaseProgressBase: React.FC = () => {
  const { user, cases, chat } = useContext(Context) as IStoreContext;
  const { t, language } = useTranslate();
  const { hapticImpact } = useHapticFeedback();
  const navigate = useNavigate();
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [isFillAnimating, setIsFillAnimating] = useState(false);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    cases.fetchActiveCases();
  }, [cases]);

  const [boxAnimations] = useAnimationLoader<CaseBox>(
    cases.activeCases,
    (box) => box.mediaFile,
    [cases.activeCases.length]
  );

  const sortedCases = sortedCasesByPrice(cases.activeCases);
  const balance = user.user?.balance ?? 0;
  const pending = chat.pendingProgressAnimation;
  const effectiveBalance = pending ? displayBalance : balance;

  useEffect(() => {
    if (!pending) {
      setIsFillAnimating(false);
      return;
    }
    const { from, to } = pending;
    setDisplayBalance(from);
    setIsFillAnimating(true);
    const start = performance.now();
    const cancel = () => {
      if (animRef.current != null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / FILL_ANIMATION_DURATION_MS);
      const eased = easeOutCubic(t);
      setDisplayBalance(from + (to - from) * eased);
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        animRef.current = null;
        chat.clearPendingProgressAnimation();
        setIsFillAnimating(false);
      }
    };
    animRef.current = requestAnimationFrame(tick);
    return cancel;
  }, [pending, chat]);

  useEffect(() => {
    if (tooltipIndex === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      setTooltipIndex(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tooltipIndex]);

  if (sortedCases.length === 0) {
    return null;
  }

  const getSegmentFill = (segmentIndex: number, useBalance: number): number => {
    const start = segmentIndex === 0 ? 0 : sortedCases[segmentIndex - 1].price;
    const end = sortedCases[segmentIndex].price;
    if (useBalance <= start) return 0;
    if (useBalance >= end) return 100;
    return ((useBalance - start) / (end - start)) * 100;
  };

  const animatingSegmentIndex =
    pending != null
      ? (() => {
          const idx = sortedCases.findIndex((box) => box.price >= pending.to);
          return idx >= 0 ? idx : sortedCases.length - 1;
        })()
      : null;

  const tooltipAlignClass =
    tooltipIndex === null
      ? ''
      : tooltipIndex === 0
        ? 'left-0'
        : tooltipIndex === sortedCases.length - 1
          ? 'right-0 left-auto'
          : 'left-1/2 -translate-x-1/2';

  return (
    <div ref={containerRef} className="flex flex-col gap-2 w-full relative">
      <div className="flex items-center gap-1 w-full overflow-visible items-center">
        {sortedCases.map((box, segmentIndex) => {
          const fillPercent = getSegmentFill(segmentIndex, effectiveBalance);
          const reached = effectiveBalance >= box.price;
          const isAnimatingSegment = isFillAnimating && animatingSegmentIndex === segmentIndex;

          return (
            <React.Fragment key={box.id}>
              <motion.div
                className="relative flex-1 min-w-0 overflow-hidden flex items-center"
                animate={{
                  height: isAnimatingSegment ? SEGMENT_HEIGHT_ANIMATING : SEGMENT_HEIGHT_NORMAL,
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div
                  className="absolute inset-0 bg-primary-700 rounded-full"
                />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary-700 rounded-full"
                  style={{
                    background: GEM_GRADIENT,
                    boxShadow: isAnimatingSegment ? '0 0 16px rgba(249, 115, 22, 0.5)' : 'none',
                  }}
                  initial={false}
                  animate={{ width: `${fillPercent}%` }}
                  transition={{ duration: pending ? 0.2 : 0.3, ease: 'easeOut' }}
                />
              </motion.div>

              <div className="relative z-10 shrink-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    hapticImpact('soft');
                    setTooltipIndex((prev) => (prev === segmentIndex ? null : segmentIndex));
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center btn-default-silver-border text-foreground hover:brightness-110 active:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:shadow-none transition-colors"
                  style={{
                    background: reached ? GEM_GRADIENT : 'btn-default-silver-border',
                    color: reached ? '#fff' : 'rgb(156 163 175)',
                  }}
                  aria-label={language === 'en' ? (box.nameEn || box.name) : box.name}
                >
                  {reached ? <i className="fa-solid fa-check text-[10px]" /> : null}
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <AnimatePresence>
        {tooltipIndex !== null && (() => {
          const box = sortedCases[tooltipIndex];
          const reached = effectiveBalance >= box.price;
          const title = language === 'en' ? (box.nameEn || box.name) : box.name;
          return (
            <motion.div
              key={tooltipIndex}
              ref={tooltipRef}
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`absolute bottom-full mb-2 z-50 w-48 rounded-xl overflow-hidden btn-default-silver-border shadow-xl ${tooltipAlignClass}`}
            >
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 shrink-0 flex items-center justify-center rounded-lg overflow-hidden">
                    <LazyMediaRenderer
                      mediaFile={box.mediaFile}
                      animations={boxAnimations}
                      name={title}
                      className="w-full h-full object-contain"
                      loop={false}
                      loadOnIntersect
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{title}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <span>{box.price}</span>
                      <i className="fa-solid fa-gem text-secondary-gradient text-[10px]" />
                    </div>
                  </div>
                </div>
                {reached && (
                  <button
                    type="button"
                    onClick={() => {
                      hapticImpact('soft');
                      setTooltipIndex(null);
                      navigate(`/cases/${box.id}`);
                    }}
                    className="w-full py-1.5 rounded-lg text-xs font-medium text-white transition opacity hover:opacity-90"
                    style={{ background: GEM_GRADIENT }}
                  >
                    {t('open')}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

const GemsCaseProgress = observer(GemsCaseProgressBase);
export default GemsCaseProgress;
