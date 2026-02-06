import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import type { Reward, UserReward } from '@/http/rewardAPI';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

interface RewardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward | null;
  userReward: UserReward | null;
  activeTab: 'available' | 'purchased';
  animations: { [url: string]: Record<string, unknown> };
  onPurchase?: (rewardId: number) => Promise<boolean>;
  onWithdraw?: (userReward: UserReward) => Promise<boolean>;
  isPurchasing?: boolean;
  canAfford?: boolean;
  withdrawalStatus?: 'pending' | 'completed' | 'rejected' | null;
  isCreatingWithdrawal?: boolean;
}

const RewardDetailModal: React.FC<RewardDetailModalProps> = observer(({
  isOpen,
  onClose,
  reward,
  userReward,
  activeTab,
  animations,
  onPurchase,
  onWithdraw,
  isPurchasing = false,
  canAfford = false,
  withdrawalStatus = null,
  isCreatingWithdrawal = false
}) => {
  const { t } = useTranslate();
  const { hapticImpact } = useHapticFeedback();

  const handlePurchaseClick = async () => {
    hapticImpact('soft');
    if (!reward) return;
    if (onPurchase && canAfford && !isPurchasing) {
      const success = await onPurchase(reward.id);
      if (success) {
        onClose();
      }
    }
  };

  const handleWithdrawClick = async () => {
    hapticImpact('soft');
    if (onWithdraw && userReward && !isCreatingWithdrawal) {
      const success = await onWithdraw(userReward);
      if (success) {
        onClose();
      }
    }
  };

  const handleClose = () => {
    hapticImpact('soft');
    onClose();
  };

  const getActionButton = () => {
    if (!reward) return null;
    if (activeTab === 'available') {
      return (
        <Button
          onClick={handlePurchaseClick}
          disabled={isPurchasing || !canAfford}
          variant={canAfford && !isPurchasing ? 'gradient' : 'default'}
          size="lg"
          className="w-full"
          icon={isPurchasing ? 'fas fa-spinner fa-spin' : !canAfford ? 'fas fa-lock' : 'fas fa-shopping-cart'}
        >
          {isPurchasing ? t('purchasing') : (
            <span className="flex items-center gap-1 justify-center">
              {t('buyFor')} {reward.price} <i className="fa-solid fa-gem text-white"></i>
            </span>
          )}
        </Button>
      );
    }

    // Для purchased tab
    if (withdrawalStatus === 'completed') {
      return (
        <div className="w-full px-4 py-3 text-sm text-green-400 flex items-center justify-center gap-2 bg-green-500/10 rounded-lg border border-green-500/20">
          <i className="fas fa-check-circle"></i>
          {t('withdrawn')}
        </div>
      );
    }

    if (withdrawalStatus === 'pending') {
      return (
        <div className="w-full px-4 py-3 text-sm text-yellow-400 flex items-center justify-center gap-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <i className="fas fa-clock"></i>
          {t('pending')}
        </div>
      );
    }

    if (withdrawalStatus === 'rejected') {
      return (
        <Button
          onClick={handleWithdrawClick}
          disabled={isCreatingWithdrawal}
          variant="secondary"
          size="lg"
          className="w-full"
          icon={isCreatingWithdrawal ? 'fas fa-spinner fa-spin' : 'fas fa-redo'}
        >
          {isCreatingWithdrawal ? t('sending') : t('retryRequest')}
        </Button>
      );
    }

    // Нет запроса - показываем кнопку "Вывести"
    return (
      <Button
        onClick={handleWithdrawClick}
        disabled={isCreatingWithdrawal}
        variant="secondary"
        size="lg"
        className="w-full"
        icon={isCreatingWithdrawal ? 'fas fa-spinner fa-spin' : 'fas fa-download'}
      >
        {isCreatingWithdrawal ? t('sending') : t('withdraw')}
      </Button>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={true}
      title={reward?.name ?? ''}
      description={reward?.description ?? null}
      headerIcon={<i className="fa-solid fa-gift text-white text-2xl"></i>}
      headerIconContainerClassName={activeTab === 'purchased' ? 'bg-secondary-gradient shadow-lg' : 'bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg'}
      closeAriaLabel={t('close')}
      footer={reward ? getActionButton() : null}
    >
      {reward ? (
        <>
          <div
            className="flex justify-center"
          >
            <div className="w-46 h-46 flex items-center justify-center">
              <LazyMediaRenderer
                mediaFile={reward.mediaFile}
                animations={animations}
                name={reward.name}
                className="w-46 h-46 object-contain"
                loop={false}
                loadOnIntersect={false}
              />
            </div>
          </div>

        </>
      ) : null}
    </Modal>
  );
});

export default RewardDetailModal;

