import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
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
      swipeToClose={false}
      hideCloseButton
      title={t('stageCompleted')}
      description={missionNumberText}
      headerIcon={<i className="fa-solid fa-trophy text-white text-2xl"></i>}
      headerIconContainerClassName="bg-gradient-to-br from-red-500 to-red-700 shadow-lg"
      footer={
        stageReward ? (
          <Button
            onClick={handleClose}
            variant="gradient"
            size="lg"
            className="w-full"
            icon="fa-solid fa-check"
          >
            {t('continue')}
          </Button>
        ) : null
      }
    >
      {stageReward ? (
        <div className="px-4">
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
                        className="w-48 h-48 object-contain"
                        loop={false}
                        loadOnIntersect={false}
                        autoplay={true}
                      />
                    ) : (
                      <i className="fa-solid fa-box text-white text-4xl" />
                    )}
                    <div className="text-sm text-gray-200 mt-4 font-semibold text-center">
                      {title}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : null}

          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold text-white">
              +{stageReward.rewardAmount}
            </span>
            <i className="fa-solid fa-gem text-secondary-gradient text-4xl"></i>
          </div>
          <div className="mt-2 text-center text-xs text-gray-300">
            {t('stageRewardGemsHint')}
          </div>
        </div>
      ) : null}
    </Modal>
  );
});

export default StageRewardModal;

