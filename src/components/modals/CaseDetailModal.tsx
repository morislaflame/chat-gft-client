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

  if (!box) return null;

  const title = (language === 'en' ? (box.nameEn || box.name) : box.name) || box.name;
  const description =
    ((language === 'en' ? (box.descriptionEn || box.description) : box.description) ?? null) ||
    null;

  const handleClose = () => {
    hapticImpact('soft');
    onClose();
  };

  const handleGoToCase = () => {
    hapticImpact('soft');
    onGoToCase(box);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={true}
      className="p-6"
    >
      <div className="relative">
        {/* Close button */}
        <Button
          onClick={handleClose}
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 w-8 h-8 min-w-8"
          aria-label="Close"
          icon="fas fa-times"
        />

        {/* Case Media */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            delay: 0.1,
            bounce: 0.4,
          }}
          className="flex justify-center mb-6"
        >
          <div className="w-36 h-36 flex items-center justify-center">
            <LazyMediaRenderer
              mediaFile={box.mediaFile}
              animations={animations}
              name={title}
              className="w-36 h-36 object-contain"
              loop={false}
              loadOnIntersect={false}
            />
          </div>
        </motion.div>

        {/* Case Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-4"
        >
          <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>

          {description && (
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">{description}</p>
          )}

        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleGoToCase}
            variant="secondary"
            size="lg"
            className="w-full"
            icon="fas fa-arrow-right"
          >
            {t('open')}
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
});

export default CaseDetailModal;

