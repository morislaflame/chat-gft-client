import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { Context, type IStoreContext } from '@/store/context';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { PROFILE_ROUTE, buildProfileStoryPath } from '@/utils/consts';

export type ArtifactUnavailableModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ArtifactUnavailableModal: React.FC<ArtifactUnavailableModalProps> = observer(
  ({ isOpen, onClose }) => {
    const { user } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();
    const { hapticImpact } = useHapticFeedback();
    const navigate = useNavigate();

    const handleClose = () => {
      hapticImpact('soft');
      onClose();
    };

    const handleOpenStoryProfile = () => {
      hapticImpact('soft');
      onClose();
      const historyName = user.user?.selectedHistoryName?.trim();
      if (historyName) {
        navigate(buildProfileStoryPath(historyName));
      } else {
        navigate(PROFILE_ROUTE);
      }
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        closeAriaLabel={t('close')}
        title={t('artifactMissingTitle')}
        description={t('artifactMissingDescription')}
        footer={
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={handleOpenStoryProfile}
              variant="secondary"
              size="lg"
              className="w-full"
              icon="fa-solid fa-gem"
              iconPosition="right"
            >
              {t('artifactMissingBuyOnProfile')}
            </Button>
            <Button onClick={handleClose} variant="outline" size="lg" className="w-full">
              {t('gotIt')}
            </Button>
          </div>
        }
      >
        <div className="text-zinc-200 text-md leading-relaxed space-y-2 list-disc pl-2">
          <p>- {t('artifactMissingHintLine1')}</p>
          <p>- {t('artifactMissingHintLine2')}</p>
        </div>
      </Modal>
    );
  }
);

export default ArtifactUnavailableModal;
