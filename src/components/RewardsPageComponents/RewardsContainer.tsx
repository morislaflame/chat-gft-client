import React, { useContext, useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';
import type { Reward, UserReward } from '@/http/rewardAPI';
import type { CaseBox } from '@/http/caseAPI';
import WithdrawalModal from '../modals/WithdrawalModal';
import RewardPurchaseModal from '../modals/RewardPurchaseModal';
import RewardDetailModal from '../modals/RewardDetailModal';
import WithdrawalResultModal from '../modals/WithdrawalResultModal';
import CaseDetailModal from '../modals/CaseDetailModal';
import CasePurchaseModal from '../modals/CasePurchaseModal';
import { useAnimationLoader } from '@/utils/useAnimationLoader';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { trackEvent } from '@/utils/analytics';
import RewardsHeader from './RewardsHeader';
import RewardsGrid from './RewardsGrid';
import RewardsEmptyState from './RewardsEmptyState';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
// import RewardsBalance from './RewardsBalance';

const RewardsContainer: React.FC = observer(() => {
    const { reward, user, cases } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();
    const { hapticImpact } = useHapticFeedback();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<'available' | 'purchased'>('available');
    const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
    const [selectedUserReward, setSelectedUserReward] = useState<UserReward | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [selectedRewardForDetail, setSelectedRewardForDetail] = useState<UserReward | null>(null);
    const [withdrawResult, setWithdrawResult] = useState<{ status: 'success' | 'error'; message?: string } | null>(null);
    const [selectedBox, setSelectedBox] = useState<CaseBox | null>(null);
    const [caseDetailOpen, setCaseDetailOpen] = useState(false);
    const [purchasedBox, setPurchasedBox] = useState<CaseBox | null>(null);
    const [purchasingBoxId, setPurchasingBoxId] = useState<number | null>(null);

    useEffect(() => {
        // Loot screen view (custom product event)
        trackEvent('loot_view', {
            tab: activeTab === 'available' ? 'boxes' : 'inventory',
        });
    }, [activeTab]);

    useEffect(() => {
        // Load rewards when component mounts
        reward.fetchAvailableRewards();
        cases.fetchActiveCases();
        cases.fetchMyUnopenedCases();
        reward.fetchMyPurchases();
        reward.fetchWithdrawalRequests();
        // user.fetchMyInfo();
    }, [reward, cases, user]);

    useEffect(() => {
        // Allow deep-linking / returning to a specific tab
        const tabFromQuery = searchParams.get('tab');
        const tabFromState = (location.state as { activeTab?: 'available' | 'purchased' } | null)?.activeTab;
        const nextTab = tabFromState || tabFromQuery;
        if (nextTab === 'available' || nextTab === 'purchased') {
            setActiveTab(nextTab);
        }
        // We want this to run only on first mount for current location
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentRewards = useMemo(() => {
        return activeTab === 'available'
            ? reward.availableRewards
            : reward.myPurchases.map((purchase) => purchase.reward);
    }, [activeTab, reward.availableRewards, reward.myPurchases]);

    const rewardsData = useMemo(() => {
        return activeTab === 'available'
            ? reward.availableRewards.map((rewardItem) => ({ rewardItem, userReward: null as UserReward | null }))
            : reward.myPurchases.map((userReward) => ({ rewardItem: userReward.reward, userReward }));
    }, [activeTab, reward.availableRewards, reward.myPurchases]);

    const casesData: CaseBox[] = useMemo(() => cases.activeCases, [cases.activeCases]);
    const myUnopenedCases = useMemo(() => cases.myUnopenedCases, [cases.myUnopenedCases]);

    const ownedCasesData = useMemo(() => {
        const counts = new Map<number, number>();
        const sampleCaseMeta = new Map<number, { name?: string; description?: string | null; price?: number }>();

        for (const uc of myUnopenedCases) {
            counts.set(uc.caseId, (counts.get(uc.caseId) || 0) + 1);
            if (!sampleCaseMeta.has(uc.caseId) && uc.case) {
                sampleCaseMeta.set(uc.caseId, {
                    name: uc.case.name,
                    description: uc.case.description,
                    price: uc.case.price,
                });
            }
        }

        const result: Array<{ box: CaseBox; count: number }> = [];

        for (const [caseId, count] of counts.entries()) {
            if (count <= 0) continue;
            const active = casesData.find((c) => c.id === caseId);
            if (active) {
                result.push({ box: active, count });
                continue;
            }

            const meta = sampleCaseMeta.get(caseId);
            // Fallback: show case even if it's not in active cases (without media)
            result.push({
                box: {
                    id: caseId,
                    name: meta?.name || `Case #${caseId}`,
                    description: meta?.description ?? null,
                    price: meta?.price ?? 0,
                    isActive: false,
                    createdAt: '',
                    updatedAt: '',
                    image: null,
                    mediaFile: undefined,
                    items: [],
                },
                count,
            });
        }

        // Stable ordering: by count desc then name
        result.sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return a.box.name.localeCompare(b.box.name);
        });

        return result;
    }, [casesData, myUnopenedCases]);

    const [animations] = useAnimationLoader(
        currentRewards as Reward[],
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
        trackEvent('reward_detail_open', {
            reward_id: rewardItem.id,
            tab: activeTab,
            owned: !!userReward,
        });
        setSelectedReward(rewardItem);
        setSelectedRewardForDetail(userReward);
        setDetailModalOpen(true);
    };

    const navigateToCase = (box: CaseBox) => {
        hapticImpact('soft');
        trackEvent('case_navigate', { case_id: box.id });
        navigate(`/cases/${box.id}`);
    };

    const handleBoxClick = (box: CaseBox) => {
        hapticImpact('soft');
        trackEvent('case_detail_open', { case_id: box.id });
        setSelectedBox(box);
        setCaseDetailOpen(true);
    };

    const handleBoxPurchase = async (box: CaseBox) => {
        if (purchasingBoxId) return;
        setPurchasingBoxId(box.id);
        const response = await cases.purchaseCase(box.id, 1);
        setPurchasingBoxId(null);

        if (response) {
            setPurchasedBox(box);
        }
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
        trackEvent('withdrawal_modal_open', { user_reward_id: userReward.id, reward_id: userReward.rewardId });
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
                purchasedLabel={t('myRewards')}
            />

            {reward.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                    {reward.error}
                </div>
            )}

            {(() => {
                const isEmpty =
                    activeTab === 'available'
                        ? rewardsData.length === 0 && casesData.length === 0
                        : rewardsData.length === 0 && ownedCasesData.length === 0;

                if (isEmpty) {
                    return (
                <RewardsEmptyState
                    title={activeTab === 'available' ? t('noRewardsAvailable') : t('noPurchasesYet')}
                    description={activeTab === 'available' ? t('noRewardsAvailableDesc') : t('noPurchasesYetDesc')}
                    actionText={t('refresh')}
                    onRefresh={() => {
                        reward.fetchAvailableRewards();
                        cases.fetchActiveCases(true);
                        reward.fetchMyPurchases();
                    }}
                />
                    );
                }

                return (
                <RewardsGrid
                    data={rewardsData}
                    cases={casesData}
                    ownedCases={ownedCasesData}
                    activeTab={activeTab}
                    animations={animations}
                    boxAnimations={boxAnimations}
                    onCardClick={handleCardClick}
                    onBoxClick={handleBoxClick}
                    onBoxPurchase={handleBoxPurchase}
                    onOwnedCaseOpen={navigateToCase}
                    onPurchase={handlePurchase}
                    onWithdrawClick={handleWithdrawClickForModal}
                    getPurchaseState={(rewardItem: Reward) => ({
                        isPurchasing: reward.isRewardPurchasing(rewardItem.id),
                        canAfford: (user.user?.balance || 0) >= rewardItem.price
                    })}
                    getBoxPurchaseState={(box: CaseBox) => ({
                        // Important: don't use `cases.loading` here, otherwise all box cards show loading.
                        isPurchasing: purchasingBoxId === box.id,
                        isDisabled: purchasingBoxId !== null && purchasingBoxId !== box.id,
                        canAfford: (user.user?.balance || 0) >= box.price
                    })}
                    getWithdrawalState={(userReward: UserReward) => ({
                        status: reward.getWithdrawalStatus(userReward.id),
                        isCreating: reward.isCreatingWithdrawal(userReward.id)
                    })}
                    t={t}
                />
                );
            })()}

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
                activeTab={activeTab}
                animations={animations}
                onPurchase={handlePurchase}
                onWithdraw={handleWithdrawClick}
                isPurchasing={selectedReward ? reward.isRewardPurchasing(selectedReward.id) : false}
                canAfford={selectedReward ? (user.user?.balance || 0) >= selectedReward.price : false}
                withdrawalStatus={selectedRewardForDetail ? reward.getWithdrawalStatus(selectedRewardForDetail.id) : null}
                isCreatingWithdrawal={selectedRewardForDetail ? reward.isCreatingWithdrawal(selectedRewardForDetail.id) : false}
            />

            <CaseDetailModal
                isOpen={caseDetailOpen}
                onClose={() => {
                    setCaseDetailOpen(false);
                    setSelectedBox(null);
                }}
                box={selectedBox}
                animations={boxAnimations}
                onGoToCase={(box) => {
                    setCaseDetailOpen(false);
                    setSelectedBox(null);
                    navigateToCase(box);
                }}
            />

            <CasePurchaseModal
                isOpen={!!purchasedBox}
                onClose={() => setPurchasedBox(null)}
                box={purchasedBox}
                animations={boxAnimations}
                onGoToCase={(box) => {
                    setPurchasedBox(null);
                    navigateToCase(box);
                }}
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
