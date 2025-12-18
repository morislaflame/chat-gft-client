import React, { useContext, useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';
import type { Reward, UserReward, CaseBox } from '@/http/rewardAPI';
import WithdrawalModal from '../modals/WithdrawalModal';
import RewardPurchaseModal from '../modals/RewardPurchaseModal';
import RewardDetailModal from '../modals/RewardDetailModal';
import WithdrawalResultModal from '../modals/WithdrawalResultModal';
import { useAnimationLoader } from '@/utils/useAnimationLoader';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import RewardsHeader from './RewardsHeader';
import RewardsGrid from './RewardsGrid';
import RewardsEmptyState from './RewardsEmptyState';
// import RewardsBalance from './RewardsBalance';

const RewardsContainer: React.FC = observer(() => {
    const { reward, user } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();
    const { hapticImpact } = useHapticFeedback();
    const [activeTab, setActiveTab] = useState<'available' | 'purchased' | 'boxes'>('available');
    const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
    const [selectedUserReward, setSelectedUserReward] = useState<UserReward | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [selectedRewardForDetail, setSelectedRewardForDetail] = useState<UserReward | null>(null);
    const [withdrawResult, setWithdrawResult] = useState<{ status: 'success' | 'error'; message?: string } | null>(null);

    useEffect(() => {
        // Load rewards when component mounts
        reward.fetchAvailableRewards();
        reward.fetchAvailableCases();
        reward.fetchMyPurchases();
        reward.fetchWithdrawalRequests();
        // user.fetchMyInfo();
    }, [reward, user]);

    const currentRewards = useMemo(() => {
        if (activeTab === 'boxes') return reward.availableCases;
        return activeTab === 'available'
            ? reward.availableRewards
            : reward.myPurchases.map((purchase) => purchase.reward);
    }, [activeTab, reward.availableCases, reward.availableRewards, reward.myPurchases]);

    const rewardsData = useMemo(() => {
        return activeTab === 'available'
            ? reward.availableRewards.map((rewardItem) => ({ rewardItem, userReward: null as UserReward | null }))
            : reward.myPurchases.map((userReward) => ({ rewardItem: userReward.reward, userReward }));
    }, [activeTab, reward.availableRewards, reward.myPurchases]);

    const casesData: CaseBox[] = useMemo(() => reward.availableCases, [reward.availableCases]);

    const [animations] = useAnimationLoader(
        activeTab === 'boxes' ? [] : (currentRewards as Reward[]),
        (rewardItem: Reward) => rewardItem.mediaFile,
        [activeTab]
    );

    const [boxAnimations] = useAnimationLoader(
        casesData as unknown as Reward[],
        (box: CaseBox) => box.mediaFile,
        [casesData.length]
    );
    
    const handlePurchase = async (rewardId: number): Promise<boolean> => {
        const success = await reward.purchaseReward(rewardId);
        if (success) {
            // Обновляем баланс пользователя
            await user.fetchMyInfo();
            return true;
        }
        return false;
    };

    const handleCardClick = (rewardItem: Reward, userReward: UserReward | null) => {
        hapticImpact('soft');
        setSelectedReward(rewardItem);
        setSelectedRewardForDetail(userReward);
        setDetailModalOpen(true);
    };

    const navigateToCase = (box: CaseBox) => {
        hapticImpact('soft');
        window.location.href = `/cases/${box.id}`;
    };

    const handleWithdrawClick = async (userReward: UserReward): Promise<boolean> => {
        const success = await reward.createWithdrawalRequest(userReward.id);
        if (success) {
            // Обновляем список покупок и запросов
            await reward.fetchMyPurchases();
            await reward.fetchWithdrawalRequests();
            setWithdrawResult({ status: 'success' });
            return true;
        }
        setWithdrawResult({ status: 'error', message: reward.error || undefined });
        return false;
    };

    const handleWithdrawClickForModal = (userReward: UserReward) => {
        setSelectedUserReward(userReward);
        setWithdrawalModalOpen(true);
    };

    const handleWithdrawConfirm = async () => {
        if (!selectedUserReward) return;
        
        const success = await reward.createWithdrawalRequest(selectedUserReward.id);
        if (success) {
            setWithdrawalModalOpen(false);
            setSelectedUserReward(null);
            // Обновляем список покупок и запросов
            await reward.fetchMyPurchases();
            await reward.fetchWithdrawalRequests();
            setWithdrawResult({ status: 'success' });
        } else {
            setWithdrawResult({ status: 'error', message: reward.error || undefined });
            setWithdrawalModalOpen(false);
        }
    };

    // Показываем лоадинг пока загружаются награды
    if (reward.loading) {
        return <LoadingIndicator />;
    }

    

    return (
        <div className="p-4 overflow-y-auto hide-scrollbar flex w-full flex-col gap-4 relative overflow-x-hidden" 
        >
            <RewardsHeader
                activeTab={activeTab}
                onChange={setActiveTab}
                title={t('rewards')}
                availableLabel={t('allRewards')}
                purchasedLabel={t('myPurchases')}
                boxesLabel={t('boxes')}
            />

            {reward.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                    {reward.error}
                </div>
            )}

            {(!currentRewards || !Array.isArray(currentRewards) || currentRewards.length === 0) ? (
                <RewardsEmptyState
                    title={
                        activeTab === 'available'
                            ? t('noRewardsAvailable')
                            : activeTab === 'boxes'
                                ? 'No boxes available'
                                : t('noPurchasesYet')
                    }
                    description={
                        activeTab === 'available'
                            ? t('noRewardsAvailableDesc')
                            : activeTab === 'boxes'
                                ? 'Boxes will appear here once available.'
                                : t('noPurchasesYetDesc')
                    }
                    actionText={t('refresh')}
                    onRefresh={() => {
                        reward.fetchAvailableRewards();
                        reward.fetchAvailableCases();
                        reward.fetchMyPurchases();
                    }}
                />
            ) : (
                <RewardsGrid
                    data={rewardsData}
                    cases={casesData}
                    activeTab={activeTab}
                    animations={animations}
                    boxAnimations={boxAnimations}
                    onCardClick={handleCardClick}
                    onBoxClick={navigateToCase}
                    onPurchase={handlePurchase}
                    onWithdrawClick={handleWithdrawClickForModal}
                    getPurchaseState={(rewardItem: Reward) => ({
                        isPurchasing: reward.isRewardPurchasing(rewardItem.id),
                        canAfford: (user.user?.balance || 0) >= rewardItem.price
                    })}
                    getWithdrawalState={(userReward: UserReward) => ({
                        status: reward.getWithdrawalStatus(userReward.id),
                        isCreating: reward.isCreatingWithdrawal(userReward.id)
                    })}
                    t={t}
                />
            )}

            {/* <RewardsBalance
                balanceLabel={t('yourBalance')}
                balance={user.user?.balance || 0}
            /> */}

            {/* Withdrawal Modal */}
            <WithdrawalModal
                isOpen={withdrawalModalOpen}
                onClose={() => {
                    setWithdrawalModalOpen(false);
                    setSelectedUserReward(null);
                }}
                userReward={selectedUserReward}
                onConfirm={handleWithdrawConfirm}
                loading={selectedUserReward ? reward.isCreatingWithdrawal(selectedUserReward.id) : false}
            />

            {/* Reward Purchase Modal */}
            <RewardPurchaseModal
                isOpen={!!reward.purchasedReward}
                onClose={() => reward.clearPurchasedReward()}
                reward={reward.purchasedReward}
                pricePaid={reward.purchasePrice || undefined}
            />

            {/* Reward Detail Modal */}
            <RewardDetailModal
                isOpen={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedReward(null);
                    setSelectedRewardForDetail(null);
                }}
                reward={selectedReward}
                userReward={selectedRewardForDetail}
                activeTab={(activeTab === 'boxes' ? 'available' : activeTab) as 'available' | 'purchased'}
                animations={animations}
                onPurchase={handlePurchase}
                onWithdraw={handleWithdrawClick}
                isPurchasing={selectedReward ? reward.isRewardPurchasing(selectedReward.id) : false}
                canAfford={selectedReward ? (user.user?.balance || 0) >= selectedReward.price : false}
                withdrawalStatus={selectedRewardForDetail ? reward.getWithdrawalStatus(selectedRewardForDetail.id) : null}
                isCreatingWithdrawal={selectedRewardForDetail ? reward.isCreatingWithdrawal(selectedRewardForDetail.id) : false}
            />

            <WithdrawalResultModal
                isOpen={!!withdrawResult}
                status={withdrawResult?.status || null}
                message={withdrawResult?.message}
                onClose={() => setWithdrawResult(null)}
            />
        </div>
    );
});

export default RewardsContainer;
