import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { listMissionUiStepGoals } from '@/utils/missionUiStepGoals';

const SEGMENT_FILL_MS = 620;
const CIRCLE_FILL_MS = 420;
const NEXT_STEP_REVEAL_MS = 420;
const SEGMENT_HEIGHT_NORMAL = 10;
const SEGMENT_HEIGHT_ANIMATING = 20;

/** Незаполненный отрезок перед кружком; хвост после последнего кружка — в 5 раз короче */
const UNFILLED_BEFORE_CIRCLE_GROW = 1;
const UNFILLED_AFTER_LAST_CIRCLE_GROW = UNFILLED_BEFORE_CIRCLE_GROW / 5;

const MissionDynamicProgressBase: React.FC = () => {
    const { chat } = useContext(Context) as IStoreContext;
    const mid = chat.selectedMissionId;
    const mission = mid != null ? chat.missions.find((m) => m.id === mid) : null;
    const progress = mid != null ? chat.missionProgressFor(mid) : null;

    const stepGoals = useMemo(
        () => listMissionUiStepGoals(mission?.uiStepGoals ?? null),
        [mission?.uiStepGoals],
    );

    const totalSteps = Math.max(
        1,
        Number(progress?.mainStepsTotal ?? 0) || stepGoals.length || 1,
    );
    const currentStepRaw = Number(progress?.mainStep ?? 1) || 1;
    const currentStep = Math.min(Math.max(1, currentStepRaw), totalSteps);

    const [visibleCount, setVisibleCount] = useState(currentStep);
    const [completedCount, setCompletedCount] = useState(Math.max(0, currentStep - 1));
    const [segmentToFill, setSegmentToFill] = useState<number | null>(null);
    const [circleToFill, setCircleToFill] = useState<number | null>(null);
    const [revealedStepIndex, setRevealedStepIndex] = useState<number | null>(null);
    const timersRef = useRef<number[]>([]);

    const clearTimers = () => {
        for (const timer of timersRef.current) {
            window.clearTimeout(timer);
        }
        timersRef.current = [];
    };

    useEffect(() => {
        return () => clearTimers();
    }, []);

    useEffect(() => {
        if (!mid || !mission) return;

        const targetCompleted = Math.max(0, currentStep - 1);

        if (currentStep < visibleCount) {
            clearTimers();
            setSegmentToFill(null);
            setCircleToFill(null);
            setRevealedStepIndex(null);
            setVisibleCount(currentStep);
            setCompletedCount(targetCompleted);
            return;
        }

        if (currentStep === visibleCount) {
            if (completedCount !== targetCompleted) {
                setCompletedCount(targetCompleted);
            }
            return;
        }

        if (segmentToFill !== null || circleToFill !== null || revealedStepIndex !== null) {
            return;
        }

        const transitionFromStep = visibleCount;
        const fillingIndex = transitionFromStep - 1;

        setSegmentToFill(fillingIndex);

        const t1 = window.setTimeout(() => {
            setSegmentToFill(null);
            setCircleToFill(fillingIndex);
        }, SEGMENT_FILL_MS);

        const t2 = window.setTimeout(() => {
            setCircleToFill(null);
            setCompletedCount((prev) => Math.max(prev, fillingIndex + 1));
            setVisibleCount((prev) => Math.min(prev + 1, currentStep));
            setRevealedStepIndex(fillingIndex + 1);
        }, SEGMENT_FILL_MS + CIRCLE_FILL_MS);

        const t3 = window.setTimeout(() => {
            setRevealedStepIndex(null);
        }, SEGMENT_FILL_MS + CIRCLE_FILL_MS + NEXT_STEP_REVEAL_MS);

        timersRef.current.push(t1, t2, t3);
    }, [
        currentStep,
        visibleCount,
        completedCount,
        segmentToFill,
        circleToFill,
        revealedStepIndex,
        mid,
        mission,
    ]);

    if (!mid || !mission) {
        return null;
    }

    const showTailAfterLastCircle = visibleCount < totalSteps;

    return (
        <div className="w-full">
            <div className="w-full flex items-center gap-1 min-w-0">
                {Array.from({ length: visibleCount }).map((_, idx) => {
                    const isCompleted = idx < completedCount || idx === circleToFill;
                    const isSegmentFilling = idx === segmentToFill;
                    const isRevealed = idx === revealedStepIndex;
                    const segmentGrow =
                        isSegmentFilling || idx < completedCount
                            ? 1
                            : UNFILLED_BEFORE_CIRCLE_GROW;

                    const segmentFillPercent =
                        idx < completedCount || idx === circleToFill || isSegmentFilling
                            ? 100
                            : 0;

                    return (
                        <React.Fragment key={`mission-step-${idx}`}>
                            <motion.div
                                layout
                                className="relative min-w-0 overflow-hidden flex items-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md"
                                style={{ flexBasis: 0 }}
                                animate={{
                                    flexGrow: segmentGrow,
                                    opacity: 1,
                                    height: isSegmentFilling ? SEGMENT_HEIGHT_ANIMATING : SEGMENT_HEIGHT_NORMAL,
                                }}
                                transition={{
                                    flexGrow: { duration: 0.56, ease: 'easeInOut' },
                                    opacity: { duration: 0.24, ease: 'easeOut' },
                                    height: { duration: 0.25, ease: 'easeOut' },
                                    layout: { type: 'spring', stiffness: 260, damping: 30 },
                                }}
                            >
                                <div
                                    className="absolute inset-0 rounded-full"
                                    aria-hidden
                                />
                                <motion.div
                                    className="absolute inset-y-0 left-0 rounded-full z-[1]"
                                    style={{
                                        background: 'var(--gradient-accent-color)',
                                        boxShadow: isSegmentFilling
                                            ? '0 0 12px rgba(178, 73, 248, 0.45)'
                                            : 'none',
                                    }}
                                    initial={false}
                                    animate={{ width: `${segmentFillPercent}%` }}
                                    transition={{
                                        duration: isSegmentFilling
                                            ? SEGMENT_FILL_MS / 1000
                                            : 0.32,
                                        ease: 'easeOut',
                                    }}
                                />
                            </motion.div>

                            <motion.div
                                layout
                                initial={isRevealed ? { opacity: 0, x: 18, scale: 0.96 } : false}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center ${
                                    isCompleted
                                        ? 'btn-default-silver-border'
                                        : 'border border-white/15 bg-black/40 backdrop-blur-md'
                                }`}
                                style={{
                                    background: isCompleted
                                        ? 'var(--gradient-accent-color)'
                                        : undefined,
                                    color: isCompleted ? '#fff' : 'rgb(156 163 175)',
                                }}
                                transition={{
                                    x: { duration: 0.42, ease: 'easeOut' },
                                    opacity: { duration: 0.28, ease: 'easeOut' },
                                    scale: { duration: 0.28, ease: 'easeOut' },
                                    layout: { type: 'spring', stiffness: 300, damping: 28 },
                                }}
                            >
                                {isCompleted ? <i className="fa-solid fa-check text-[10px]" /> : null}
                            </motion.div>
                        </React.Fragment>
                    );
                })}

                {showTailAfterLastCircle ? (
                    <motion.div
                        layout
                        className="h-2.5 rounded-full min-w-0 border border-white/15 bg-black/40 backdrop-blur-md"
                        style={{ flexBasis: 0 }}
                        animate={{ flexGrow: UNFILLED_AFTER_LAST_CIRCLE_GROW }}
                        transition={{
                            flexGrow: { duration: 0.35, ease: 'easeOut' },
                            layout: { type: 'spring', stiffness: 300, damping: 32 },
                        }}
                    />
                ) : null}
            </div>
        </div>
    );
};

const MissionDynamicProgress = observer(MissionDynamicProgressBase);
export default MissionDynamicProgress;
