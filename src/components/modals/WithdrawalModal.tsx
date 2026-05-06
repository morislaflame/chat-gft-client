import React, { useContext, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import type { UserReward } from '@/http/rewardAPI';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';
import { useAnimationLoader } from '@/utils/useAnimationLoader';
import { Context, type IStoreContext } from '@/store/context';

const STORY_DELAY_MS = 7000;

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
  const { user } = useContext(Context) as IStoreContext;
  const [step, setStep] = useState<'share' | 'withdraw'>('share');
  const [isSharing, setIsSharing] = useState(false);

  const reward = userReward?.reward ?? null;
  const previewUrl = reward?.preview?.url ?? null;
  const ref = user.user?.refCode || user.user?.username || '';
  const referralLink = `https://t.me/gftrobot?startapp=${ref}`;

  const [animations] = useAnimationLoader(
    reward ? [reward] : [],
    (r) => r.mediaFile ?? null,
    [reward?.id ?? 0]
  );

  useEffect(() => {
    if (isOpen) {
      setStep('share');
      setIsSharing(false);
    }
  }, [isOpen]);

  const handleShareToStory = async () => {
    const tg = window.Telegram?.WebApp;
    if (!tg || typeof tg.shareToStory !== 'function' || !previewUrl) return;
    setIsSharing(true);
    try {
      const storyText = reward?.name
        ? `${reward.name} from ChatGFT 💎\n${t('join')}`
        : t('join');
      tg.shareToStory(previewUrl, {
        text: storyText,
        widget_link: {
          url: referralLink,
          name: t('lookWhatIWon'),
        },
      });
      await new Promise<void>((resolve) => setTimeout(resolve, STORY_DELAY_MS));
      setStep('withdraw');
    } finally {
      setIsSharing(false);
    }
  };

  const showShareStep = Boolean(previewUrl) && step === 'share';
  const showWithdrawStep = !previewUrl || step === 'withdraw';
  const primaryLoading = isSharing || loading;
  const primaryDisabled = primaryLoading;

  const description = t('withdrawalInfo');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={!primaryLoading}
      swipeToClose={!primaryLoading}
      closeDisabled={primaryLoading}
      title={t('withdrawalRequest')}
      description={description}
      closeAriaLabel={t('close')}
      footerClassName="flex-row gap-3"
      footer={
        <>
          <Button
            onClick={onClose}
            disabled={primaryLoading}
            variant="default"
            size="lg"
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          {showShareStep ? (
            <Button
              onClick={handleShareToStory}
              disabled={primaryDisabled}
              variant="secondary"
              size="lg"
              className="flex-1"
              icon={isSharing ? 'fas fa-spinner fa-spin' : 'fas fa-share'}
            >
              {isSharing ? t('sending') : t('shareToStory')}
            </Button>
          ) : showWithdrawStep ? (
            <Button
              onClick={onConfirm}
              disabled={primaryDisabled}
              variant="secondary"
              size="lg"
              className="flex-1"
              icon={loading ? 'fas fa-spinner fa-spin' : 'fas fa-check'}
            >
              {loading ? t('sending') : t('withdraw')}
            </Button>
          ) : null}
        </>
      }
    >
      {userReward ? (
        <>
          {/* Reward Info */}
          <div className="rounded-lg px-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                delay: 0.1,
                bounce: 0.4
              }}
              className="flex justify-center"
            >
              {reward?.mediaFile ? (
                <div className="w-48 h-48 flex items-center justify-center">
                  <LazyMediaRenderer
                    mediaFile={reward.mediaFile}
                    animations={animations}
                    name={reward.name}
                    className="w-48 h-48 object-contain"
                    loop={false}
                    loadOnIntersect={false}
                    autoplay={true}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-gift text-white text-3xl" />
                </div>
              )}
            </motion.div>
          <div className="text-center mt-4">
            <div className="text-lg font-semibold text-white mb-1">
              {userReward.reward.name}
            </div>
            {showShareStep ? (
              <p className="text-sm text-gray-400">
                {t('withdrawalStoryHint')}
              </p>
            ) : null}
          </div>
          </div>

        </>
      ) : null}
    </Modal>
  );
});

export default WithdrawalModal;

