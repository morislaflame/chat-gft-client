import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import EmptyPage from './EmptyPage';

const FriendsContainer: React.FC = observer(() => {
    const { user } = useContext(Context) as IStoreContext;

    useEffect(() => {
        // Load referrals and referral link when component mounts
        user.loadReferrals();
        user.loadReferralLink();
    }, [user]);

    const handleCopyReferral = () => {
        navigator.clipboard.writeText(user.referralLink);
        // Show toast notification
    };

    const handleShareReferral = () => {
        // Implement Telegram sharing
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink(user.referralLink);
        }
    };
    // Проверяем, что referrals существует и является массивом
    if (!user.referrals || !Array.isArray(user.referrals)) {
        return (
            <EmptyPage
                icon="fas fa-user-friends"
                title="Friends System Unavailable"
                description="The friends system is currently unavailable. Please try again later."
                actionText="Refresh"
                onAction={() => {
                    user.loadReferrals();
                    user.loadReferralLink();
                }}
            />
        );
    }

    return (
        <div className="pt-36 pb-32 px-4 overflow-y-auto chat-scrollbar h-screen">
            <div className="max-w-xl mx-auto w-full space-y-4">
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
                            {user.referrals.length}
                        </div>
                    </div>

                    {/* Referral Link */}
                    <div className="mt-4 space-y-2">
                        <div className="text-xs text-gray-400">Your referral link:</div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                readOnly
                                value={user.referralLink}
                                className="w-full bg-primary-800 border border-primary-700 rounded-md px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleCopyReferral}
                                className="flex-1 px-3 py-2 text-xs rounded-md bg-secondary-500 hover:bg-secondary-400"
                            >
                                Copy
                            </button>
                            <button
                                onClick={handleShareReferral}
                                className="flex-1 px-3 py-2 text-xs rounded-md bg-primary-700 hover:bg-primary-600"
                            >
                                Share
                            </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                            Share this link with friends to earn rewards!
                        </div>
                    </div>

                    {/* Last referral rewards list */}
                    <div className="mt-4 bg-primary-900 border border-primary-700 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-2">Last referral rewards</div>
                        <div className="space-y-2">
                            {user.referrals.length > 0 ? (
                                user.referrals.map((referral) => (
                                    <div key={referral.id} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-300">@{referral.username}</span>
                                        <span className="text-green-400">+{referral.reward} energy</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-gray-500">No referrals yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FriendsContainer;
