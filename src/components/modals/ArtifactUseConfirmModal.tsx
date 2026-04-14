import React from 'react';
import { observer } from 'mobx-react-lite';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

const PAYABLE_GEMS_COST = 5;

export type ArtifactUseConfirmModalProps = {
  isOpen: boolean;
  suggestionText: string;
  willPayGems: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ArtifactUseConfirmModal: React.FC<ArtifactUseConfirmModalProps> = observer(
  ({ isOpen, suggestionText, willPayGems, onClose, onConfirm }) => {
    const { t } = useTranslate();
    const { hapticImpact } = useHapticFeedback();

    const handleClose = () => {
      hapticImpact('soft');
      onClose();
    };

    const handleConfirm = () => {
      hapticImpact('soft');
      onConfirm();
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        closeAriaLabel={t('close')}
        title={t('artifactUseConfirmTitle')}
        description={t('artifactUseConfirmDescription')}
        headerIcon={<i className="fa-solid fa-wand-magic-sparkles text-yellow-400 text-2xl" />}
        headerIconContainerClassName="bg-yellow-500/15 border border-yellow-500/35"
        footer={
          <div className="flex flex-col gap-2 w-full">
            {willPayGems ? (
              <p className="text-center text-sm text-zinc-400 flex items-center justify-center gap-1">
                {t('artifactUseConfirmPayNote')}{' '}
                <span className="font-semibold text-secondary-gradient inline-flex items-center gap-1">
                  {PAYABLE_GEMS_COST}
                  <i className="fa-solid fa-gem text-secondary-gradient text-sm" />
                </span>
                
              </p>
            ) : null}
            <div className="flex gap-2 w-full">
              <Button onClick={handleClose} variant="outline" size="lg" className="flex-1">
                {t('cancel')}
              </Button>
              <Button
                onClick={handleConfirm}
                variant="gradient"
                size="lg"
                className="flex-1"
                icon="fas fa-paper-plane"
              >
                {t('artifactUseConfirmAction')}
              </Button>
            </div>
          </div>
        }
      />
    );
  }
);

export default ArtifactUseConfirmModal;
