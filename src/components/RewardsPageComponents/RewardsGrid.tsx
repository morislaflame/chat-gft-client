import React from 'react';
import type { Reward, UserReward } from '@/http/rewardAPI';
import type { CaseBox, UserCase } from '@/http/caseAPI';
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
    myUnopenedCases?: UserCase[];
    activeTab: 'available' | 'purchased';
    boxAnimations?: { [url: string]: Record<string, unknown> };
    onCardClick: (rewardItem: Reward, userReward: UserReward | null) => void;
    onBoxClick: (box: CaseBox) => void;
    onBoxPurchase: (box: CaseBox) => void;
    onOwnedCaseOpen: (box: CaseBox) => void;
    onPurchase: (rewardId: number) => void;
    onWithdrawClick: (userReward: UserReward) => void;
    getPurchaseState: (rewardItem: Reward) => { isPurchasing: boolean; canAfford: boolean };
    getBoxPurchaseState: (box: CaseBox) => { isPurchasing: boolean; isDisabled: boolean; canAfford: boolean };
    getWithdrawalState: (userReward: UserReward) => { status: string | null; isCreating: boolean };
    t: TranslateFn;
    language: 'ru' | 'en';
};

const RewardsGrid: React.FC<RewardsGridProps> = ({
    data,
    activeTab,
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
    language,
    cases = [],
    ownedCases = [],
    myUnopenedCases = [],
    boxAnimations = {},
}) => {
    const isMobile = document.body.classList.contains('telegram-mobile');
    const showBoxes = activeTab === 'available' && cases.length > 0;
    const showOwnedBoxes = activeTab === 'purchased' && ownedCases.length > 0;
    const showRewards = data.length > 0;
    const rewardsTitle = activeTab === 'available' ? t('allRewards') : t('myRewards');

    return (
        <div className="flex flex-col h-full">
            <div className='w-full' style={{ marginTop: isMobile ? '218px' : '118px' }}></div>
            {showBoxes && (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-lg text-gray-300 font-semibold">{t('boxes')}</div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-4">
                        {cases.map((box) => {
                            const { isPurchasing, isDisabled, canAfford } = getBoxPurchaseState(box);
                            const hasUnopenedCase = myUnopenedCases.some((uc) => uc.caseId === box.id);
                            const unopenedCount = myUnopenedCases.filter((uc) => uc.caseId === box.id).length;
                            return (
                                <div key={box.id} className="rewards-grid-item">
                                    <BoxCard
                                        box={box}
                                        animations={boxAnimations}
                                        onClick={onBoxClick}
                                        onPurchase={onBoxPurchase}
                                        onOpen={hasUnopenedCase ? onOwnedCaseOpen : undefined}
                                        isPurchasing={isPurchasing}
                                        isDisabled={isDisabled}
                                        canAfford={canAfford}
                                        hasUnopenedCase={hasUnopenedCase}
                                        unopenedCount={unopenedCount}
                                        t={t}
                                        language={language}
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
                            <div key={box.id} className="rewards-grid-item">
                                <OwnedBoxCard
                                    box={box}
                                    count={count}
                                    animations={boxAnimations}
                                    onOpen={onOwnedCaseOpen}
                                    t={t}
                                    language={language}
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
                            className="rewards-grid-item last:mb-30"
                        >
                            <RewardCard
                                rewardItem={rewardItem}
                                userReward={userReward}
                                activeTab={activeTab}
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
