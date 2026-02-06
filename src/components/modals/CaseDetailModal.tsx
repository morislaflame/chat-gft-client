import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';

import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import type { CaseBox } from '@/http/caseAPI';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';

type CaseDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  box: CaseBox | null;
  animations: { [url: string]: Record<string, unknown> };
  onGoToCase: (box: CaseBox) => void;
};

const CaseDetailModal: React.FC<CaseDetailModalProps> = observer(({
  isOpen,
  onClose,
  box,
  animations,
  onGoToCase,
}) => {
  const { t, language } = useTranslate();
  const { hapticImpact } = useHapticFeedback();

  const handleClose = () => {
    hapticImpact('soft');
    onClose();
  };

  const handleGoToCase = () => {
    hapticImpact('soft');
    if (box) onGoToCase(box);
  };

  const title = box ? ((language === 'en' ? (box.nameEn || box.name) : box.name) || box.name) : '';
  const description = box
    ? (((language === 'en' ? (box.descriptionEn || box.description) : box.description) ?? null) || null)
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={true}
      title={title}
      description={description}
      // headerIcon={<i className="fa-solid fa-box text-white text-2xl"></i>}
      headerIconContainerClassName="btn-secondary-gradient-border"
      closeAriaLabel={t('close')}
      footer={
        box ? (
          <Button
            onClick={handleGoToCase}
            variant="secondary"
            size="lg"
            className="w-full"
            icon="fas fa-arrow-right"
          >
            {t('open')}
          </Button>
        ) : null
      }
    >
      {box ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            delay: 0.1,
            bounce: 0.4,
          }}
          className="flex justify-center"
        >
          <div className="w-46 h-46 flex items-center justify-center">
            <LazyMediaRenderer
              mediaFile={box.mediaFile}
              animations={animations}
              name={title}
              className="w-46 h-46 object-contain"
              loop={false}
              loadOnIntersect={false}
            />
          </div>
        </motion.div>
      ) : null}
    </Modal>
  );
});

export default CaseDetailModal;

