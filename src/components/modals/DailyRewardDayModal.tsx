import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
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

  const energyAmount = day && reward
    ? (reward.rewardType === 'energy' ? reward.reward : 0) +
      (reward.secondRewardType === 'energy' ? (reward.secondReward ?? 0) : 0)
    : 0;
  const tokensAmount = day && reward
    ? (reward.rewardType === 'tokens' ? reward.reward : 0) +
      (reward.secondRewardType === 'tokens' ? (reward.secondReward ?? 0) : 0)
    : 0;
  const isEnergyAvailable = energyAmount > 0;
  const isTokensAvailable = tokensAmount > 0;
  const isCaseAvailable = !!(day && reward && reward.rewardCase);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={true}
      title={day ? `${t('day')} ${day}` : ''}
      headerIcon={
        isClaimed ? (
          <i className="fas fa-check-circle text-white text-2xl"></i>
        ) : (
          <i className="fas fa-calendar-day text-white text-2xl"></i>
        )
      }
      headerIconContainerClassName={`bg-gradient-to-br ${isClaimed ? 'from-green-500 to-emerald-600' : 'from-yellow-500 to-orange-600'} shadow-lg`}
      closeAriaLabel={t('close')}
      footer={
        day && reward ? (
          <Button
            onClick={onClose}
            variant="gradient"
            size="lg"
            className="w-full"
            icon="fas fa-check"
          >
            {t('gotIt')}
          </Button>
        ) : null
      }
    >
      {day && reward ? (
        <div className="px-4">
          <div className="text-center">
            {/* <div className="text-sm text-gray-400 mb-2">{t('reward')}:</div> */}
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
                          className="w-40 h-40 object-contain"
                          loop={false}
                          loadOnIntersect={false}
                          autoplay={true}
                        />
                      ) : (
                        <i className="fa-solid fa-box text-white text-3xl" />
                      )}
                      <div className="text-3xl text-gray-200 mt-2 text-center max-w-[120px] line-clamp-2">
                        +
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
            <div className="flex items-center justify-center gap-3 mb-2">
              {isEnergyAvailable && (
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold text-white">+{energyAmount}</span>
                  <i className="fa-solid fa-bolt text-user-message-gradient text-4xl"></i>
                </div>
              )}
              
              {isTokensAvailable && (
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold text-white">+{tokensAmount}</span>
                  <i className="fa-solid fa-gem text-secondary-gradient text-4xl"></i>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
});

export default DailyRewardDayModal;
