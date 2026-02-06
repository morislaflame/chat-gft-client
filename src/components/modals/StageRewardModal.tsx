import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import LazyMediaRenderer from '@/utils/lazy-media-renderer';
import { useAnimationLoader } from '@/utils/useAnimationLoader';

const StageRewardModal: React.FC = observer(() => {
  const { chat, user } = useContext(Context) as IStoreContext;
  const { t } = useTranslate();
  const stageReward = chat.stageReward;
  const isOpen = stageReward?.isOpen || false;
  const language = user.user?.language || 'ru';

  const caseItems = [stageReward?.rewardCase].filter(Boolean) as Array<
    NonNullable<NonNullable<typeof stageReward>['rewardCase']>
  >;
  const [animations] = useAnimationLoader(
    caseItems,
    (c) => c.mediaFile,
    [isOpen]
  );

  const handleClose = () => {
    chat.closeStageReward();
  };

  const missionNumberText = stageReward ? `${t('stageCompletedMissionPrefix')} ${stageReward.stageNumber}` : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={false}
      className="p-4"
    >
      {stageReward ? (
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
          {stageReward.rewardCase ? (
            <div className="flex flex-col items-center gap-3 mb-3">
              {(() => {
                const c = stageReward.rewardCase;
                const title = language === 'en' ? (c.nameEn || c.name) : c.name;
                return (
                  <div className="flex flex-col items-center">
                    {c.mediaFile ? (
                      <LazyMediaRenderer
                        mediaFile={c.mediaFile}
                        animations={animations}
                        name={title}
                        className="w-24 h-24 object-contain"
                        loop={false}
                        loadOnIntersect={false}
                        autoplay={true}
                      />
                    ) : (
                      <i className="fa-solid fa-box text-white text-4xl" />
                    )}
                    <div className="text-sm text-gray-200 mt-2 font-semibold text-center">
                      {title}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : null}

          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-white">
              +{stageReward.rewardAmount}
            </span>
            <i className="fa-solid fa-gem text-secondary-gradient text-2xl"></i>
          </div>
          <div className="mt-2 text-center text-xs text-gray-300">
            {t('stageRewardGemsHint')}
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleClose}
            variant="gradient"
            size="default"
            className="w-full"
            icon="fa-solid fa-check"
          >
            {t('continue')}
          </Button>
        </motion.div>
      </div>
      ) : null}
    </Modal>
  );
});

export default StageRewardModal;

