import React from 'react';
import Button from '@/components/ui/button';
import type { Reward, UserReward } from '@/http/rewardAPI';
import { Card } from '../ui/card';

type TranslateFn = (key: string) => string;

type WithdrawalStatus = 'pending' | 'completed' | 'rejected' | null;

type RewardCardProps = {
    rewardItem: Reward;
    userReward: UserReward | null;
    activeTab: 'available' | 'purchased';
    onCardClick: (rewardItem: Reward, userReward: UserReward | null) => void;
    onPurchase: (rewardId: number) => void;
    onWithdrawClick: (userReward: UserReward) => void;
    isPurchasing: boolean;
    canAfford: boolean;
    withdrawStatus: WithdrawalStatus;
    isCreatingWithdrawal: boolean;
    t: TranslateFn;
};

type WithdrawalButtonProps = {
    status: WithdrawalStatus;
    isCreating: boolean;
    onClick: () => void;
    t: TranslateFn;
};

const WithdrawalButton: React.FC<WithdrawalButtonProps> = ({ status, isCreating, onClick, t }) => {
    if (status === 'completed') {
        return (
            <div className="w-full px-4 py-3 text-xs text-green-400 flex items-center justify-center gap-1 bg-green-500/10 rounded-lg border border-green-500/20">
                <i className="fas fa-check-circle"></i>
                {t('withdrawn')}
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="w-full px-4 py-3 text-xs text-yellow-400 flex items-center justify-center gap-1 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <i className="fas fa-clock"></i>
                {t('pending')}
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <Button
                onClick={onClick}
                disabled={isCreating}
                variant="destructive"
                size="sm"
                className="w-full"
                state={isCreating ? 'loading' : 'default'}
                icon="fas fa-redo"
            >
                {t('retryRequest')}
            </Button>
        );
    }

    return (
        <Button
            onClick={onClick}
            disabled={isCreating}
            variant="secondary"
            size="sm"
            className="w-full"
            state={isCreating ? 'loading' : 'default'}
            icon="fas fa-download"
        >
            {t('withdraw')}
        </Button>
    );
};

function getGradientClassByPrice(price: number): string {
    if (price < 300) return 'bg-gradient-to-b from-red-500 to-transparent';
    if (price < 1000) return 'bg-gradient-to-b from-pink-500 to-transparent';
    if (price < 10000) return 'bg-gradient-to-b from-purple-500 to-transparent';
    if (price < 50000) return 'bg-gradient-to-b from-blue-500 to-transparent';
    return 'bg-gradient-to-b from-white to-transparent';
}

const RewardCard: React.FC<RewardCardProps> = ({
    rewardItem,
    userReward,
    activeTab,
    onCardClick,
    onPurchase,
    onWithdrawClick,
    isPurchasing,
    canAfford,
    withdrawStatus,
    isCreatingWithdrawal,
    t
}) => {
    const handleCardClick = () => onCardClick(rewardItem, userReward);
    const key = activeTab === 'available' ? rewardItem.id : (userReward?.id || rewardItem.id);

    const previewUrl = rewardItem.preview?.url;
    const previewMimeType = rewardItem.preview?.mimeType ?? '';
    const isPreviewImage = previewUrl && previewMimeType.startsWith('image/');
    const price = rewardItem.price ?? 0;
    const gradientClass = getGradientClassByPrice(price);

    return (
        <Card
            key={key}
            onClick={handleCardClick}
            className="p-4 flex flex-col items-center quest-item hover:bg-primary-700/50 transition cursor-pointer relative overflow-hidden"
        >
            <div aria-hidden className="pointer-events-none absolute w-full inset-0 rounded-lg">
                <div
                    className={`absolute -top-0 -left-0 h-[50%] w-full opacity-20 ${gradientClass}`}
                />
            </div>
            <div className="mb-2 flex items-center justify-center relative w-26 h-26">
                {isPreviewImage ? (
                    <img
                        src={previewUrl}
                        alt={rewardItem.name}
                        className="w-26 h-26 object-contain"
                    />
                ) : (
                    <div className="w-26 h-26 rounded-lg bg-primary-700/50 flex items-center justify-center">
                        <i className="fa-solid fa-gift text-2xl text-gray-400" />
                    </div>
                )}
            </div>

            <div className="text-center mb-2 flex-1">
                <div className="text-md text-white mb-1 font-semibold">{rewardItem.name}</div>
                {/* {rewardItem.description && (
                    <div className="text-xs text-gray-300 mb-2 line-clamp-2">{rewardItem.description}</div>
                )} */}
                {rewardItem.tonPrice && (
                    <div className="text-xs text-gray-500">
                        {rewardItem.tonPrice} TON
                    </div>
                )}
            </div>

            {activeTab === 'available' && (
                <Button
                    onClick={(e) => {
                        e?.stopPropagation();
                        onPurchase(rewardItem.id);
                    }}
                    disabled={isPurchasing || !canAfford}
                    variant={canAfford && !isPurchasing ? 'gradient' : 'default'}
                    size="sm"
                    className="w-full"
                    state={isPurchasing ? 'loading' : 'default'}
                    icon={!canAfford ? 'fas fa-lock' : undefined}
                >
                    <span className="flex items-center gap-1">
                        {rewardItem.price} <i className="fa-solid fa-gem text-white"></i>
                    </span>
                </Button>
            )}

            {activeTab === 'purchased' && userReward && (
                <div
                    className='w-full'
                    onClick={(e) => e.stopPropagation()}
                >
                    <WithdrawalButton
                        status={withdrawStatus}
                        isCreating={isCreatingWithdrawal}
                        onClick={() => onWithdrawClick(userReward)}
                        t={t}
                    />
                </div>
            )}
        </Card>
    );
};

export default RewardCard;
