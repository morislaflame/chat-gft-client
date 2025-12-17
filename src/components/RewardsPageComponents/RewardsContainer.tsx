import React, { useContext, useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import EmptyPage from '../CoreComponents/EmptyPage';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';
import Button from '../CoreComponents/Button';
import type { Reward, UserReward } from '@/http/rewardAPI';
import WithdrawalModal from '../modals/WithdrawalModal';
import RewardPurchaseModal from '../modals/RewardPurchaseModal';
import RewardDetailModal from '../modals/RewardDetailModal';
import WithdrawalResultModal from '../modals/WithdrawalResultModal';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';
import { useAnimationLoader } from '@/utils/useAnimationLoader';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

const RewardsContainer: React.FC = observer(() => {
    const { reward, user } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();
    const { hapticImpact } = useHapticFeedback();
    const [activeTab, setActiveTab] = useState<'available' | 'purchased'>('available');
    const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
    const [selectedUserReward, setSelectedUserReward] = useState<UserReward | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [selectedRewardForDetail, setSelectedRewardForDetail] = useState<UserReward | null>(null);
    const [withdrawResult, setWithdrawResult] = useState<{ status: 'success' | 'error'; message?: string } | null>(null);

    useEffect(() => {
        // Load rewards when component mounts
        reward.fetchAvailableRewards();
        reward.fetchMyPurchases();
        reward.fetchWithdrawalRequests();
        // user.fetchMyInfo();
    }, [reward, user]);

    // Получаем текущие награды в зависимости от активной вкладки
    const currentRewards = useMemo(() => {
        return activeTab === 'available' 
                ? reward.availableRewards 
                : reward.myPurchases.map(p => p.reward);
    }, [activeTab, reward.availableRewards, reward.myPurchases]);
    
    // Используем хук для загрузки анимаций
    const [animations] = useAnimationLoader(
        currentRewards,
        (rewardItem) => rewardItem.mediaFile,
        [activeTab]
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

    const getWithdrawalButton = (userReward: UserReward, onClickHandler?: (userReward: UserReward) => void) => {
        const status = reward.getWithdrawalStatus(userReward.id);
        const isCreating = reward.isCreatingWithdrawal(userReward.id);
        const handleClick = onClickHandler || handleWithdrawClickForModal;
        
        if (status === 'completed') {
            return (
                <div className="w-full px-2.5 py-2 text-xs text-green-400 flex items-center justify-center gap-1 bg-green-500/10 rounded-lg border border-green-500/20">
                    <i className="fas fa-check-circle"></i>
                    {t('withdrawn')}
                </div>
            );
        }
        
        if (status === 'pending') {
            return (
                <div className="w-full px-2.5 py-2 text-xs text-yellow-400 flex items-center justify-center gap-1 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <i className="fas fa-clock"></i>
                    {t('pending')}
                </div>
            );
        }
        
        if (status === 'rejected') {
            return (
                <Button
                    onClick={() => handleClick(userReward)}
                    disabled={isCreating}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    icon={isCreating ? 'fas fa-spinner fa-spin' : 'fas fa-redo'}
                >
                    {isCreating ? t('sending') : t('retryRequest')}
                </Button>
            );
        }
        
        // Нет запроса - показываем кнопку "Вывести"
        return (
            <Button
                onClick={() => handleClick(userReward)}
                disabled={isCreating}
                variant="secondary"
                size="sm"
                className="w-full"
                icon={isCreating ? 'fas fa-spinner fa-spin' : 'fas fa-download'}
            >
                {isCreating ? t('sending') : t('withdraw')}
            </Button>
        );
    };


    // Показываем лоадинг пока загружаются награды
    if (reward.loading) {
        return <LoadingIndicator />;
    }

    const isMobile = document.body.classList.contains('telegram-mobile');

    return (
        <div className="p-4 overflow-y-auto hide-scrollbar flex w-full flex-col gap-4"
        style={{ marginTop: isMobile ? '156px' : '56px' }}>
            {/* Header with tabs */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{t('rewards')}</h2>
                <div className="flex bg-primary-800 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`px-3 py-1 text-sm rounded-md transition cursor-pointer ${
                            activeTab === 'available'
                                ? 'bg-secondary-500 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {t('available')}
                    </button>
                    <button
                        onClick={() => setActiveTab('purchased')}
                        className={`px-3 py-1 text-sm rounded-md transition cursor-pointer ${
                            activeTab === 'purchased'
                                ? 'bg-secondary-500 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {t('myPurchases')}
                    </button>
                </div>
            </div>

            {/* Error message */}
            {reward.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                    {reward.error}
                </div>
            )}

            {/* Check for empty data */}
            {(!currentRewards || !Array.isArray(currentRewards) || currentRewards.length === 0) ? (
                <div className="flex-1 flex items-center justify-center">
                    <EmptyPage
                        icon="fas fa-gift"
                        title={activeTab === 'available' ? t('noRewardsAvailable') : t('noPurchasesYet')}
                        description={activeTab === 'available' 
                            ? t('noRewardsAvailableDesc')
                            : t('noPurchasesYetDesc')
                        }
                        actionText={t('refresh')}
                        onAction={() => {
                            reward.fetchAvailableRewards();
                            reward.fetchMyPurchases();
                        }}
                    />
                </div>
            ) : (
                /* Rewards grid */
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                {(activeTab === 'available' 
                    ? reward.availableRewards.map((rewardItem) => ({ rewardItem, userReward: null }))
                    : reward.myPurchases.map((userReward) => ({ rewardItem: userReward.reward, userReward }))
                ).map(({ rewardItem, userReward }) => {
                    const isPurchasing = reward.isRewardPurchasing(rewardItem.id);
                    const userBalance = user.user?.balance || 0;
                    const canAfford = userBalance >= rewardItem.price;
                    
                    return (
                        <div
                            key={activeTab === 'available' ? rewardItem.id : (userReward?.id || rewardItem.id)}
                            onClick={() => handleCardClick(rewardItem, userReward)}
                            className="bg-primary-800 border border-primary-700 rounded-xl p-4 flex flex-col items-center hover:bg-primary-700/50 transition cursor-pointer"
                        >
                            {/* Media/Animation at the top */}
                            <div className="mb-2 w-20 h-20 flex items-center justify-center">
                                <LazyMediaRenderer
                                    mediaFile={rewardItem.mediaFile}
                                    animations={animations}
                                    name={rewardItem.name}
                                    className="w-20 h-20 object-contain"
                                    loop={false}
                                    loadOnIntersect={true}
                                />
                            </div>
                            
                            {/* Reward info */}
                            <div className="text-center mb-2 flex-1">
                                <div className="text-sm text-white mb-1">{rewardItem.name}</div>
                                {rewardItem.description && (
                                    <div className="text-xs text-gray-300 mb-2 line-clamp-2">{rewardItem.description}</div>
                                )}
                                {rewardItem.tonPrice && (
                                    <div className="text-xs text-gray-500">
                                        {rewardItem.tonPrice} TON
                                    </div>
                                )}
                            </div>
                            
                            {/* Purchase button or status */}
                            {activeTab === 'available' && (
                                <Button
                                    onClick={() => {
                                        handlePurchase(rewardItem.id);
                                    }}
                                    disabled={isPurchasing || !canAfford}
                                    variant={canAfford && !isPurchasing ? 'secondary' : 'primary'}
                                    size="sm"
                                    className="w-full"
                                    icon={isPurchasing ? 'fas fa-spinner fa-spin' : !canAfford ? 'fas fa-lock' : undefined}
                                >
                                    {isPurchasing ? t('purchasing') : (
                                        <span className="flex items-center gap-1">
                                            {rewardItem.price} <i className="fa-solid fa-gem text-white"></i>
                                        </span>
                                    )}
                                </Button>
                            )}
                            
                            {activeTab === 'purchased' && userReward && (
                                <div onClick={(e) => e.stopPropagation()}>
                                    {getWithdrawalButton(userReward, handleWithdrawClickForModal)}
                                </div>
                            )}
                        </div>
                    );
                })}
                </div>
            )}

            {/* Balance info */}
            <div className="bg-primary-800 border border-primary-700 rounded-xl p-3">
                <div className="text-sm text-gray-400 text-center flex items-center justify-center gap-1">
                    <i className="fas fa-wallet"></i>
                    <span>{t('yourBalance')} {user.user?.balance || 0}</span>
                    <i className="fa-solid fa-gem text-white"></i>
                </div>
            </div>

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
                activeTab={activeTab}
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
