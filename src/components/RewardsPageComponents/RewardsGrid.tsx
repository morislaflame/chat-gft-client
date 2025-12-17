import React from 'react';
import type { Reward, UserReward } from '@/http/rewardAPI';
import RewardCard from './RewardCard';

type TranslateFn = (key: string) => string;

type RewardItemWithUser = {
    rewardItem: Reward;
    userReward: UserReward | null;
};

type RewardsGridProps = {
    data: RewardItemWithUser[];
    activeTab: 'available' | 'purchased';
    animations: { [url: string]: Record<string, unknown> };
    onCardClick: (rewardItem: Reward, userReward: UserReward | null) => void;
    onPurchase: (rewardId: number) => void;
    onWithdrawClick: (userReward: UserReward) => void;
    getPurchaseState: (rewardItem: Reward) => { isPurchasing: boolean; canAfford: boolean };
    getWithdrawalState: (userReward: UserReward) => { status: string | null; isCreating: boolean };
    t: TranslateFn;
};

const RewardsGrid: React.FC<RewardsGridProps> = ({
    data,
    activeTab,
    animations,
    onCardClick,
    onPurchase,
    onWithdrawClick,
    getPurchaseState,
    getWithdrawalState,
    t
}) => {
    const isMobile = document.body.classList.contains('telegram-mobile');
    return (
        <div className="flex flex-col h-full">
            <div className='w-full' style={{ marginTop: isMobile ? '192px' : '92px' }}></div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                {data.map(({ rewardItem, userReward }) => {
                    const { isPurchasing, canAfford } = getPurchaseState(rewardItem);
                    const withdrawalState = userReward ? getWithdrawalState(userReward) : { status: null, isCreating: false };

                    return (
                        <div
                            key={activeTab === 'available' ? rewardItem.id : (userReward?.id || rewardItem.id)}
                            className="last:mb-4"
                        >
                            <RewardCard
                                rewardItem={rewardItem}
                                userReward={userReward}
                                activeTab={activeTab}
                                animations={animations}
                                onCardClick={onCardClick}
                                onPurchase={onPurchase}
                                onWithdrawClick={onWithdrawClick}
                                isPurchasing={isPurchasing}
                                canAfford={canAfford}
                                withdrawStatus={withdrawalState.status as 'pending' | 'completed' | 'rejected' | null}
                                isCreatingWithdrawal={withdrawalState.isCreating}
                                t={t}
                            />
                        </div>
                    );
                })}
            </div>
            
        </div>
    );
};

export default RewardsGrid;
