import React, { useContext, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import type { Task } from '@/types/types';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import EmptyPage from './EmptyPage';
import LoadingIndicator from './LoadingIndicator';

const QuestsContainer: React.FC = observer(() => {
    const { quest, user } = useContext(Context) as IStoreContext;

    useEffect(() => {
        quest.loadQuests();
    }, [quest]);

    const handleTaskAction = useCallback(async (task: Task) => {
        try {
            const userRefCode = user.user?.refCode || user.user?.username;
            
            await quest.handleTaskAction(task, userRefCode);
            
        } catch (error) {
            console.error('Error completing task:', error);
        }
    }, [quest, user]);

    const getTaskIcon = (code: string) => {
        switch (code) {
            case 'DAILY_LOGIN':
                return 'fas fa-calendar-day';
            case 'TELEGRAM_SUB':
                return 'fas fa-bullhorn';
            case 'REF_USERS':
                return 'fas fa-user-friends';
            case 'CHAT_BOOST':
                return 'fas fa-rocket';
            case 'STORY_SHARE':
                return 'fas fa-share';
            default:
                return 'fas fa-star';
        }
    };

    const getTaskGradient = (type: string) => {
        switch (type) {
            case 'DAILY':
                return 'from-amber-500 to-orange-600';
            case 'ONE_TIME':
                return 'from-blue-500 to-indigo-600';
            case 'SPECIAL':
                return 'from-emerald-500 to-teal-600';
            default:
                return 'from-purple-500 to-violet-600';
        }
    };

    // Показываем лоадинг пока загружаются квесты
    if (quest.loading) {
        return <LoadingIndicator />;
    }

    if (!quest.quests || !Array.isArray(quest.quests)) {
        return (
            <EmptyPage
                icon="fas fa-tasks"
                title="No Tasks Available"
                description="There are no tasks available at the moment. Check back later for new challenges!"
                actionText="Refresh"
                onAction={() => quest.loadQuests()}
            />
        );
    }

    if (quest.quests.length === 0) {
        return (
            <EmptyPage
                icon="fas fa-tasks"
                title="No Tasks Yet"
                description="You don't have any tasks yet. Complete your profile or wait for new tasks to appear!"
                actionText="Refresh"
                onAction={() => quest.loadQuests()}
            />
        );
    }

    return (
        <div className="p-4 overflow-y-auto flex w-full">
            <div className="max-w-2xl mx-auto w-full space-y-3 mt-3">
                <div className="text-center mb-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-800 border border-primary-700 text-[11px] uppercase tracking-wider text-gray-400">
                        Quests
                    </div>
                </div>

                {quest.quests.map((task) => {
                    const isCompleted = task.userProgress?.isCompletedForCurrent || false;
                    const progress = task.userProgress?.progress || 0;
                    const targetCount = task.targetCount;
                    const isTaskLoading = quest.isTaskLoading(task.id);
                    
                    return (
                        <div
                            key={task.id}
                            className="bg-primary-800 border border-primary-700 rounded-xl p-3 flex items-center justify-between quest-item hover:bg-primary-700/50 transition"
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getTaskGradient(task.type)} flex items-center justify-center`}>
                                    <i className={`${getTaskIcon(task.code)} text-white text-sm`}></i>
                                </div>
                                <div className="flex-1  flex flex-col gap-1">
                                    <div className="text-sm font-semibold">{task.description}</div>
                                    <div className="text-xs text-gray-400">
                                        Reward: +{task.reward} {task.rewardType}
                                    </div>
                                    {targetCount > 1 && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Progress: {progress}/{targetCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskAction(task);
                                }}
                                disabled={isCompleted || isTaskLoading}
                                className={`px-3 py-1.5 text-xs rounded-full transition ${
                                    isCompleted
                                        ? 'bg-green-500 text-white'
                                        : 'bg-secondary-500 hover:bg-secondary-400'
                                } ${isTaskLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isTaskLoading ? 'Loading...' : isCompleted ? 'Completed' : 'Complete'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default QuestsContainer;
