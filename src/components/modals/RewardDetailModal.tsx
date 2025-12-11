import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/CoreComponents/Button';
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

  if (!reward) return null;

  const handlePurchaseClick = async () => {
    hapticImpact('soft');
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
    if (activeTab === 'available') {
      return (
        <Button
          onClick={handlePurchaseClick}
          disabled={isPurchasing || !canAfford}
          variant={canAfford && !isPurchasing ? 'secondary' : 'primary'}
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
      className="p-6"
    >
      <div className="relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-700 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <i className="fas fa-times text-white text-xl"></i>
        </button>

        {/* Reward Media */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: 'spring',
            delay: 0.1,
            bounce: 0.4
          }}
          className="flex justify-center mb-6"
        >
          <div className="w-32 h-32 flex items-center justify-center">
            <LazyMediaRenderer
              mediaFile={reward.mediaFile}
              animations={animations}
              name={reward.name}
              className="w-32 h-32 object-contain"
              loop={false}
              loadOnIntersect={false}
            />
          </div>
        </motion.div>

        {/* Reward Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-3">
            {reward.name}
          </h2>
          
          {reward.description && (
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              {reward.description}
            </p>
          )}


          {/* Purchase info for purchased tab */}
          {activeTab === 'purchased' && userReward && (
            <div className="mt-3 text-xs text-gray-500">
              {t('purchasedFor')} {userReward.purchasePrice} <i className="fa-solid fa-gem text-white"></i>
            </div>
          )}
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {getActionButton()}
        </motion.div>
      </div>
    </Modal>
  );
});

export default RewardDetailModal;

