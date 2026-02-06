import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import type { Reward } from '@/http/rewardAPI';
import { renderRewardMedia } from '@/utils/rewardUtils';
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
  const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Загружаем анимацию при изменении reward
  useEffect(() => {
    if (!reward?.mediaFile) {
      setAnimationData(null);
      return;
    }

    const mediaFile = reward.mediaFile;
    if (mediaFile.mimeType === 'application/json') {
      fetch(mediaFile.url)
        .then(response => response.json())
        .then(data => setAnimationData(data))
        .catch(error => {
          console.error('Error loading animation:', error);
          setAnimationData(null);
        });
    } else {
      setAnimationData(null);
    }
  }, [reward]);

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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary-700/50 rounded-lg p-4 border border-primary-600"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: 'spring',
              delay: 0.15,
              bounce: 0.4
            }}
          >
            {renderRewardMedia({
              reward: reward,
              animationData: animationData,
              size: 'md',
              containerClassName: 'mx-auto'
            })}
          </motion.div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-1">
              {reward.name}
            </div>
            {reward.description && (
              <div className="text-sm text-gray-300 mb-2">
                {reward.description}
              </div>
            )}
          </div>
        </motion.div>

      ) : null}
    </Modal>
  );
});

export default RewardPurchaseModal;
