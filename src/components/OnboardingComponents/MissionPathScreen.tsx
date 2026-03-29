import React, { useRef, useLayoutEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { observer } from 'mobx-react-lite';
import MissionCard from '@/components/MainPageComponents/chat/MissionCard';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import type ChatStore from '@/store/ChatStore';
import type { MissionProgress } from '@/types/types';

type MissionPathScreenProps = {
    chat: ChatStore;
    onChooseHistory: () => void;
    onMissionChosen: () => void;
    isFromHeader?: boolean;
    onClose?: () => void;
};

const MissionPathScreen: React.FC<MissionPathScreenProps> = observer(
    ({ chat, onChooseHistory, onMissionChosen, isFromHeader = false, onClose }) => {
        const { t } = useTranslate();
        const { hapticImpact } = useHapticFeedback();
        const containerRef = useRef<HTMLDivElement>(null);
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

        const sorted = [...chat.missions].sort((a, b) => a.orderIndex - b.orderIndex);

        const redrawPath = useCallback(() => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container || sorted.length < 2) return;

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

            /** Плавная S-образная «тропа» между центрами карточек: два quadraticCurveTo на сегмент */
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

            // Мягкая «подложка» под тропой (объём)
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
        }, [sorted.length]);

        useLayoutEffect(() => {
            redrawPath();
            const ro = new ResizeObserver(() => redrawPath());
            if (containerRef.current) ro.observe(containerRef.current);
            window.addEventListener('resize', redrawPath);
            return () => {
                ro.disconnect();
                window.removeEventListener('resize', redrawPath);
            };
        }, [redrawPath, chat.missions, chat.missionsProgress]);

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

        return (
            <div className="flex flex-col h-full min-h-0 p-4 pb-8 gap-2">
                <div className="relative flex items-center justify-center shrink-0 min-h-[44px] px-1">
                    <button
                        type="button"
                        onClick={handleChooseHistory}
                        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 flex items-center gap-1.5 max-w-[min(56%,240px)] text-left text-sm font-medium text-zinc-200 hover:text-white pl-1 pr-2 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <i className="fas fa-arrow-left text-xs opacity-90 shrink-0" aria-hidden />
                        <span className="leading-tight truncate">{t('selectHistory')}</span>
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
                            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            aria-label={t('close')}
                        >
                            <i className="fas fa-times text-white text-xl" />
                        </button>
                    ) : null}
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto ios-scroll hide-scrollbar">
                    {sorted.length === 0 ? (
                        <p className="text-center text-zinc-400 text-sm py-8">{t('missionsLoadingOrEmpty')}</p>
                    ) : (
                        <div ref={containerRef} className="relative flex flex-col items-center pt-2 pb-6 min-h-[200px]">
                            <canvas
                                ref={canvasRef}
                                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                                aria-hidden
                            />
                            {sorted.map((m, idx) => {
                                const p: MissionProgress | undefined =
                                    chat.missionsProgress.find((x) => x.missionId === m.id) ||
                                    m.progress ||
                                    undefined;
                                const locked = !chat.canSelectMission(m.id);
                                const completed = p?.status === 'completed';
                                const isSelected = chat.selectedMissionId === m.id;
                                const isLoadingMission = chat.switchingMissionId === m.id;

                                return (
                                    <div
                                        key={m.id}
                                        ref={(el) => {
                                            cardRefs.current[idx] = el;
                                        }}
                                        className="relative z-10 w-full flex justify-center mb-10 last:mb-4"
                                    >
                                        <MissionCard
                                            mode="picker"
                                            mission={m}
                                            locked={locked}
                                            completed={completed}
                                            isSelected={isSelected}
                                            isLoading={isLoadingMission}
                                            onSelect={() => void handleMissionClick(m.id)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

export default MissionPathScreen;
