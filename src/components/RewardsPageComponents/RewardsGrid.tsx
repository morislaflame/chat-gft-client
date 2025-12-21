import React from 'react';
import type { Reward, UserReward } from '@/http/rewardAPI';
import type { CaseBox } from '@/http/caseAPI';
import RewardCard from './RewardCard';
import BoxCard from './BoxCard';
import OwnedBoxCard from './OwnedBoxCard';

type TranslateFn = (key: string) => string;

type RewardItemWithUser = {
    rewardItem: Reward;
    userReward: UserReward | null;
};

type RewardsGridProps = {
    data: RewardItemWithUser[];
    cases?: CaseBox[];
    ownedCases?: Array<{ box: CaseBox; count: number }>;
    activeTab: 'available' | 'purchased';
    animations: { [url: string]: Record<string, unknown> };
    boxAnimations?: { [url: string]: Record<string, unknown> };
    onCardClick: (rewardItem: Reward, userReward: UserReward | null) => void;
    onBoxClick: (box: CaseBox) => void;
    onBoxPurchase: (box: CaseBox) => void;
    onOwnedCaseOpen: (box: CaseBox) => void;
    onPurchase: (rewardId: number) => void;
    onWithdrawClick: (userReward: UserReward) => void;
    getPurchaseState: (rewardItem: Reward) => { isPurchasing: boolean; canAfford: boolean };
    getBoxPurchaseState: (box: CaseBox) => { isPurchasing: boolean; canAfford: boolean };
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
    onBoxPurchase,
    onOwnedCaseOpen,
    onWithdrawClick,
    getPurchaseState,
    getBoxPurchaseState,
    getWithdrawalState,
    t,
    cases = [],
    ownedCases = [],
    boxAnimations = {},
}) => {
    const isMobile = document.body.classList.contains('telegram-mobile');
    const showBoxes = activeTab === 'available' && cases.length > 0;
    const showOwnedBoxes = activeTab === 'purchased' && ownedCases.length > 0;
    const showRewards = data.length > 0;
    const rewardsTitle = activeTab === 'available' ? t('allRewards') : t('myRewards');

    return (
        <div className="flex flex-col h-full">
            <div className='w-full' style={{ marginTop: isMobile ? '208px' : '108px' }}></div>
            {showBoxes && (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-lg text-gray-300 font-semibold">{t('boxes')}</div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-4">
                        {cases.map((box) => {
                            const { isPurchasing, canAfford } = getBoxPurchaseState(box);
                            return (
                                <div key={box.id}>
                                    <BoxCard
                                        box={box}
                                        animations={boxAnimations}
                                        onClick={onBoxClick}
                                        onPurchase={onBoxPurchase}
                                        isPurchasing={isPurchasing}
                                        canAfford={canAfford}
                                        t={t}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {showOwnedBoxes && (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-lg text-gray-300 font-semibold">{t('myBoxes')}</div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-4">
                        {ownedCases.map(({ box, count }) => (
                            <div key={box.id}>
                                <OwnedBoxCard
                                    box={box}
                                    count={count}
                                    animations={boxAnimations}
                                    onOpen={onOwnedCaseOpen}
                                    t={t}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}

            {showRewards && (
                <div className="flex items-center justify-between mb-2">
                    <div className="text-lg text-gray-300 font-semibold">{rewardsTitle}</div>
                </div>
            )}

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
