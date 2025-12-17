import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '../CoreComponents/Button';

const DailyRewardModal: React.FC = observer(() => {
  const { dailyReward } = useContext(Context) as IStoreContext;
  const { t, language } = useTranslate();
  const isOpen = dailyReward.available && dailyReward.rewardInfo !== null;

  const handleClose = () => {
    // Модалка закрывается автоматически, когда available становится false
    // Но можно добавить логику для временного скрытия
  };

  const handleClaim = async () => {
    try {
      await dailyReward.claimDailyReward();
    } catch (error) {
      console.error('Failed to claim daily reward:', error);
    }
  };

  const rewardInfo = dailyReward.rewardInfo;
  if (!rewardInfo) return null;

  const isEnergyAvailable =
    (rewardInfo.rewardType === 'energy' ? rewardInfo.reward : rewardInfo.secondRewardType === 'energy' ? rewardInfo.secondReward ?? 0 : 0) > 0;
  const isTokensAvailable =
    (rewardInfo.rewardType === 'tokens' ? rewardInfo.reward : rewardInfo.secondRewardType === 'tokens' ? rewardInfo.secondReward ?? 0 : 0) > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={false}
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
              delay: 0.2,
              bounce: 0.4
            }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg"
          >
            <i className="fa-solid fa-gift text-white text-4xl"></i>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('dailyReward')}
          </h2>
          <p className="text-gray-400 text-sm">
            {language === 'ru' ? `День ${rewardInfo.day} из 7` : `Day ${rewardInfo.day} of 7`}
          </p>
        </div>

        {/* Reward Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary-700/50 rounded-lg p-4 mb-4 border border-primary-600"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {isEnergyAvailable && (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white">
                  +{rewardInfo.rewardType === 'energy' ? rewardInfo.reward : rewardInfo.secondReward}
                </span>
                <i className="fa-solid fa-bolt text-purple-400 text-2xl"></i>
              </div>
            )}
            {isTokensAvailable && (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white">
                  +{rewardInfo.rewardType === 'tokens' ? rewardInfo.reward : rewardInfo.secondReward}
                </span>
                <i className="fa-solid fa-gem text-amber-400 text-2xl"></i>
              </div>
            )}
          </div>
        </motion.div>

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">{t('progress')}</span>
            <span className="text-xs text-gray-400">
              {rewardInfo.day}/7 {t('days')}
            </span>
          </div>
          <div className="w-full bg-primary-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(rewardInfo.day / 7) * 100}%` }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Claim Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleClaim}
            disabled={dailyReward.loading}
            className="w-full"
            variant="tretiary"
            size="md"
            icon="fa-solid fa-gift"
          >
            {dailyReward.loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('claiming')}
              </span>
            ) : (
              t('claimReward')
            )}
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
});

export default DailyRewardModal;

