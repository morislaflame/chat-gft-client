import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';

import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import type { OpenCaseResponse } from '@/http/caseAPI';
import LazyMediaRenderer from '@/utils/lazy-media-renderer';
import { Context, type IStoreContext } from '@/store/StoreProvider';

interface CaseOpenResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  openResult: OpenCaseResponse | null;
  animations: { [url: string]: Record<string, unknown> };
}

const CaseOpenResultModal: React.FC<CaseOpenResultModalProps> = observer(({
  isOpen,
  onClose,
  openResult,
  animations,
}) => {
  const { t } = useTranslate();
  const { user } = useContext(Context) as IStoreContext;
  const [isSharing, setIsSharing] = useState(false);

  const result = openResult?.result;

  const isReward = result?.type === 'reward';
  const isGems = result?.type === 'gems';

  const iconClass = isReward
    ? 'fa-gift text-white'
    : isGems
      ? 'fa-gem text-amber-400'
      : 'fa-bolt text-purple-400';


  const title = t('congratulations');
  const description = t('youWon');

  const amountLabel = result && !isReward
    ? `+${result.amount} ${t(isGems ? 'gems' : 'energy')}`
    : null;

  const ref = user.user?.refCode || user.user?.username || '';
  const referralLink = `https://t.me/gftrobot?startapp=${ref}`;

  const resolveStoryMediaUrl = async (mediaFile: { url: string; mimeType: string } | undefined) => {
    if (!mediaFile?.url) return null;
    if (mediaFile.mimeType.startsWith('image/')) return mediaFile.url;

    // Lottie JSON: try common “first-frame” thumbnail conventions
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
    if (!isReward || !result) return;

    const mediaUrl = result.reward.preview?.url || (await resolveStoryMediaUrl(result.reward.mediaFile));
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
      className="p-4"
    >
      {openResult && result ? (
      <div className="relative">
        <div className="text-center mb-4">

          <h2 className="text-2xl font-bold text-white mb-2">
            {title}
          </h2>
          <p className="text-gray-300 text-sm">
            {description}
          </p>
        </div>

        <div className="flex justify-center mb-6">
          {isReward ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 flex items-center justify-center">
                <LazyMediaRenderer
                  mediaFile={result.reward.mediaFile}
                  imageUrl={result.reward.mediaFile?.mimeType !== 'application/json' ? result.reward.mediaFile?.url : undefined}
                  animations={animations}
                  name={result.reward.name}
                  className="w-28 h-28 object-contain"
                  loop={false}
                  loadOnIntersect={false}
                />
              </div>
              <div className="text-white font-semibold text-lg text-center">
                {result.reward.name}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className=" flex items-center justify-center">
                <i className={`fa-solid ${iconClass} text-5xl`} />
              </div>
              <div className="text-white font-semibold text-lg text-center">
                {amountLabel}
              </div>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={onClose}
            variant="secondary"
            size="default"
            className="w-full"
            icon="fas fa-check"
          >
            {t('close')}
          </Button>
          {isReward ? (
            <Button
              onClick={handleShareToStory}
              variant="gradient"
              size="default"
              className="w-full mt-2"
              icon="fas fa-share"
              disabled={isSharing}
            >
              {t('shareToStory')}
            </Button>
          ) : null}
        </motion.div>
      </div>
      ) : null}
    </Modal>
  );
});

export default CaseOpenResultModal;

