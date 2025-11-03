import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTelegramApp } from '@/utils/useTelegramApp';
import type { Bonus } from '@/types/types';
import EmptyPage from '../CoreComponents/EmptyPage';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';

const FriendsContainer: React.FC = observer(() => {
    const { user } = useContext(Context) as IStoreContext;
    const { shareUrl } = useTelegramApp();
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        // Load user data when component mounts
        user.fetchMyInfo();
    }, [user]);

    const handleCopyReferral = async () => {
        const referralLink = `https://t.me/Gft_Chat_bot?startapp=${user.user?.refCode}`;
        try {
            await navigator.clipboard.writeText(referralLink);
            setIsCopied(true);
            // Возвращаем к исходному состоянию через 2 секунды
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleShareReferral = () => {
        const referralLink = `https://t.me/Gft_Chat_bot?startapp=${user.user?.refCode}`;
        shareUrl(referralLink, 'Join me in this amazing app!');
    };

    // Показываем лоадинг пока загружаются данные пользователя
    if (user.loading) {
        return <LoadingIndicator />;
    }

    // Проверяем, что user.user существует
    if (!user.user) {
        return (
            <EmptyPage
                icon="fas fa-user-friends"
                title="User Data Unavailable"
                description="User data is currently unavailable. Please try again later."
                actionText="Refresh"
                onAction={() => {
                    user.fetchMyInfo();
                }}
            />
        );
    }

    return (
        <div className="p-4 overflow-y-auto flex w-full">
            <div className="max-w-xl mx-auto w-full space-y-4 mt-3">
                {/* Referral Stats */}
                <div className="bg-primary-800 border border-primary-700 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center">
                                <i className="fas fa-user-friends text-white"></i>
                            </div>
                            <div>
                                <div className="text-sm font-semibold">Referral Program</div>
                                <div className="text-xs text-gray-400">Invite friends and earn rewards</div>
                            </div>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-primary-700 text-xs text-gray-300 text-center min-w-[2.5rem] flex items-center justify-center">
                            {user.user.referralCount || 0}
                        </div>
                    </div>

                    {/* Referral Code */}
                    <div className="mt-4 space-y-2">
                        <div className="text-xs text-gray-400">Your referral code:</div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                readOnly
                                value={user.user.refCode || 'Loading...'}
                                className="w-full bg-primary-800 border border-primary-700 rounded-md px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <motion.button
                                onClick={handleCopyReferral}
                                whileTap={{ scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className={`flex-1 px-3 py-2 text-xs rounded-md text-white font-medium transition-colors cursor-pointer ${
                                    isCopied 
                                        ? 'bg-green-500 hover:bg-green-500' 
                                        : 'bg-secondary-500 hover:bg-secondary-400'
                                }`}
                            >
                                {isCopied ? 'Copied!' : 'Copy Link'}
                            </motion.button>
                            <motion.button
                                onClick={handleShareReferral}
                                whileTap={{ scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 px-3 py-2 text-xs rounded-md bg-primary-700 hover:bg-primary-600 text-white font-medium transition-colors cursor-pointer"
                            >
                                Share
                            </motion.button>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                            Share this link with friends to earn rewards!
                        </div>
                    </div>

                    {/* Last referral bonuses */}
                    <div className="mt-4 bg-primary-900 border border-primary-700 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-2">Last referral bonuses</div>
                        <div className="space-y-2">
                            {user.user.lastBonuses && user.user.lastBonuses.length > 0 ? (
                                user.user.lastBonuses.map((bonus: Bonus, index: number) => (
                                    <div key={index} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-300">Bonus #{index + 1}</span>
                                        <span className="text-green-400">+{bonus.amount || 'Unknown'} energy</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-gray-500">No bonuses yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FriendsContainer;
