import React from 'react';
import EmptyPage from '../CoreComponents/EmptyPage';

type StoreEmptyStateProps = {
    title: string;
    description: string;
    actionText: string;
    onRefresh: () => void;
};

const StoreEmptyState: React.FC<StoreEmptyStateProps> = ({
    title,
    description,
    actionText,
    onRefresh
}) => {
    return (
        <EmptyPage
            icon="fas fa-store"
            title={title}
            description={description}
            actionText={actionText}
            onAction={onRefresh}
        />
    );
};

export default StoreEmptyState;
