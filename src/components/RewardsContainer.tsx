import React, { useContext, useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import EmptyPage from './EmptyPage';
import LoadingIndicator from './LoadingIndicator';
import Lottie from 'lottie-react';
import type { Reward } from '@/http/rewardAPI';

const RewardsContainer: React.FC = observer(() => {
    const { reward, user } = useContext(Context) as IStoreContext;
    const [activeTab, setActiveTab] = useState<'available' | 'purchased'>('available');
    const [animations, setAnimations] = useState<{  [url: string]: Record<string, unknown> }>({});
    const loadedUrls = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Load rewards when component mounts
        reward.fetchAvailableRewards();
        reward.fetchMyPurchases();
    }, [reward]);

    // Загружаем анимации для наград
    useEffect(() => {
        const loadAnimations = async () => {
            const rewards = activeTab === 'available' ? reward.availableRewards : reward.myPurchases.map(p => p.reward);
            const newAnimations: {  [url: string]: Record<string, unknown> } = {};
            
            for (const rewardItem of rewards) {
                const mediaFile = rewardItem.mediaFile;
                if (mediaFile && mediaFile.mimeType === 'application/json' && !loadedUrls.current.has(mediaFile.url)) {
                    try {
                        const response = await fetch(mediaFile.url);
                        const data = await response.json();
                        newAnimations[mediaFile.url] = data;
                        loadedUrls.current.add(mediaFile.url);
                    } catch (error) {
                        console.error(`Error loading animation for ${mediaFile.url}:`, error);
                    }
                }
            }
            if (Object.keys(newAnimations).length > 0) {
                setAnimations(prev => ({ ...prev, ...newAnimations }));
            }
        };
        loadAnimations();
    }, [activeTab, reward.availableRewards, reward.myPurchases]);
    const handlePurchase = async (rewardId: number) => {
        const success = await reward.purchaseReward(rewardId);
        if (success) {
            // Обновляем баланс пользователя
            await user.fetchMyInfo();
        }
    };

    const renderRewardMedia = (rewardItem: Reward) => {
        const mediaFile = rewardItem.mediaFile;
        if (mediaFile) {
            const { url, mimeType } = mediaFile;
            if (mimeType === 'application/json' && animations[url]) {
                return (
                    <div className="w-20 h-20 flex items-center justify-center">
                        <Lottie
                            animationData={animations[url]}
                            loop={false}
                            autoplay={true}
                            style={{ width: 80, height: 80 }}
                        />
                    </div>
                );
            } else if (mimeType.startsWith('image/')) {
                return (
                    <img
                        src={url}
                        alt={rewardItem.name}
                        className="w-20 h-20 object-cover rounded-lg"
                    />
                );
            }
        }
        return (
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-gift text-white text-2xl"></i>
            </div>
        );
    };

    // Показываем лоадинг пока загружаются награды
    if (reward.loading) {
        return <LoadingIndicator />;
    }

    const currentRewards = activeTab === 'available' ? reward.availableRewards : reward.myPurchases.map(p => p.reward);

    return (
        <div className="p-4 overflow-y-auto flex w-full flex-col gap-4">
            {/* Header with tabs */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Rewards</h2>
                <div className="flex bg-primary-800 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`px-3 py-1 text-sm rounded-md transition ${
                            activeTab === 'available'
                                ? 'bg-secondary-500 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Available
                    </button>
                    <button
                        onClick={() => setActiveTab('purchased')}
                        className={`px-3 py-1 text-sm rounded-md transition ${
                            activeTab === 'purchased'
                                ? 'bg-secondary-500 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        My Purchases
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
                        title={activeTab === 'available' ? "No Rewards Available" : "No Purchases Yet"}
                        description={activeTab === 'available' 
                            ? "There are no rewards available for purchase at the moment." 
                            : "You haven't purchased any rewards yet. Check out the available rewards!"
                        }
                        actionText="Refresh"
                        onAction={() => {
                            reward.fetchAvailableRewards();
                            reward.fetchMyPurchases();
                        }}
                    />
                </div>
            ) : (
                /* Rewards grid */
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                {currentRewards.map((rewardItem) => {
                    const isPurchasing = reward.isRewardPurchasing(rewardItem.id);
                    const userBalance = user.user?.balance || 0;
                    const canAfford = userBalance >= rewardItem.price;
                    
                    return (
                        <div
                            key={rewardItem.id}
                            className="bg-primary-800 border border-primary-700 rounded-xl p-4 flex flex-col items-center hover:bg-primary-700/50 transition"
                        >
                            {/* Media/Animation at the top */}
                            <div className="mb-2">
                                {renderRewardMedia(rewardItem)}
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
                                <button
                                    onClick={() => handlePurchase(rewardItem.id)}
                                    disabled={isPurchasing || !canAfford}
                                    className={`w-full px-1 py-2 text-sm rounded-lg transition flex items-center justify-center gap-2 ${
                                        canAfford && !isPurchasing
                                            ? 'bg-secondary-500 hover:bg-secondary-400 text-white'
                                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {isPurchasing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Purchasing...
                                        </>
                                    ) : canAfford ? (
                                        <>
                                            {rewardItem.price} gems
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-lock"></i>
                                            {rewardItem.price} gems
                                        </>
                                    )}
                                </button>
                            )}
                            
                            {activeTab === 'purchased' && (
                                <div className="w-full px-4 py-3 text-xs text-green-400 flex items-center justify-center gap-1 bg-green-500/10 rounded-lg">
                                    <i className="fas fa-check-circle"></i>
                                    Purchased
                                </div>
                            )}
                        </div>
                    );
                })}
                </div>
            )}

            {/* Balance info */}
            <div className="mt-4 bg-primary-800 border border-primary-700 rounded-xl p-3">
                <div className="text-sm text-gray-400 text-center">
                    <i className="fas fa-wallet mr-2"></i>
                    Your Balance: {user.user?.balance || 0} gems
                </div>
            </div>
        </div>
    );
});

export default RewardsContainer;
