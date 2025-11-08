import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/CoreComponents/Button';
import type { Reward } from '@/http/rewardAPI';
import { renderRewardMedia } from '@/utils/rewardUtils';

interface RewardPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward | null;
  pricePaid?: number;
}

const RewardPurchaseModal: React.FC<RewardPurchaseModalProps> = ({
  isOpen,
  onClose,
  reward,
}) => {
  const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);

  // Загружаем анимацию при изменении reward
  useEffect(() => {
    if (!reward?.mediaFile) {
      setAnimationData(null);
      return;
    }

    const mediaFile = reward.mediaFile;
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
  }, [reward]);

  if (!reward) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={true}
      className="p-4"
    >
      <div className="relative">
        {/* Header */}
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: 'spring',
              delay: 0.1,
              bounce: 0.4
            }}
            className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg"
          >
            <i className="fas fa-gift text-white text-4xl"></i>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Покупка успешна!
          </h2>
        </div>

        {/* Reward Media */}
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
              delay: 0.15,
              bounce: 0.4
            }}
          >
            {renderRewardMedia({
              reward: reward,
              animationData: animationData,
              size: 'md',
              containerClassName: 'mx-auto'
            })}
          </motion.div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-1">
              {reward.name}
            </div>
            {reward.description && (
              <div className="text-sm text-gray-300 mb-2">
                {reward.description}
              </div>
            )}
          </div>
        </motion.div>

        {/* Purchase Info */}
        {/* {pricePaid !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-primary-700/30 rounded-lg p-3 mb-4 border border-primary-600/50"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Оплачено:</span>
              <div className="flex items-center gap-1">
                <span className="text-white font-semibold">{pricePaid}</span>
                <i className="fa-solid fa-gem text-white"></i>
              </div>
            </div>
          </motion.div>
        )} */}

        {/* Close Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={onClose}
            variant="secondary"
            size="md"
            className="w-full"
            icon="fas fa-check"
          >
            Отлично!
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
};

export default RewardPurchaseModal;
