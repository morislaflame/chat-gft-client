import React from 'react';
import { observer } from 'mobx-react-lite';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

export type ArtifactUnavailableModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ArtifactUnavailableModal: React.FC<ArtifactUnavailableModalProps> = observer(
  ({ isOpen, onClose }) => {
    const { t } = useTranslate();
    const { hapticImpact } = useHapticFeedback();

    const handleClose = () => {
      hapticImpact('soft');
      onClose();
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        closeAriaLabel={t('close')}
        title={t('artifactMissingTitle')}
        description={
          <span className="text-zinc-300">{t('artifactMissingDescription')}</span>
        }
        headerIcon={<i className="fa-solid fa-map-location-dot text-yellow-400 text-2xl" />}
        headerIconContainerClassName="bg-yellow-500/15 border border-yellow-500/35"
        footer={
          <Button onClick={handleClose} variant="gradient" size="lg" className="w-full">
            {t('gotIt')}
          </Button>
        }
      >
        <div className="text-zinc-400 text-sm leading-relaxed space-y-2 list-disc pl-5">
          <p>- {t('artifactMissingHintLine1')}</p>
          <p>- {t('artifactMissingHintLine2')}</p>
          <p>- {t('artifactMissingHintLine3')}</p>
        </div>
      </Modal>
    );
  }
);

export default ArtifactUnavailableModal;
