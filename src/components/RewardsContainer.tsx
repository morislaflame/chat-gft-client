import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import EmptyPage from './EmptyPage';
import LoadingIndicator from './LoadingIndicator';

const RewardsContainer: React.FC = observer(() => {
    const { user } = useContext(Context) as IStoreContext;

    useEffect(() => {
        // Load rewards when component mounts
        user.loadRewards();
    }, [user]);
    const getGradientClass = (index: number) => {
        const gradients = [
            'from-purple-500/5 to-transparent',
            'from-blue-400/5 to-transparent',
            'from-rose-400/5 to-transparent',
            'from-purple-500/5 to-transparent',
            'from-rose-400/5 to-transparent',
            'from-purple-500/5 to-transparent'
        ];
        return gradients[index % gradients.length];
    };

    // Показываем лоадинг пока загружаются награды
    if (user.loading) {
        return <LoadingIndicator />;
    }

    // Проверяем, что rewards существует и является массивом
    if (!user.rewards || !Array.isArray(user.rewards)) {
        return (
            <EmptyPage
                icon="fas fa-gift"
                title="Rewards Unavailable"
                description="Your rewards are currently unavailable. Please try again later."
                actionText="Refresh"
                onAction={() => user.loadRewards()}
            />
        );
    }

    // Проверяем, что массив не пустой
    if (user.rewards.length === 0) {
        return (
            <EmptyPage
                icon="fas fa-gift"
                title="No Rewards Yet"
                description="You don't have any rewards yet. Complete quests to earn amazing rewards!"
                actionText="Refresh"
                onAction={() => user.loadRewards()}
            />
        );
    }

    return (
        <div className="pt-24 pb-32 px-4 overflow-y-auto chat-scrollbar h-screen">
            <div className="max-w-5xl mx-auto w-full">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-800 border border-primary-700 text-[11px] uppercase tracking-wider text-gray-400 mb-3">
                        Your Rewards
                    </div>
                    <h2 className="text-2xl font-bold text-secondary-400">
                        Your Rewards
                    </h2>
                    <div className="text-gray-400 mt-1 text-sm">Complete quests and loot rewards!</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {user.rewards.map((reward, index) => (
                        <div
                            key={reward.id}
                            className="saber-card bg-primary-800 rounded-xl p-3 border border-primary-700 relative overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-tr ${getGradientClass(index)} pointer-events-none`}></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-full">
                                    <img
                                        className="nft-img"
                                        style={{ transform: 'scale(0.92)', transformOrigin: 'center' }}
                                        src={reward.image}
                                        alt={reward.name}
                                        data-slug={reward.slug}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default RewardsContainer;
