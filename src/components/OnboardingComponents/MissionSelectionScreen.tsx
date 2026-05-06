import React, { useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/context';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import Button from '@/components/ui/button';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import MissionPickerCard from './MissionPickerCard';
import MissionPathCanvas from './MissionPathCanvas';
import type { MediaFile, Mission, MissionProgress } from '@/types/types';
import { compareMissionsByStoryOrder } from '@/utils/missionStoryOrder';
import { trackEvent } from '@/utils/analytics';

type MissionSelectionScreenProps = {
    onChooseStory: () => void;
    onClose?: () => void;
    onShowMissionVideo: (payload: { video: MediaFile; beginReplay: boolean }) => void;
    /** После стартового сообщения (без ролика) или когда родитель закончил цепочку */
    onMissionFlowFinished: () => void;
};

const MissionSelectionScreen: React.FC<MissionSelectionScreenProps> = observer(
    ({ onChooseStory, onClose, onShowMissionVideo, onMissionFlowFinished }) => {
        const { chat, user } = useContext(Context) as IStoreContext;
        const { t, language } = useTranslate();
        const { hapticImpact } = useHapticFeedback();
        const scrollRef = useRef<HTMLDivElement>(null);
        const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
        const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([]);
        const [pathSize, setPathSize] = useState({ w: 0, h: 0 });

        React.useEffect(() => {
            void chat.loadChatHistory(true);
        }, [chat, user.user?.selectedHistoryName]);

        const missions = useMemo(
            () => [...chat.missions].sort(compareMissionsByStoryOrder),
            [chat.missions],
        );

        const measurePath = useCallback(() => {
            const root = scrollRef.current;
            if (!root) return;
            const rect = root.getBoundingClientRect();
            const pts: { x: number; y: number }[] = [];
            const listLen = missions.length;
            for (let i = 0; i < listLen; i++) {
                const el = cardRefs.current[i];
                if (!el) continue;
                const r = el.getBoundingClientRect();
                pts.push({
                    x: r.left - rect.left + r.width / 2,
                    y: r.top - rect.top + r.height / 2,
                });
            }
            setPathPoints(pts);
            setPathSize({ w: rect.width, h: rect.height });
        }, [missions]);

        useLayoutEffect(() => {
            cardRefs.current.length = missions.length;
            measurePath();
        }, [missions, measurePath, chat.loading]);

        useLayoutEffect(() => {
            const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measurePath()) : null;
            const el = scrollRef.current;
            if (el && ro) ro.observe(el);
            window.addEventListener('resize', measurePath);
            return () => {
                ro?.disconnect();
                window.removeEventListener('resize', measurePath);
            };
        }, [measurePath]);

        const progressFor = (missionId: number): MissionProgress | undefined => {
            const p = chat.missionsProgress.find((x) => x.missionId === missionId);
            return p ?? chat.missions.find((m) => m.id === missionId)?.progress ?? undefined;
        };

        const runMissionAction = async (m: Mission) => {
            if (!chat.canSelectMission(m.id)) return;
            if (user.energy <= 0) {
                chat.setInsufficientEnergy(true);
                return;
            }

            const p = progressFor(m.id);
            const beginReplay = p?.status === 'completed';
            const storyId = user.user?.selectedHistoryName || 'unknown';

            hapticImpact('soft');
            trackEvent('mission_start_click', {
                order_index: m.orderIndex,
                mission_id: m.id,
                story_id: storyId,
                source: 'mission_picker',
            });
            trackEvent('mission_start', { story_id: storyId, mission_id: m.id });

            chat.primeMissionThread(m.id);
            chat.setMissionStart(m.id);
            chat.markMissionHasMessagesByMissionId(m.id);

            const missionVideo = chat.getMissionVideoByMissionId(m.id);
            if (missionVideo) {
                onShowMissionVideo({ video: missionVideo, beginReplay });
            } else {
                await chat.sendMessage(
                    language === 'en' ? 'start' : 'старт',
                    undefined,
                    null,
                    null,
                    { beginReplay },
                );
                onMissionFlowFinished();
            }
        };

        return (
            <div className="flex flex-col h-full min-h-0 p-4 pb-8 gap-3">
                <div className="flex items-center justify-center relative shrink-0">
                    {onClose && (
                        <button
                            type="button"
                            onClick={() => {
                                hapticImpact('soft');
                                onClose();
                            }}
                            className="absolute left-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            aria-label={t('close')}
                        >
                            <i className="fas fa-times text-white text-lg" />
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-white text-center px-10">{t('missionsPickTitle')}</h2>
                </div>

                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full shrink-0"
                    icon="fas fa-book-open"
                    onClick={() => {
                        hapticImpact('soft');
                        onChooseStory();
                    }}
                >
                    {t('chooseStoryButton')}
                </Button>

                <div
                    ref={scrollRef}
                    className="relative flex-1 min-h-0 overflow-y-auto ios-scroll rounded-xl border border-white/10 bg-black/20"
                >
                    {pathSize.w > 0 && pathSize.h > 0 && pathPoints.length > 1 && (
                        <MissionPathCanvas points={pathPoints} width={pathSize.w} height={pathSize.h} />
                    )}

                    <div className="relative z-[1] flex flex-col gap-10 p-4">
                        {chat.loading && missions.length === 0 ? (
                            <div className="flex justify-center py-12">
                                <LoadingIndicator />
                            </div>
                        ) : missions.length === 0 ? (
                            <p className="text-center text-zinc-400 text-sm py-8">{t('noMissionsForStory')}</p>
                        ) : (
                            missions.map((m, idx) => {
                                const locked = !chat.canSelectMission(m.id);
                                const p = progressFor(m.id);
                                return (
                                    <div
                                        key={m.id}
                                        ref={(el) => {
                                            cardRefs.current[idx] = el;
                                        }}
                                    >
                                        <MissionPickerCard
                                            mission={m}
                                            locked={locked}
                                            progressStatus={p?.status}
                                            onAction={() => void runMissionAction(m)}
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

export default MissionSelectionScreen;
