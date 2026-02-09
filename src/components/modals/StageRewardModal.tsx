import React, { useContext, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import LazyMediaRenderer from '@/utils/lazy-media-renderer';
import { useAnimationLoader } from '@/utils/useAnimationLoader';
import { FireworksBackground } from '@/components/ui/backgrounds/fireworks-background';

const GEM_POP_DURATION = 0.45;
const GEM_FLY_DURATION = 1;
const GEM_TOTAL_DURATION = GEM_POP_DURATION + GEM_FLY_DURATION;
const GEM_LIFT_PX = 48;
const GEM_POP_SCALE = 1.35;
/** Scale of the gem when it arrives at the header button (larger = bigger on landing) */
const GEM_ARRIVAL_SCALE = 0.78;
/** Arc offset: control point for the flight curve is this many px to the left of the straight line */
const GEM_ARC_OFFSET_PX = 56;
/** Number of samples along the fly arc (more = smoother single curve) */
const GEM_ARC_SAMPLES = 14;

/** Quadratic bezier point at t in [0, 1]: (1-t)²A + 2(1-t)tP + t²B */
function bezier2(A: number, P: number, B: number, t: number): number {
  const u = 1 - t;
  return u * u * A + 2 * u * t * P + t * t * B;
}

type FlyingGemCoords = { fromX: number; fromY: number; toX: number; toY: number } | null;

const StageRewardModal: React.FC = observer(() => {
  const { chat, user } = useContext(Context) as IStoreContext;
  const { t } = useTranslate();
  const stageReward = chat.stageReward;
  const isOpen = stageReward?.isOpen || false;
  const language = user.user?.language || 'ru';
  const gemSourceRef = useRef<HTMLDivElement>(null);
  const [flyingGem, setFlyingGem] = useState<FlyingGemCoords>(null);
  const [fireworksPlaying, setFireworksPlaying] = useState(false);

  const caseItems = [stageReward?.rewardCase].filter(Boolean) as Array<
    NonNullable<NonNullable<typeof stageReward>['rewardCase']>
  >;
  const [animations] = useAnimationLoader(
    caseItems,
    (c) => c.mediaFile,
    [isOpen]
  );

  const handleClose = () => {
    chat.closeStageReward();
  };

  const handleContinueClick = () => {
    const sourceEl = gemSourceRef.current;
    const targetEl = document.querySelector('[data-gems-target]');
    if (!sourceEl || !targetEl) {
      handleClose();
      return;
    }
    if (stageReward?.rewardAmount != null) {
      chat.setPendingGemsOnLand(stageReward.rewardAmount);
    }
    const fromRect = sourceEl.getBoundingClientRect();
    const toRect = targetEl.getBoundingClientRect();
    const fromX = fromRect.left + fromRect.width / 2;
    const fromY = fromRect.top + fromRect.height / 2;
    const toX = toRect.left + toRect.width / 2;
    const toY = toRect.top + toRect.height / 2;
    setFlyingGem({ fromX, fromY, toX, toY });
    setFireworksPlaying(true);
    // Close modal immediately so drawer overlay (dark bg) is removed during fly
    handleClose();
  };

  const onFlyingGemComplete = () => {
    if (typeof document !== 'undefined') {
      document.dispatchEvent(new CustomEvent('gems-button-land'));
    }
    setFlyingGem(null);
  };

  const onFireworksComplete = useCallback(() => {
    setFireworksPlaying(false);
  }, []);

  // const missionNumberText = stageReward ? `${t('stageCompletedMissionPrefix')} ${stageReward.stageNumber}` : '';

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={false}
      swipeToClose={false}
      hideCloseButton
      title={t('stageCompleted')}
      description={t('stageRewardGemsHint')}
      headerIcon={<i className="fa-solid fa-trophy text-white text-2xl"></i>}
      headerIconContainerClassName="bg-user-message"
      footer={
        stageReward ? (
          <Button
            onClick={handleContinueClick}
            variant="gradient"
            size="lg"
            className="w-full"
            icon="fa-solid fa-check"
          >
            {t('continue')}
          </Button>
        ) : null
      }
    >
      {stageReward ? (
        <div className="px-4">
          {stageReward.rewardCase ? (
            <div className="flex flex-col items-center gap-3 mb-3">
              {(() => {
                const c = stageReward.rewardCase;
                const title = language === 'en' ? (c.nameEn || c.name) : c.name;
                return (
                  <div className="flex flex-col items-center">
                    {c.mediaFile ? (
                      <LazyMediaRenderer
                        mediaFile={c.mediaFile}
                        animations={animations}
                        name={title}
                        className="w-48 h-48 object-contain"
                        loop={false}
                        loadOnIntersect={false}
                        autoplay={true}
                      />
                    ) : (
                      <i className="fa-solid fa-box text-white text-4xl" />
                    )}
                    <div className="text-3xl text-gray-200 mt-2 text-center max-w-[120px] line-clamp-2">
                        +
                      </div>
                  </div>
                );
              })()}
            </div>
          ) : null}

          <div
            ref={gemSourceRef}
            className="flex items-center justify-center gap-2"
          >
            <span className="text-4xl font-bold text-white">
              +{stageReward.rewardAmount}
            </span>
            <i className="fa-solid fa-gem text-secondary-gradient text-4xl"></i>
          </div>
        </div>
      ) : null}
    </Modal>

    {typeof document !== 'undefined' && (flyingGem || fireworksPlaying) ? createPortal(
      <div className="fixed inset-0 z-[10002] pointer-events-none">
        <FireworksBackground
          className="absolute inset-0"
          particleCount={70}
          transparent
          burstCount={5}
          onBurstComplete={onFireworksComplete}
        />
        {flyingGem ? (
          <motion.div
            className="fixed left-0 top-0 w-12 h-12 -ml-6 -mt-6 flex items-center justify-center relative"
            initial={{
              x: flyingGem.fromX,
              y: flyingGem.fromY,
              scale: 1,
              opacity: 1,
            }}
            animate={(() => {
              const popT = GEM_POP_DURATION / GEM_TOTAL_DURATION;
              const ax = flyingGem.fromX;
              const ay = flyingGem.fromY - GEM_LIFT_PX;
              const bx = flyingGem.toX;
              const by = flyingGem.toY;
              const px = (ax + bx) / 2 - GEM_ARC_OFFSET_PX;
              const py = (ay + by) / 2;
              const xKeyframes: number[] = [flyingGem.fromX, ax];
              const yKeyframes: number[] = [flyingGem.fromY, ay];
              const times: number[] = [0, popT];
              for (let i = 1; i <= GEM_ARC_SAMPLES; i++) {
                const t = i / GEM_ARC_SAMPLES;
                xKeyframes.push(bezier2(ax, px, bx, t));
                yKeyframes.push(bezier2(ay, py, by, t));
                times.push(popT + (1 - popT) * t);
              }
              const n = xKeyframes.length;
              return {
                x: xKeyframes,
                y: yKeyframes,
                scale: [1, GEM_POP_SCALE, ...Array(n - 2).fill(GEM_ARRIVAL_SCALE)],
                opacity: [1, 1, ...Array(n - 2).fill(0.9)],
              };
            })()}
            transition={{
              duration: GEM_TOTAL_DURATION,
              times: (() => {
                const popT = GEM_POP_DURATION / GEM_TOTAL_DURATION;
                const t: number[] = [0, popT];
                for (let i = 1; i <= GEM_ARC_SAMPLES; i++) {
                  t.push(popT + (1 - popT) * (i / GEM_ARC_SAMPLES));
                }
                return t;
              })(),
              ease: [0.42, 0, 1, 1],
            }}
            onAnimationComplete={onFlyingGemComplete}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              aria-hidden
            >
              <motion.div
                className="absolute w-[72px] h-[72px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: 'linear-gradient(to right, #eab308, #f97316)',
                  filter: 'blur(14px)',
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={(() => {
                  const n = 2 + GEM_ARC_SAMPLES;
                  return {
                    opacity: [0, 0.85, ...Array(n - 2).fill(0.85)],
                    scale: [0.5, 1.2, ...Array(n - 2).fill(1.2)],
                  };
                })()}
                transition={{
                  duration: GEM_TOTAL_DURATION,
                  times: (() => {
                    const popT = GEM_POP_DURATION / GEM_TOTAL_DURATION;
                    const t: number[] = [0, popT];
                    for (let i = 1; i <= GEM_ARC_SAMPLES; i++) {
                      t.push(popT + (1 - popT) * (i / GEM_ARC_SAMPLES));
                    }
                    return t;
                  })(),
                  ease: [0.42, 0, 1, 1],
                }}
              />
            </motion.div>
            <i className="fa-solid fa-gem text-secondary-gradient text-4xl relative z-10" />
          </motion.div>
        ) : null}
      </div>,
      document.body
    ) : null}
  </>
  );
});

export default StageRewardModal;

