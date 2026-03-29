import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';

const ArtifactAcquireModal: React.FC = observer(() => {
  const { chat } = useContext(Context) as IStoreContext;
  const { t, language } = useTranslate();
  const { hapticImpact, hapticNotification } = useHapticFeedback();

  const action = chat.artifactAction;
  const isOpen = Boolean(action?.action === 'ACQUIRE');

  const name = action?.artifact_name?.trim() || action?.artifact_code || '';

  const descriptionRaw =
    language === 'en'
      ? action?.artifact_description_en || action?.artifact_description
      : action?.artifact_description || action?.artifact_description_en;
  const description =
    (descriptionRaw && String(descriptionRaw).trim()) || t('artifactNoDescription');

  const handleClose = () => {
    hapticImpact('soft');
    chat.closeArtifactAcquireModal();
  };

  const handleContinue = () => {
    hapticNotification('success');
    chat.closeArtifactAcquireModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeAriaLabel={t('close')}
      title={t('artifactAcquiredTitle')}
      description={
        <span className="text-zinc-300">
          {name ? <span className="font-semibold text-white block mb-1">{name}</span> : null}
        </span>
      }
      headerIcon={<i className="fa-solid fa-wand-magic-sparkles text-yellow-400 text-2xl" />}
      headerIconContainerClassName="bg-yellow-500/15 border border-yellow-500/35"
      footer={
        <Button
          onClick={handleContinue}
          variant="gradient"
          size="lg"
          className="w-full"
          icon="fas fa-check"
        >
          {t('artifactAcquiredContinue')}
        </Button>
      }
      contentClassName="pt-2"
    >
      {action?.media?.url ? (
        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 aspect-square max-h-[min(52vh,320px)] mx-auto flex items-center justify-center">
          <img
            src={action.media.url}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      ) : null}
      <p className="text-zinc-400 text-sm leading-relaxed text-center mt-3">{description}</p>
    </Modal>
  );
});

export default ArtifactAcquireModal;
