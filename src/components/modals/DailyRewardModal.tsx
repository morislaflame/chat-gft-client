import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';
import { useAnimationLoader } from '@/utils/useAnimationLoader';

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
  const caseItems = (rewardInfo?.rewardCase ? [rewardInfo.rewardCase] : []) as Array<{
    mediaFile?: { url: string; mimeType: string } | null;
    name: string;
    nameEn?: string | null;
  }>;
  const [animations] = useAnimationLoader(caseItems, (c) => c.mediaFile || null, [rewardInfo?.day ?? 0]);

  const isEnergyAvailable = rewardInfo
    ? (rewardInfo.rewardType === 'energy' ? rewardInfo.reward : rewardInfo.secondRewardType === 'energy' ? rewardInfo.secondReward ?? 0 : 0) > 0
    : false;
  const isTokensAvailable = rewardInfo
    ? (rewardInfo.rewardType === 'tokens' ? rewardInfo.reward : rewardInfo.secondRewardType === 'tokens' ? rewardInfo.secondReward ?? 0 : 0) > 0
    : false;
  const isCaseAvailable = !!rewardInfo?.rewardCase;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={false}
      swipeToClose={false}
      hideCloseButton
      title={t('dailyReward')}
      description={rewardInfo ? (language === 'ru' ? `День ${rewardInfo.day} из 7` : `Day ${rewardInfo.day} of 7`) : ''}
      headerIcon={<i className="fa-solid fa-gift text-white text-2xl"></i>}
      headerIconContainerClassName="bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg"
      footer={
        rewardInfo ? (
          <Button
            onClick={handleClaim}
            disabled={dailyReward.loading}
            className="w-full"
            variant="secondary"
            size="lg"
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
        ) : null
      }
    >
      {rewardInfo ? (
        <>
          {/* Reward Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-primary-700/50 rounded-lg p-4 mb-4 border border-primary-600"
          >
            {isCaseAvailable ? (
              <div className="flex flex-col items-center gap-3 mb-2">
                {[rewardInfo.rewardCase].filter(Boolean).map((c, idx) => {
                  const caseEntity = c as NonNullable<typeof c>;
                  const title =
                    language === 'en'
                      ? (caseEntity.nameEn || caseEntity.name)
                      : caseEntity.name;
                  return (
                    <div key={`${rewardInfo.day}-${idx}`} className="flex flex-col items-center">
                      {caseEntity.mediaFile ? (
                        <LazyMediaRenderer
                          mediaFile={caseEntity.mediaFile}
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
                })}
              </div>
            ) : null}

            <div className="flex items-center justify-center gap-2 mb-2">
              {isEnergyAvailable && (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-white">
                    +{rewardInfo.rewardType === 'energy' ? rewardInfo.reward : (rewardInfo.secondReward ?? 0)}
                  </span>
                  <i className="fa-solid fa-bolt text-user-message-gradient text-2xl"></i>
                </div>
              )}
              {isTokensAvailable && (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-white">
                    +{rewardInfo.rewardType === 'tokens' ? rewardInfo.reward : (rewardInfo.secondReward ?? 0)}
                  </span>
                  <i className="fa-solid fa-gem text-secondary-gradient text-2xl"></i>
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
        </>
      ) : null}
    </Modal>
  );
});

export default DailyRewardModal;

