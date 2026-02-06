import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';

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
      ? 'fa-gem text-secondary-gradient'
      : 'fa-bolt text-user-message-gradient';

  const headerIcon = isReward ? (
    <i className="fa-solid fa-gift text-white text-2xl" />
  ) : isGems ? (
    <i className="fa-solid fa-gem text-white text-2xl" />
  ) : (
    <i className="fa-solid fa-bolt text-white text-2xl" />
  );

  const headerIconContainerClassName = isReward
    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg'
    : isGems
      ? 'bg-secondary-gradient border border-amber-500/30 shadow-lg'
      : 'bg-user-message border border-purple-500/30 shadow-lg';


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
      title={title}
      description={description}
      headerIcon={headerIcon}
      headerIconContainerClassName={headerIconContainerClassName}
      closeAriaLabel={t('close')}
      footer={
        openResult && result ? (
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
            {isReward ? (
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
      {openResult && result ? (
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
                <i className={`fa-solid ${iconClass} text-8xl`} />
              </div>
              <div className="text-white font-semibold text-lg text-center">
                {amountLabel}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
});

export default CaseOpenResultModal;

