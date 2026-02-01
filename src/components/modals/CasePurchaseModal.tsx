import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';

import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/CoreComponents/Button';
import { useTranslate } from '@/utils/useTranslate';
import type { CaseBox } from '@/http/caseAPI';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';

type CasePurchaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  box: CaseBox | null;
  animations: { [url: string]: Record<string, unknown> };
  onGoToCase: (box: CaseBox) => void;
};

const CasePurchaseModal: React.FC<CasePurchaseModalProps> = observer(({
  isOpen,
  onClose,
  box,
  animations,
  onGoToCase,
}) => {
  const { t, language } = useTranslate();

  if (!box) return null;
  const title = (language === 'en' ? (box.nameEn || box.name) : box.name) || box.name;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={true}
      className="p-4"
    >
      <div className="relative">
        {/* Header */}
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              delay: 0.1,
              bounce: 0.4,
            }}
            className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg"
          >
            <i className="fas fa-gift text-white text-4xl"></i>
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {t('purchaseSuccessful')}
          </h2>
        </div>

        {/* Case Media */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary-700/50 rounded-lg p-4 mb-4 border border-primary-600"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              delay: 0.15,
              bounce: 0.4,
            }}
            className="flex justify-center mb-3"
          >
            <div className="w-28 h-28 flex items-center justify-center">
              <LazyMediaRenderer
                mediaFile={box.mediaFile}
                animations={animations}
                name={title}
                className="w-28 h-28 object-contain"
                loop={false}
                loadOnIntersect={false}
              />
            </div>
          </motion.div>

          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-1">
              {title}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col gap-2"
        >
          <Button
            onClick={() => onGoToCase(box)}
            variant="secondary"
            size="md"
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

export default CasePurchaseModal;

