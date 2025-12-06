import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTelegramApp } from '@/utils/useTelegramApp';
import { useTranslate } from '@/utils/useTranslate';
import type { Bonus } from '@/types/types';
import EmptyPage from '../CoreComponents/EmptyPage';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';

const FriendsContainer: React.FC = observer(() => {
    const { user } = useContext(Context) as IStoreContext;
    const { shareUrl } = useTelegramApp();
    const { t } = useTranslate();
    const [isCopied, setIsCopied] = useState(false);

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
        shareUrl(referralLink, t('join'));
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
                title={t('userDataUnavailable')}
                description={t('userDataUnavailableDesc')}
                actionText={t('refresh')}
                onAction={() => {
                    user.fetchMyInfo();
                }}
            />
        );
    }

    const isMobile = document.body.classList.contains('telegram-mobile');

    return (
        <div className="p-4 overflow-y-auto flex w-full"
        style={{ marginTop: isMobile ? '156px' : '56px' }}>
            <div className="max-w-xl mx-auto w-full space-y-4">
                {/* Referral Stats */}
                <div className="bg-primary-800 border border-primary-700 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center">
                                <i className="fas fa-user-friends text-white"></i>
                            </div>
                            <div>
                                <div className="text-sm font-semibold">{t('referralProgram')}</div>
                                <div className="text-xs text-gray-400">{t('inviteFriendsEarnRewards')}</div>
                            </div>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-primary-700 text-xs text-gray-300 text-center min-w-[2.5rem] flex items-center justify-center">
                            {user.user.referralCount || 0}
                        </div>
                    </div>

                    {/* Referral Code */}
                    <div className="mt-4 space-y-2">
                        <div className="text-xs text-gray-400">{t('yourReferralCode')}</div>
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
                                {isCopied ? t('copied') : t('copyLink')}
                            </motion.button>
                            <motion.button
                                onClick={handleShareReferral}
                                whileTap={{ scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 px-3 py-2 text-xs rounded-md bg-primary-700 hover:bg-primary-600 text-white font-medium transition-colors cursor-pointer"
                            >
                                {t('share')}
                            </motion.button>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                            {t('shareLinkWithFriends')}
                        </div>
                    </div>

                    {/* Referral bonuses */}
                    <div className="mt-4 bg-primary-900 border border-primary-700 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-2">{t('referralBonuses')}</div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto hide-scrollbar">
                            {user.user.lastBonuses && user.user.lastBonuses.length > 0 ? (
                                user.user.lastBonuses.map((bonus: Bonus, index: number) => {

                                    const getBonusIcon = (reason?: string) => {
                                        switch (reason) {
                                            case 'purchase':
                                                return 'fas fa-shopping-cart';
                                            case 'gift':
                                                return 'fas fa-gift';
                                            case 'invite':
                                                return 'fas fa-user-plus';
                                            case 'deposit':
                                                return 'fas fa-coins';
                                            default:
                                                return 'fas fa-star';
                                        }
                                    };

                                    const getBonusTypeIcon = (bonusType?: string) => {
                                        switch (bonusType) {
                                            case 'energy':
                                                return <i className="fa-solid fa-bolt text-purple-400"></i>;
                                            case 'balance':
                                                return <i className="fa-solid fa-gem text-amber-400"></i>;
                                            default:
                                                return null;
                                        }
                                    };

                                    const getSourceUserName = (sourceUser?: Bonus['sourceUser']) => {
                                        if (!sourceUser) return '';
                                        if (sourceUser.firstName) {
                                            return sourceUser.lastName 
                                                ? `${sourceUser.firstName} ${sourceUser.lastName}`
                                                : sourceUser.firstName;
                                        }
                                        return sourceUser.username || `ID: ${sourceUser.telegramId}`;
                                    };

                                    return (
                                        <div key={bonus.id || index} className="bg-primary-800 rounded-lg p-2 space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className='flex gap-2 items-center'>
                                                    <div className="flex items-center">
                                                        <i className={`${getBonusIcon(bonus.reason)} text-purple-400`}></i>
                                                    </div>
                                                    {bonus.sourceUser && (
                                                        <div className="text-xs">
                                                            {getSourceUserName(bonus.sourceUser)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <span className="text-green-400 font-semibold">
                                                        +{bonus.amount || 'Unknown'}
                                                    </span>
                                                    {bonus.bonusType && getBonusTypeIcon(bonus.bonusType)}
                                                </div>
                                            </div>
                                            
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-xs text-gray-500">{t('noBonusesYet')}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FriendsContainer;
