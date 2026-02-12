import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import type { Reward } from '@/http/rewardAPI';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';
import { useAnimationLoader } from '@/utils/useAnimationLoader';
import { Context, type IStoreContext } from '@/store/StoreProvider';

interface RewardPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward | null;
  pricePaid?: number;
}

const RewardPurchaseModal: React.FC<RewardPurchaseModalProps> = observer(({
  isOpen,
  onClose,
  reward,
}) => {
  const { t } = useTranslate();
  const { user } = useContext(Context) as IStoreContext;
  const [isSharing, setIsSharing] = useState(false);

  const [animations] = useAnimationLoader(
    reward ? [reward] : [],
    (r) => r.mediaFile ?? null,
    [reward?.id ?? 0]
  );

  const ref = user.user?.refCode || user.user?.username || '';
  const referralLink = `https://t.me/gftrobot?startapp=${ref}`;

  const resolveStoryMediaUrl = async (mediaFile: { url: string; mimeType: string } | undefined) => {
    if (!mediaFile?.url) return null;
    if (mediaFile.mimeType.startsWith('image/')) return mediaFile.url;

    if (mediaFile.mimeType === 'application/json') {
      const base = mediaFile.url;
      const candidates = [
        base.replace(/\.json(\?.*)?$/i, '.png$1'),
        base.replace(/\.json(\?.*)?$/i, '.webp$1'),
        base.replace(/\.json(\?.*)?$/i, '.jpg$1'),
        base.replace(/\.json(\?.*)?$/i, '.jpeg$1'),
      ];

      const canLoad = (src: string) =>
        new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = src;
        });

      for (const c of candidates) {
        if (await canLoad(c)) return c;
      }
    }

    return null;
  };

  const handleShareToStory = async () => {
    const tg = window.Telegram?.WebApp;
    if (!tg || typeof tg.shareToStory !== 'function') return;
    if (!reward?.mediaFile) return;

    const mediaUrl = reward.preview?.url || (await resolveStoryMediaUrl(reward.mediaFile));
    if (!mediaUrl) return;

    setIsSharing(true);
    try {
      tg.shareToStory(mediaUrl, {
        text: t('join'),
        widget_link: {
          url: referralLink,
          name: t('lookWhatIWon'),
        },
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={true}
      title={t('purchaseSuccessful')}
      headerIcon={<i className="fa-solid fa-gift text-white text-2xl"></i>}
      headerIconContainerClassName="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg"
      closeAriaLabel={t('close')}
      footer={
        reward ? (
          <>
            <Button
              onClick={onClose}
              variant="default"
              size="lg"
              className="w-full"
              icon="fas fa-check"
            >
              {t('great')}
            </Button>
            {reward.mediaFile ? (
              <Button
                onClick={handleShareToStory}
                variant="gradient"
                size="lg"
                className="w-full"
                icon="fas fa-share"
                disabled={isSharing}
              >
                {t('shareToStory')}
              </Button>
            ) : null}
          </>
        ) : null
      }
    >
      {reward ? (
        <div className="px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              delay: 0.15,
              bounce: 0.4
            }}
            className="flex justify-center"
          >
            {reward.mediaFile ? (
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
            <div className="text-lg font-semibold text-white">
              {reward.name}
            </div>
          </div>
        </div>

      ) : null}
    </Modal>
  );
});

export default RewardPurchaseModal;
