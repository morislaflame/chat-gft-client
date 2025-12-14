import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';

const StageRewardModal: React.FC = observer(() => {
  const { chat } = useContext(Context) as IStoreContext;
  const { t } = useTranslate();
  const stageReward = chat.stageReward;
  const isOpen = stageReward?.isOpen || false;

  const handleClose = () => {
    chat.closeStageReward();
  };

  if (!stageReward) return null;

  const missionNumberText = `${t('stageCompletedMissionPrefix')} ${stageReward.stageNumber}`;

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
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg"
          >
            <i className="fa-solid fa-trophy text-white text-4xl"></i>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('stageCompleted')}
          </h2>
          <p className="text-gray-400 text-sm">
            {missionNumberText}
          </p>
        </div>

        {/* Reward Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary-700/50 rounded-lg p-4 mb-4 border border-primary-600"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-white">
              +{stageReward.rewardAmount}
            </span>
            <i className="fa-solid fa-gem text-amber-400 text-2xl"></i>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleClose}
          className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden cursor-pointer"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <i className="fa-solid fa-check text-white"></i>
            {t('continue')}
          </span>
        </motion.button>
      </div>
    </Modal>
  );
});

export default StageRewardModal;

