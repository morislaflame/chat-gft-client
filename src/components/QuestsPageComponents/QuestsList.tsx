import React from 'react';
import type { Task } from '@/types/types';
import QuestItem from './QuestItem';
import { observer } from 'mobx-react-lite';

type TranslateFn = (key: string) => string;

type QuestsListProps = {
    quests: Task[];
    language: 'ru' | 'en';
    t: TranslateFn;
    onTaskAction: (task: Task) => void;
    getTaskState: (task: Task) => {
        isCompleted: boolean;
        progress: number;
        targetCount: number;
        isLoading: boolean;
        isReadyToCheck: boolean;
    };
};

const QuestsList: React.FC<QuestsListProps> = observer(({
    quests,
    language,
    t,
    onTaskAction,
    getTaskState
}) => {
    return (
        <>
            {quests.map((task) => {
                const { isCompleted, progress, targetCount, isLoading, isReadyToCheck } = getTaskState(task);

                return (
                    <QuestItem
                        key={task.id}
                        task={task}
                        language={language}
                        t={t}
                        isLoading={isLoading}
                        isReadyToCheck={isReadyToCheck}
                        isCompleted={isCompleted}
                        progress={progress}
                        targetCount={targetCount}
                        onAction={onTaskAction}
                    />
                );
            })}
        </>
    );
});

export default QuestsList;
