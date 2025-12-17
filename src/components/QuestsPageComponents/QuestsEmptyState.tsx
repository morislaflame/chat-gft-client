import React from 'react';
import EmptyPage from '../CoreComponents/EmptyPage';

type QuestsEmptyStateProps = {
    title: string;
    description: string;
    actionText: string;
    onRefresh: () => void;
};

const QuestsEmptyState: React.FC<QuestsEmptyStateProps> = ({
    title,
    description,
    actionText,
    onRefresh
}) => {
    return (
        <EmptyPage
            icon="fas fa-tasks"
            title={title}
            description={description}
            actionText={actionText}
            onAction={onRefresh}
        />
    );
};

export default QuestsEmptyState;
