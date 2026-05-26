import React, { useRef, useLayoutEffect, useCallback, useEffect, useState, useContext } from 'react';
import { motion } from 'motion/react';
import { observer } from 'mobx-react-lite';
import MissionCard from '@/components/MainPageComponents/chat/MissionCard';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import type ChatStore from '@/store/ChatStore';
import type { Mission, MissionProgress, ProfileInventoryStory } from '@/types/types';
import { compareMissionsByStoryOrder } from '@/utils/missionStoryOrder';
import { ProgressiveBlur } from '../ui/progressive-blur';
import { Context, type IStoreContext } from '@/store/context';
import { loadMergedProfileStories } from '@/components/ProfilePageComponents/profileInventoryMocks';
import { isStoryLevelUnlocked } from '@/components/ProfilePageComponents/profileInventoryUtils';
import { getOpenStoryLevelReadiness } from '@/http/userAPI';

interface LevelGroup {
    level: number;
    missions: Mission[];
}

function buildLevelGroups(sorted: Mission[]): LevelGroup[] {
    const byLevel = new Map<number, Mission[]>();
    for (const m of sorted) {
        const lvl = m.level ?? 1;
        if (!byLevel.has(lvl)) byLevel.set(lvl, []);
        byLevel.get(lvl)!.push(m);
    }
    return [...byLevel.entries()].sort(([a], [b]) => a - b).map(([level, missions]) => ({ level, missions }));
}

function isMissionCompleted(p: MissionProgress | undefined): boolean {
    return p?.status === 'completed' || p?.status === 'replay_in_progress';
}

type MissionPathScreenProps = {
    chat: ChatStore;
    onChooseHistory: () => void;
    onMissionChosen: () => void;
    isFromHeader?: boolean;
    onClose?: () => void;
};

const MissionPathScreen: React.FC<MissionPathScreenProps> = observer(
    ({ chat, onChooseHistory, onMissionChosen, isFromHeader = false, onClose }) => {
        const { user } = useContext(Context) as IStoreContext;
        const historyName = user.user?.selectedHistoryName ?? null;
        const [inventoryStory, setInventoryStory] = useState<
            ProfileInventoryStory | null | undefined
        >(undefined);
        const [openLevelLoading, setOpenLevelLoading] = useState<number | null>(null);
        const [isMissionListVisible, setIsMissionListVisible] = useState(false);

        useEffect(() => {
            if (!historyName) {
                setInventoryStory(null);
                return;
            }
            let cancelled = false;
            setInventoryStory(undefined);
            void loadMergedProfileStories().then((list) => {
                if (cancelled) return;
                const story = list.find((s) => s.historyName === historyName) ?? null;
                setInventoryStory(story);
                if (story?.unlockedLevels?.length) {
                    chat.setUnlockedLevels(story.unlockedLevels);
                }
            });
            return () => {
                cancelled = true;
            };
        }, [historyName, chat]);

        const { hapticImpact } = useHapticFeedback();
        const scrollContainerRef = useRef<HTMLDivElement>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
        const missionCardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
        const lastScrolledToMissionIdRef = useRef<number | null>(null);

        useEffect(() => {
            lastScrolledToMissionIdRef.current = null;
            setIsMissionListVisible(false);
        }, []);

        useEffect(() => {
            if (chat.missionPathScrollToLevel == null) return;
            lastScrolledToMissionIdRef.current = null;
            setIsMissionListVisible(false);
        }, [chat.missionPathScrollToLevel]);

        const { t } = useTranslate();
        const sorted = [...chat.missions].sort(compareMissionsByStoryOrder);
        const levelGroups = buildLevelGroups(sorted);
        if (
            chat.pendingOpenStoryLevel != null &&
            !levelGroups.some((g) => g.level === chat.pendingOpenStoryLevel)
        ) {
            levelGroups.push({ level: chat.pendingOpenStoryLevel, missions: [] });
            levelGroups.sort((a, b) => a.level - b.level);
        }

        const unlockedLevels =
            chat.unlockedLevels.length > 0
                ? chat.unlockedLevels
                : (inventoryStory?.unlockedLevels ?? [1]);

        const levelAccessible = new Map<number, boolean>();
        for (const group of levelGroups) {
            levelAccessible.set(group.level, isStoryLevelUnlocked(unlockedLevels, group.level));
        }

        const visibleMissions = levelGroups
            .filter((g) => levelAccessible.get(g.level))
            .flatMap((g) => g.missions);

        const scrollTargetMissionId = (() => {
            const scrollLevel = chat.missionPathScrollToLevel;
            if (scrollLevel != null) {
                const firstOfLevel = sorted.find((m) => (m.level ?? 1) === scrollLevel);
                if (firstOfLevel) return firstOfLevel.id;
                return null;
            }
            if (chat.selectedMissionId != null) {
                const selected = sorted.find((m) => m.id === chat.selectedMissionId);
                if (selected && isStoryLevelUnlocked(unlockedLevels, selected.level ?? 1)) {
                    return chat.selectedMissionId;
                }
            }
            for (const m of visibleMissions) {
                if (chat.canSelectMission(m.id)) return m.id;
            }
            return visibleMissions[0]?.id ?? null;
        })();

        const isMissionDataReady =
            sorted.length > 0 && !chat.loading && inventoryStory !== undefined;

        const scrollToMissionCard = useCallback((missionId: number) => {
            const el = missionCardRefs.current.get(missionId);
            const container = scrollContainerRef.current;
            if (!el || !container) return false;

            const containerRect = container.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const top =
                elRect.top -
                containerRect.top +
                container.scrollTop -
                (containerRect.height - elRect.height) / 2;
            container.scrollTop = Math.max(0, top);
            return true;
        }, []);

        const redrawPath = useCallback(() => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container || visibleMissions.length < 2) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.max(1, rect.width * dpr);
            canvas.height = Math.max(1, rect.height * dpr);
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);

            ctx.clearRect(0, 0, rect.width, rect.height);

            const points: { x: number; y: number }[] = [];
            cardRefs.current.forEach((el) => {
                if (!el) return;
                const r = el.getBoundingClientRect();
                const cr = container.getBoundingClientRect();
                points.push({
                    x: r.left + r.width / 2 - cr.left,
                    y: r.top + r.height / 2 - cr.top,
                });
            });

            if (points.length < 2) return;

            const buildWindingPath = () => {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    const A = points[i - 1];
                    const B = points[i];
                    const dx = B.x - A.x;
                    const dy = B.y - A.y;
                    const len = Math.hypot(dx, dy) || 1;
                    const nx = -dy / len;
                    const ny = dx / len;
                    const amp = (i % 2 === 1 ? 1 : -1) * Math.min(110, rect.width * 0.32);
                    const Mx = (A.x + B.x) / 2;
                    const My = (A.y + B.y) / 2;
                    const Q1x = A.x + dx * 0.28 + nx * amp;
                    const Q1y = A.y + dy * 0.28 + ny * amp;
                    const Q2x = A.x + dx * 0.72 + nx * (-amp * 0.88);
                    const Q2y = A.y + dy * 0.72 + ny * (-amp * 0.88);
                    ctx.quadraticCurveTo(Q1x, Q1y, Mx, My);
                    ctx.quadraticCurveTo(Q2x, Q2y, B.x, B.y);
                }
            };

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.save();
            ctx.strokeStyle = 'rgba(40, 28, 18, 0.5)';
            ctx.lineWidth = 18;
            buildWindingPath();
            ctx.stroke();
            ctx.restore();

            ctx.strokeStyle = 'rgba(95, 72, 48, 0.72)';
            ctx.lineWidth = 12;
            buildWindingPath();
            ctx.stroke();

            ctx.strokeStyle = 'rgba(220, 185, 130, 0.78)';
            ctx.lineWidth = 5;
            ctx.setLineDash([14, 16]);
            buildWindingPath();
            ctx.stroke();
            ctx.setLineDash([]);
        }, [visibleMissions.length]);

        const redrawPathRef = useRef(redrawPath);
        useLayoutEffect(() => {
            redrawPathRef.current = redrawPath;
        }, [redrawPath]);

        useLayoutEffect(() => {
            redrawPathRef.current();
        }, [redrawPath, chat.missions.length, chat.missionsProgress.length, unlockedLevels.join(',')]);

        useLayoutEffect(() => {
            if (
                !isMissionDataReady ||
                scrollTargetMissionId == null ||
                lastScrolledToMissionIdRef.current === scrollTargetMissionId
            ) {
                return;
            }

            if (scrollToMissionCard(scrollTargetMissionId)) {
                lastScrolledToMissionIdRef.current = scrollTargetMissionId;
                if (chat.missionPathScrollToLevel != null) {
                    chat.setMissionPathScrollToLevel(null);
                }
                redrawPathRef.current();
                setIsMissionListVisible(true);
            }
        }, [
            isMissionDataReady,
            scrollTargetMissionId,
            unlockedLevels.join(','),
            chat.missionPathScrollToLevel,
            scrollToMissionCard,
        ]);

        useLayoutEffect(() => {
            const handler = () => redrawPathRef.current();
            const ro = new ResizeObserver(handler);
            const el = containerRef.current;
            if (el) ro.observe(el);
            window.addEventListener('resize', handler);
            return () => {
                ro.disconnect();
                window.removeEventListener('resize', handler);
            };
        }, []);

        const handleClose = () => {
            hapticImpact('soft');
            onClose?.();
        };

        const handleChooseHistory = () => {
            hapticImpact('soft');
            onChooseHistory();
        };

        const handleMissionClick = async (missionId: number) => {
            if (!chat.canSelectMission(missionId)) return;
            hapticImpact('soft');
            await chat.selectMissionForChat(missionId);
            onMissionChosen();
        };

        const handleOpenNextLevel = async (openLevel: number) => {
            if (!historyName || openLevelLoading != null) return;
            hapticImpact('soft');
            setOpenLevelLoading(openLevel);
            try {
                const readiness = await getOpenStoryLevelReadiness(historyName, openLevel);
                chat.openOpenStoryLevelPrompt({
                    completedLevel: readiness.completedLevel,
                    openLevel: readiness.openLevel,
                    canOpen: readiness.canOpen,
                    scrollMissionPathOnSuccess: true,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setOpenLevelLoading(null);
            }
        };

        const isMobile = document.body.classList.contains('telegram-mobile');
        const blurHeight = isMobile ? 124 : 56;

        return (
            <div className="flex flex-col h-full min-h-0 gap-2">
                <ProgressiveBlur
                    className="pointer-events-none fixed left-0 right-0 top-0 z-15"
                    containerStyle={{ height: `${blurHeight}px` }}
                    blurIntensity={2}
                    direction="top"
                />

                <div className="absolute top-0 left-0 right-0 z-1000 flex items-center justify-center shrink-0 min-h-[44px] px-4 pt-4">
                    <button
                        type="button"
                        onClick={handleChooseHistory}
                        className="absolute left-4 top-3 z-10 w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <i className="fas fa-arrow-left text-xl shrink-0" aria-hidden />
                    </button>
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xl font-bold text-white text-center px-12 sm:px-14"
                    >
                        {t('missionsList')}
                    </motion.h2>
                    {isFromHeader && onClose ? (
                        <button
                            type="button"
                            onClick={handleClose}
                            className="absolute right-4 top-3 z-10 w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            aria-label={t('close')}
                        >
                            <i className="fas fa-times text-white text-xl" />
                        </button>
                    ) : null}
                </div>

                <div
                    ref={scrollContainerRef}
                    className={`flex-1 min-h-0 overflow-y-auto ios-scroll hide-scrollbar p-4 pt-16${
                        isMissionDataReady && !isMissionListVisible ? ' invisible' : ''
                    }`}
                >
                    {sorted.length === 0 || !isMissionDataReady ? (
                        <p className="text-center text-zinc-400 text-sm py-8">{t('missionsLoadingOrEmpty')}</p>
                    ) : (
                        <div ref={containerRef} className="relative flex flex-col items-center pt-12 pb-6 min-h-[200px]">
                            <canvas
                                ref={canvasRef}
                                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                                aria-hidden
                            />
                            {(() => {
                                let missionIdx = 0;
                                return levelGroups.map((group, groupIdx) => {
                                    const accessible = levelAccessible.get(group.level) ?? false;
                                    const prevGroup = groupIdx > 0 ? levelGroups[groupIdx - 1] : null;
                                    const prevLevelMissionsDone =
                                        prevGroup != null &&
                                        prevGroup.missions.every((m) =>
                                            isMissionCompleted(
                                                chat.missionsProgress.find((x) => x.missionId === m.id) ||
                                                    m.progress ||
                                                    undefined,
                                            ),
                                        );
                                    const showOpenLevelHere =
                                        !accessible &&
                                        prevLevelMissionsDone &&
                                        group.level >= 2;

                                    return (
                                        <React.Fragment key={group.level}>
                                            <div className="relative z-10 w-full flex items-center gap-3 px-4 mb-6">
                                                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-zinc-700/60" />
                                                <div
                                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border transition-colors ${
                                                        accessible
                                                            ? 'bg-user-message'
                                                            : 'border-zinc-700/60 text-zinc-500 bg-zinc-800/60'
                                                    }`}
                                                >
                                                    {!accessible && (
                                                        <i className="fa-solid fa-lock text-[9px]" />
                                                    )}
                                                    {t('missionLevel')} {group.level}
                                                </div>
                                                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-zinc-700/60" />
                                            </div>

                                            {accessible ? (
                                                <>
                                                    {group.missions.map((m) => {
                                                        const idx = missionIdx++;
                                                        const p: MissionProgress | undefined =
                                                            chat.missionsProgress.find(
                                                                (x) => x.missionId === m.id,
                                                            ) || m.progress || undefined;
                                                        const locked = !chat.canSelectMission(m.id);
                                                        const isSelected = chat.selectedMissionId === m.id;
                                                        const isLoadingMission =
                                                            chat.switchingMissionId === m.id;
                                                        return (
                                                            <div
                                                                key={m.id}
                                                                ref={(el) => {
                                                                    cardRefs.current[idx] = el;
                                                                    if (el) {
                                                                        missionCardRefs.current.set(m.id, el);
                                                                    } else {
                                                                        missionCardRefs.current.delete(m.id);
                                                                    }
                                                                }}
                                                                className="relative z-10 w-full flex justify-center mb-10 last:mb-4"
                                                            >
                                                                <MissionCard
                                                                    mode="picker"
                                                                    mission={m}
                                                                    progress={p}
                                                                    locked={locked}
                                                                    isSelected={isSelected}
                                                                    isLoading={isLoadingMission}
                                                                    disableEntranceAnimation
                                                                    onSelect={() =>
                                                                        void handleMissionClick(m.id)
                                                                    }
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            ) : showOpenLevelHere ? (
                                                <div className="relative z-10 w-full flex justify-center mb-10 px-4">
                                                    <Button
                                                        variant="gradient"
                                                        size="lg"
                                                        className="w-full max-w-md"
                                                        icon="fa-solid fa-door-open"
                                                        disabled={openLevelLoading === group.level}
                                                        state={
                                                            openLevelLoading === group.level
                                                                ? 'loading'
                                                                : 'default'
                                                        }
                                                        onClick={() => void handleOpenNextLevel(group.level)}
                                                    >
                                                        {t('openStoryLevelConfirmButton').replace(
                                                            '{level}',
                                                            String(group.level),
                                                        )}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="relative z-10 w-full flex justify-center mb-10"
                                                >
                                                    <div className="max-w-md w-full mx-4 rounded-xl border border-zinc-700/50 bg-zinc-900/60 px-4 py-3 flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                                            <i className="fa-solid fa-lock text-zinc-500" />
                                                        </div>
                                                        <p className="text-xs text-zinc-500 leading-snug">
                                                            {t('missionLevelLocked')}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </React.Fragment>
                                    );
                                });
                            })()}
                        </div>
                    )}
                </div>
                <ProgressiveBlur
                    className="pointer-events-none fixed left-0 right-0 bottom-0 z-15"
                    containerStyle={{ height: `44px` }}
                    blurIntensity={2}
                    direction="bottom"
                />
            </div>
        );
    },
);

export default MissionPathScreen;
