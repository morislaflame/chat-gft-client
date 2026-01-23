import React from 'react';
import type { Task } from '@/types/types';
import { getTaskText } from '@/utils/translations';
import Button from '../CoreComponents/Button';

type TranslateFn = (key: string) => string;

type QuestItemProps = {
    task: Task;
    language: 'ru' | 'en';
    t: TranslateFn;
    isLoading: boolean;
    isReadyToCheck: boolean;
    isCompleted: boolean;
    progress: number;
    targetCount: number;
    onAction: (task: Task) => void;
};

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

const QuestItem: React.FC<QuestItemProps> = ({
    task,
    language,
    t,
    isLoading,
    isReadyToCheck,
    isCompleted,
    progress,
    targetCount,
    onAction
}) => {
    return (
        <div
            className="bg-primary-800 border border-primary-700 rounded-xl p-3 flex items-center justify-between quest-item hover:bg-primary-700/50 transition"
        >
            <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getTaskGradient(task.type)} flex items-center justify-center`}>
                    <i className={`${getTaskIcon(task.code)} text-white text-sm`}></i>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                    <div className="text-sm font-semibold">{getTaskText(task, language)}</div>
                    <div className="text-xs text-gray-400">
                        {t('reward')}: +{task.reward} {task.rewardType}
                    </div>
                    {targetCount > 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                            {t('progress')}: {progress}/{targetCount}
                        </div>
                    )}
                </div>
            </div>
            <Button
                onClick={(e) => {
                    e?.stopPropagation();
                    onAction(task);
                }}
                disabled={isCompleted || isLoading}
                variant={isCompleted ? 'success' : 'secondary'}
                size="sm"
                className="rounded-full"
            >
                {isLoading ? t('loading') : isCompleted ? t('completed') : isReadyToCheck ? t('check') : t('complete')}
            </Button>
        </div>
    );
};

export default QuestItem;
