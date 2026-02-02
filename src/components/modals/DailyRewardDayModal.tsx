import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/CoreComponents/Button';
import type { DailyReward } from '@/http/dailyRewardAPI';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';
import { useAnimationLoader } from '@/utils/useAnimationLoader';

interface DailyRewardDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: number | null;
  reward: DailyReward | null;
  isClaimed: boolean;
}

const DailyRewardDayModal: React.FC<DailyRewardDayModalProps> = observer(({
  isOpen,
  onClose,
  day,
  reward,
  isClaimed
}) => {
  const { t, language } = useTranslate();
  
  const caseItems = (reward?.rewardCase ? [reward.rewardCase] : []) as Array<{
    mediaFile?: { url: string; mimeType: string } | null;
    name: string;
    nameEn?: string | null;
  }>;
  const [animations] = useAnimationLoader(caseItems, (c) => c.mediaFile || null, [reward?.id ?? 0]);

  if (!day || !reward) return null;

  const energyAmount =
    (reward.rewardType === 'energy' ? reward.reward : 0) +
    (reward.secondRewardType === 'energy' ? (reward.secondReward ?? 0) : 0);
  const tokensAmount =
    (reward.rewardType === 'tokens' ? reward.reward : 0) +
    (reward.secondRewardType === 'tokens' ? (reward.secondReward ?? 0) : 0);
  const isEnergyAvailable = energyAmount > 0;
  const isTokensAvailable = tokensAmount > 0;
  const isCaseAvailable = !!reward.rewardCase;

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
            className={`w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br ${
              isClaimed ? 'from-green-500 to-emerald-600' : 'from-yellow-500 to-orange-600'
            } flex items-center justify-center shadow-lg`}
          >
            {isClaimed ? (
              <i className="fas fa-check-circle text-white text-4xl"></i>
            ) : (
              <i className="fas fa-calendar-day text-white text-4xl"></i>
            )}
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('day')} {day}
          </h2>
          {/* <p className="text-gray-400 text-sm">
            {reward.description}
          </p> */}
        </div>

        {/* Reward Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary-700/50 rounded-lg p-4 mb-4 border border-primary-600"
        >
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">{t('reward')}:</div>
            {isCaseAvailable ? (
              <div className="flex items-center justify-center gap-4 mb-3 flex-wrap">
                {[reward.rewardCase].filter(Boolean).map((c, idx) => {
                  const caseEntity = c as NonNullable<typeof c>;
                  const title =
                    language === 'en'
                      ? (caseEntity.nameEn || caseEntity.name)
                      : caseEntity.name;
                  return (
                    <div key={`${reward.id}-case-${idx}`} className="flex flex-col items-center">
                      {caseEntity.mediaFile ? (
                        <LazyMediaRenderer
                          mediaFile={caseEntity.mediaFile}
                          animations={animations}
                          name={title}
                          className="w-20 h-20 object-contain"
                          loop={false}
                          loadOnIntersect={false}
                          autoplay={true}
                        />
                      ) : (
                        <i className="fa-solid fa-box text-white text-3xl" />
                      )}
                      <div className="text-xs text-gray-200 mt-2 text-center max-w-[120px] line-clamp-2">
                        {title}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
            <div className="flex items-center justify-center gap-3 mb-2">
              {isEnergyAvailable && (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-white">+{energyAmount}</span>
                  <i className="fa-solid fa-bolt text-purple-400 text-2xl"></i>
                </div>
              )}
              {isTokensAvailable && (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-white">+{tokensAmount}</span>
                  <i className="fa-solid fa-gem text-amber-400 text-2xl"></i>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status Info */}
        {/* {isClaimed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-green-400">
              <i className="fas fa-check-circle"></i>
              <span>{t('rewardReceived')}</span>
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
            {t('gotIt')}
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
});

export default DailyRewardDayModal;
