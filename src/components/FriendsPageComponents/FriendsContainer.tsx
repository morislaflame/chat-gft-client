import React, { useContext, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTelegramApp } from '@/utils/useTelegramApp';
import { useTranslate } from '@/utils/useTranslate';
import type { Bonus } from '@/types/types';
import EmptyPage from '../CoreComponents/EmptyPage';
import LoadingIndicator from '../CoreComponents/LoadingIndicator';
import Button from '@/components/ui/button';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { trackEvent } from '@/utils/analytics';
import ReferralCodeChangeConfirmModal from '@/components/modals/ReferralCodeChangeConfirmModal';
import { Card } from '../ui/card';

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REF_CODE_CHANGE_COST = 3;
const REF_CODE_MIN_LENGTH = 3;

const FriendsContainer: React.FC = observer(() => {
    const { user } = useContext(Context) as IStoreContext;
    const { shareUrl } = useTelegramApp();
    const { t } = useTranslate();
    const { hapticImpact, hapticNotification } = useHapticFeedback();
    const [isCopied, setIsCopied] = useState(false);
    const [isEditingRefCode, setIsEditingRefCode] = useState(false);
    const [refCodeDraft, setRefCodeDraft] = useState('');
    const [refCodeError, setRefCodeError] = useState<string | null>(null);
    const [refCodeSaving, setRefCodeSaving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const normalizedDraft = useMemo(() => {
        const up = (refCodeDraft || '').toUpperCase();
        // keep only allowed chars and max 8
        const filtered = up.split('').filter((ch) => REF_ALPHABET.includes(ch)).join('');
        return filtered.slice(0, 8);
    }, [refCodeDraft]);

    const handleCopyReferral = async () => {
        hapticImpact('soft');
        const referralLink = `https://t.me/gftrobot?startapp=${user.user?.refCode}`;
        try {
            trackEvent('referral_copy', { has_ref_code: !!user.user?.refCode });
            trackEvent('invite_link_copied', { placement: 'friends', channel: 'copy' });
            await navigator.clipboard.writeText(referralLink);
            hapticNotification('success');
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
        hapticImpact('soft');
        const referralLink = `https://t.me/gftrobot?startapp=${user.user?.refCode}`;
        trackEvent('referral_share', { has_ref_code: !!user.user?.refCode });
        trackEvent('invite_share', { placement: 'friends', channel: 'tg_share' });
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
                    hapticImpact('soft');
                    user.fetchMyInfo();
                }}
            />
        );
    }

    const isMobile = document.body.classList.contains('telegram-mobile');

    const beginEditRefCode = () => {
        hapticImpact('soft');
        setRefCodeError(null);
        setRefCodeDraft(user.user?.refCode || '');
        setIsEditingRefCode(true);
        trackEvent('referral_code_edit_opened');
    };

    const cancelEditRefCode = () => {
        hapticImpact('soft');
        setRefCodeError(null);
        setIsEditingRefCode(false);
        setRefCodeDraft('');
    };

    const requestSaveRefCode = () => {
        if (!user.user) return;
        const next = normalizedDraft;
        if (!next || next.length < REF_CODE_MIN_LENGTH || next.length > 8) {
            setRefCodeError(t('referralCodeInvalid'));
            hapticNotification('error');
            return;
        }
        // validate allowed chars (client-side)
        if ([...next].some((ch) => !REF_ALPHABET.includes(ch))) {
            setRefCodeError(t('referralCodeInvalid'));
            hapticNotification('error');
            return;
        }

        // If code unchanged, just exit edit mode (no modal, no API)
        const current = (user.user.refCode || '').toUpperCase();
        if (current === next) {
            setIsEditingRefCode(false);
            setRefCodeDraft('');
            setRefCodeError(null);
            return;
        }

        // Show confirmation modal for paid change
        setConfirmOpen(true);
    };

    const performSaveRefCode = async () => {
        if (!user.user) return;
        const next = normalizedDraft;

        setRefCodeSaving(true);
        setRefCodeError(null);
        hapticImpact('soft');
        try {
            await user.updateMyReferralCode(next);
            hapticNotification('success');
            setIsEditingRefCode(false);
            setRefCodeDraft('');
            setConfirmOpen(false);
        } catch (error: unknown) {
            const errObj = error as { response?: { data?: { message?: string } } } | null;
            const rawMessage = errObj?.response?.data?.message;
            const message =
                rawMessage === 'Insufficient gems'
                    ? t('insufficientGems')
                    : (rawMessage || t('referralCodeUpdateFailed'));
            setRefCodeError(message);
            hapticNotification('error');
        } finally {
            setRefCodeSaving(false);
        }
    };

    return (
        <>
        <div className="p-4 overflow-y-auto flex w-full"
        style={{ marginTop: isMobile ? '148px' : '48px' }}>
            <div className="max-w-xl mx-auto w-full space-y-4">
                {/* Referral Stats */}
                <Card>
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
                                readOnly={!isEditingRefCode}
                                value={isEditingRefCode ? normalizedDraft : (user.user.refCode || 'Loading...')}
                                onChange={(e) => setRefCodeDraft(e.target.value)}
                                className="w-full bg-card border border-primary-700 rounded-md px-3 py-2 text-sm"
                            />
                        </div>
                        {isEditingRefCode ? (
                            <>
                                <div className="text-xs text-gray-500">
                                    {t('referralCodeRules')}
                                </div>
                                {refCodeError ? (
                                    <div className="text-xs text-red-400">{refCodeError}</div>
                                ) : null}
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={cancelEditRefCode}
                                        variant="outline"
                                        size="sm"
                                        disabled={refCodeSaving}
                                        className="flex-1"
                                    >
                                        {t('cancel')}
                                    </Button>
                                    <Button
                                        onClick={requestSaveRefCode}
                                        variant="gradient"
                                        size="sm"
                                        disabled={refCodeSaving}
                                        className="flex-1"
                                    >
                                        {refCodeSaving ? t('saving') : t('confirm')}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex space-x-2">
                                <Button
                                    onClick={beginEditRefCode}
                                    variant="default"
                                    size="sm"
                                    className="w-full"
                                >
                                    {t('editReferralCode')}
                                </Button>
                            </div>
                        )}
                        {!isEditingRefCode ? (
                            <div className="flex space-x-2">
                                <Button
                                    onClick={handleCopyReferral}
                                    variant="gradient"
                                    size="sm"
                                    state={isCopied ? 'success' : 'default'}
                                    className="flex-1"
                                >
                                    {isCopied ? t('copied') : t('copyLink')}
                                </Button>
                                <Button
                                    onClick={handleShareReferral}
                                    variant="default"
                                    size="sm"
                                    className="flex-1"
                                >
                                    {t('share')}
                                </Button>
                            </div>
                        ) : null}
                        <div className="mt-4 text-xs text-gray-300 font-semibold">
                                {t('referralRewardDependsOnPackage')}
                        </div>
                        <div className="text-xs text-gray-400">
                                {t('referralMaxPerFriend')} <span className="font-semibold">+30 <i className="fa-solid fa-bolt text-user-message-gradient text-md"></i> + 20 <i className="fa-solid fa-gem text-secondary-gradient text-md"></i></span>
                        </div>
                    </div>

                    {/* Referral bonuses */}
                    <div className="mt-4 bg-primary-900 border border-primary-700 rounded-xl p-3">
                        <div className="text-xs font-semibold text-gray-400 mb-2">{t('referralBonuses')}</div>
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
                                                return <i className="fa-solid fa-bolt text-user-message-gradient"></i>;
                                            case 'balance':
                                                return <i className="fa-solid fa-gem text-secondary-gradient"></i>;
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
                                        <div key={bonus.id || index} className="bg-card rounded-lg p-2 space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className='flex gap-2 items-center'>
                                                    <div className="flex items-center">
                                                        <i className={`${getBonusIcon(bonus.reason)} text-user-message-gradient`}></i>
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
                                <div className="text-xs text-gray-500">{t('noBonusesYetReferralDesc')}</div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
        <ReferralCodeChangeConfirmModal
            isOpen={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={performSaveRefCode}
            isLoading={refCodeSaving}
            nextRefCode={normalizedDraft}
            costGems={REF_CODE_CHANGE_COST}
        />
        </>
    );
});

export default FriendsContainer;
