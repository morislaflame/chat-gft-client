import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { AnimatePresence, motion } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { listMissionUiStepGoals } from '@/utils/missionUiStepGoals';
import { useTranslate } from '@/utils/useTranslate';
import { PressableRippleSurface } from '@/components/ui/pressable-ripple-surface';
import { cn } from '@/lib/utils';

export type MissionStepGoalBarProps = {
    /** Открыть модалку с объяснением про артефакты (клик по плашке «Цель») */
    onGoalBarClick?: () => void;
};

/**
 * Нижняя плашка: одна цель текущего ключевого шага (main_step) с чекбоксом.
 * При увеличении main_step после ответа — короткая анимация «галочка» на завершённом шаге, затем текст следующего.
 */
const MissionStepGoalBar: React.FC<MissionStepGoalBarProps> = observer(({ onGoalBarClick }) => {
    const { chat } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();
    const mid = chat.selectedMissionId;
    const mission = mid != null ? chat.missions.find((m) => m.id === mid) : null;
    const progress = mid != null ? chat.missionProgressFor(mid) : null;
    const mainStep = progress?.mainStep ?? null;

    const steps = useMemo(() => listMissionUiStepGoals(mission?.uiStepGoals ?? null), [mission?.uiStepGoals]);

    const [celebrate, setCelebrate] = useState<{ text: string } | null>(null);
    const lastMidRef = useRef<number | null>(null);
    const prevMainStepRef = useRef<number | null>(null);

    useEffect(() => {
        if (mid == null || !steps.length) {
            lastMidRef.current = null;
            prevMainStepRef.current = null;
            setCelebrate(null);
            return;
        }

        if (lastMidRef.current !== mid) {
            lastMidRef.current = mid;
            prevMainStepRef.current = mainStep;
            setCelebrate(null);
            return;
        }

        const prev = prevMainStepRef.current;
        if (prev !== null && mainStep !== null && mainStep > prev) {
            const text = steps.find((s) => s.index === prev)?.text ?? '';
            if (text) {
                setCelebrate({ text });
                const timer = window.setTimeout(() => setCelebrate(null), 900);
                prevMainStepRef.current = mainStep;
                return () => window.clearTimeout(timer);
            }
        }

        prevMainStepRef.current = mainStep;
        return undefined;
    }, [mid, mainStep, steps]);

    const resolveCurrentIndex = (): number | null => {
        if (!steps.length) return null;
        if (mainStep != null && mainStep >= 1) {
            const hit = steps.some((s) => s.index === mainStep);
            if (hit) return mainStep;
        }
        return steps[0]?.index ?? null;
    };

    const currentIdx = resolveCurrentIndex();
    const currentText =
        currentIdx != null ? steps.find((s) => s.index === currentIdx)?.text ?? null : null;

    if (!mid || !mission || !steps.length) {
        return null;
    }

    const barShellClass =
        'rounded-xl border border-white/15 bg-black/40 backdrop-blur-md px-3 py-2.5 shadow-lg';

    const wrapBar = (children: React.ReactNode) =>
        onGoalBarClick ? (
            <PressableRippleSurface
                type="button"
                onClick={() => onGoalBarClick()}
                aria-label={t('missionGoalBarOpenExplainerAria')}
                rippleClassName="bg-white/35"
                className={cn(barShellClass, 'w-full text-left hover:bg-black/50')}
            >
                {children}
            </PressableRippleSurface>
        ) : (
            <div className={barShellClass}>{children}</div>
        );

    if (celebrate) {
        return wrapBar(
            <>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-zinc-400">Цель</p>
                <AnimatePresence mode="wait">
                    <motion.div
                        key="celebrate"
                        initial={{ opacity: 0.7, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.28 }}
                        className="flex items-center gap-2.5"
                    >
                        <motion.div
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                            initial={{
                                scale: 0.92,
                                backgroundColor: 'rgba(255,255,255,0.07)',
                                borderColor: 'rgba(255,255,255,0.4)',
                            }}
                            animate={{
                                scale: 1,
                                backgroundColor: 'rgba(16,185,129,1)',
                                borderColor: 'rgba(52,211,153,0.95)',
                            }}
                            transition={{ duration: 0.26, ease: 'easeOut' }}
                        >
                            <motion.i
                                className="fas fa-check text-[10px] leading-none text-white"
                                initial={{ scale: 0.3, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.14, duration: 0.2 }}
                            />
                        </motion.div>
                        <p className="min-w-0 flex-1 py-0.5 text-sm leading-snug text-zinc-100">{celebrate.text}</p>
                    </motion.div>
                </AnimatePresence>
            </>,
        );
    }

    if (!currentText) {
        return null;
    }

    return wrapBar(
        <>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Цель</p>
            <AnimatePresence mode="wait">
                <motion.div
                    key={String(currentIdx)}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.32, ease: 'easeOut' }}
                    className="flex items-center gap-2.5"
                >
                    <motion.div
                        layout
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/[0.07]"
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    />
                    <p className="min-w-0 flex-1 py-0.5 text-sm leading-snug text-zinc-100">{currentText}</p>
                </motion.div>
            </AnimatePresence>
        </>,
    );
});

export default MissionStepGoalBar;
