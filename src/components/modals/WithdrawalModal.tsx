import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import type { UserReward } from '@/http/rewardAPI';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';
import { useAnimationLoader } from '@/utils/useAnimationLoader';

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

  const reward = userReward?.reward ?? null;
  const [animations] = useAnimationLoader(
    reward ? [reward] : [],
    (r) => r.mediaFile ?? null,
    [reward?.id ?? 0]
  );

  const description = t('withdrawalInfo')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={!loading}
      swipeToClose={!loading}
      closeDisabled={loading}
      title={t('withdrawalRequest')}
      description={description}
      closeAriaLabel={t('close')}
      footerClassName="flex-row gap-3"
      footer={
        <>
          <Button
            onClick={onClose}
            disabled={loading}
            variant="default"
            size="lg"
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            variant="secondary"
            size="lg"
            className="flex-1"
            icon={loading ? 'fas fa-spinner fa-spin' : 'fas fa-check'}
          >
            {loading ? t('sending') : t('confirm')}
          </Button>
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
            </div>
          </div>

        </>
      ) : null}
    </Modal>
  );
});

export default WithdrawalModal;

