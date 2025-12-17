import React from 'react';
import EmptyPage from '../CoreComponents/EmptyPage';

type RewardsEmptyStateProps = {
    title: string;
    description: string;
    actionText: string;
    onRefresh: () => void;
};

const RewardsEmptyState: React.FC<RewardsEmptyStateProps> = ({
    title,
    description,
    actionText,
    onRefresh
}) => {
    return (
        <div className="flex-1 flex items-center justify-center">
            <EmptyPage
                icon="fas fa-gift"
                title={title}
                description={description}
                actionText={actionText}
                onAction={onRefresh}
            />
        </div>
    );
};

export default RewardsEmptyState;
