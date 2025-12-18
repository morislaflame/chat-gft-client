import React from 'react';
import type { Reward, UserReward, CaseBox } from '@/http/rewardAPI';
import RewardCard from './RewardCard';
import BoxCard from './BoxCard';

type TranslateFn = (key: string) => string;

type RewardItemWithUser = {
    rewardItem: Reward;
    userReward: UserReward | null;
};

type RewardsGridProps = {
    data: RewardItemWithUser[];
    cases?: CaseBox[];
    activeTab: 'available' | 'purchased' | 'boxes';
    animations: { [url: string]: Record<string, unknown> };
    boxAnimations?: { [url: string]: Record<string, unknown> };
    onCardClick: (rewardItem: Reward, userReward: UserReward | null) => void;
    onBoxClick: (box: CaseBox) => void;
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
    onBoxClick,
    onWithdrawClick,
    getPurchaseState,
    getWithdrawalState,
    t,
    cases = [],
    boxAnimations = {},
}) => {
    const isMobile = document.body.classList.contains('telegram-mobile');
    return (
        <div className="flex flex-col h-full">
            <div className='w-full' style={{ marginTop: isMobile ? '198px' : '98px' }}></div>
            {activeTab === 'boxes' ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                    {cases.map((box) => (
                        <div key={box.id} className="last:mb-4">
                            <BoxCard
                                box={box}
                                animations={boxAnimations}
                                onClick={onBoxClick}
                            />
                        </div>
                    ))}
                </div>
            ) : (
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
                                    activeTab={activeTab as 'available' | 'purchased'}
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
            )}
            
        </div>
    );
};

export default RewardsGrid;
