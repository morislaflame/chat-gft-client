import React, { useContext, useEffect, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { Task } from '@/types/types';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';
import TaskCompletionModal from '../modals/TaskCompletionModal';
import DailyRewardProgress from './DailyRewardProgress';
import DailyRewardDayModal from '../modals/DailyRewardDayModal';
import type { DailyReward } from '@/http/dailyRewardAPI';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import QuestsEmptyState from './QuestsEmptyState';
import QuestsList from './QuestsList';

const QuestsContainer: React.FC = observer(() => {
    const { quest, user, dailyReward } = useContext(Context) as IStoreContext;
    const { t, language } = useTranslate();
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedReward, setSelectedReward] = useState<DailyReward | null>(null);
    const [dayModalOpen, setDayModalOpen] = useState(false);
    const { hapticImpact } = useHapticFeedback();

    useEffect(() => {
        quest.loadQuests();
        dailyReward.fetchAllRewards();
        dailyReward.checkDailyReward();
    }, [quest, dailyReward]);

    const handleTaskAction = useCallback(async (task: Task) => {
        try {
            const userRefCode = user.user?.refCode || user.user?.username;
            
            await quest.handleTaskAction(task, userRefCode);
            
        } catch (error) {
            console.error('Error completing task:', error);
        }
    }, [quest, user]);

    const handleDayClick = useCallback((day: number, reward: DailyReward | null) => {
        hapticImpact('soft');
        setSelectedDay(day);
        setSelectedReward(reward);
        setDayModalOpen(true);
    }, []);

    const isDayClaimed = (day: number): boolean => {
        if (!dailyReward.lastDailyRewardClaimAt) return false;
        return day <= dailyReward.dailyRewardDay;
    };

    // Показываем лоадинг пока загружаются квесты
    if (quest.loading) {
        return <LoadingIndicator />;
    }

    if (!quest.quests || !Array.isArray(quest.quests)) {
        return (
            <QuestsEmptyState
                title={t('noTasksAvailable')}
                description={t('noTasksAvailableDesc')}
                actionText={t('refresh')}
                onRefresh={() => quest.loadQuests()}
            />
        );
    }

    if (quest.quests.length === 0) {
        return (
            <QuestsEmptyState
                title={t('noTasksYet')}
                description={t('noTasksYetDesc')}
                actionText={t('refresh')}
                onRefresh={() => quest.loadQuests()}
            />
        );
    }

    const isMobile = document.body.classList.contains('telegram-mobile');

    return (
        <div className="p-4 overflow-y-auto flex w-full flex-col gap-2"
        style={{ marginTop: isMobile ? '142px' : '42px' }}>
            <QuestsList
                quests={quest.quests}
                language={language}
                t={t}
                onTaskAction={handleTaskAction}
                getTaskState={(task: Task) => ({
                    isCompleted: task.userProgress?.isCompletedForCurrent || false,
                    progress: task.userProgress?.progress || 0,
                    targetCount: task.targetCount,
                    isLoading: quest.isTaskLoading(task.id)
                })}
            />
            <DailyRewardProgress
                dailyRewardDay={dailyReward.dailyRewardDay}
                lastDailyRewardClaimAt={dailyReward.lastDailyRewardClaimAt}
                allRewards={dailyReward.allRewards}
                onDayClick={handleDayClick}
            />
            {/* Task Completion Modal */}
            <TaskCompletionModal
                isOpen={!!quest.completedTask}
                onClose={() => quest.clearCompletedTask()}
                task={quest.completedTask}
            />

            {/* Daily Reward Day Modal */}
            <DailyRewardDayModal
                isOpen={dayModalOpen}
                onClose={() => {
                    setDayModalOpen(false);
                    setSelectedDay(null);
                    setSelectedReward(null);
                }}
                day={selectedDay}
                reward={selectedReward}
                isClaimed={selectedDay ? isDayClaimed(selectedDay) : false}
            />
        </div>
    );
});

export default QuestsContainer;
