import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import type { UserReward } from '@/http/rewardAPI';
import { renderRewardMedia } from '@/utils/rewardUtils';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userReward: UserReward | null;
  onConfirm: () => void;
  loading: boolean;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = observer(({
  isOpen,
  onClose,
  userReward,
  onConfirm,
  loading
}) => {
  const { t } = useTranslate();
  const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);

  // Загружаем анимацию при изменении userReward
  useEffect(() => {
    if (!userReward?.reward?.mediaFile) {
      setAnimationData(null);
      return;
    }

    const mediaFile = userReward.reward.mediaFile;
    if (mediaFile.mimeType === 'application/json') {
      fetch(mediaFile.url)
        .then(response => response.json())
        .then(data => setAnimationData(data))
        .catch(error => {
          console.error('Error loading animation:', error);
          setAnimationData(null);
        });
    } else {
      setAnimationData(null);
    }
  }, [userReward]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={!loading}
      className="p-4"
    >
      {userReward ? (
      <div className="relative">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-white mb-4">
            {t('withdrawalRequest')}
          </h2>
          
          {/* Reward Media */}
          
        </div>

        {/* Reward Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary-700/50 rounded-lg p-4 mb-4 border border-primary-600"
        >
            <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: 'spring',
              delay: 0.1,
              bounce: 0.4
            }}
          >
            {userReward && renderRewardMedia({
              reward: userReward.reward,
              animationData: animationData,
              size: 'md',
              containerClassName: 'mx-auto'
            })}
          </motion.div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-1">
              {userReward.reward.name}
            </div>
            {userReward.reward.description && (
              <div className="text-sm text-gray-300 mb-2">
                {userReward.reward.description}
              </div>
            )}
            <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
              {t('purchasedFor')} {userReward.purchasePrice} <i className="fa-solid fa-gem text-white"></i>
            </div>
          </div>
        </motion.div>

        {/* Info Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4"
        >
          <div className="flex items-start gap-2">
            <i className="fa-solid fa-info-circle text-blue-400 mt-0.5"></i>
            <p className="text-xs text-blue-300">
              {t('withdrawalInfo')}
            </p>
          </div>
        </motion.div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outline"
            size="default"
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            variant="secondary"
            size="default"
            className="flex-1"
            icon={loading ? 'fas fa-spinner fa-spin' : 'fas fa-check'}
          >
            {loading ? t('sending') : t('confirm')}
          </Button>
        </div>
      </div>
      ) : null}
    </Modal>
  );
});

export default WithdrawalModal;

