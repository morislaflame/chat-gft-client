import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';

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

  const isEnergy = rewardInfo.rewardType === 'energy';

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
            <span className="text-3xl font-bold text-white">
              +{rewardInfo.reward}
            </span>
            <i className={`fa-solid ${isEnergy ? 'fa-bolt text-purple-400' : 'fa-gem text-amber-400'} text-2xl`}></i>
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
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleClaim}
          disabled={dailyReward.loading}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden cursor-pointer"
        >
          {dailyReward.loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('claiming')}
            </span>
          ) : (
            <span className="relative z-10 flex items-center justify-center gap-2">
              <i className="fa-solid fa-gift text-white"></i>
              {t('claimReward')}
            </span>
          )}
          {/* <motion.div
            className="absolute inset-0 transform origin-center bg-white/20 rounded-lg "
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ 
              scale: [0, 1.4, 1.4],
              opacity: [0.6, 0, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              delay: 0.3,
              ease: 'easeOut'
            }}
          /> */}
        </motion.button>
      </div>
    </Modal>
  );
});

export default DailyRewardModal;

