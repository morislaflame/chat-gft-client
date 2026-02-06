import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';

import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
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
  const title = box ? ((language === 'en' ? (box.nameEn || box.name) : box.name) || box.name) : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={true}
      title={t('purchaseSuccessful')}
      headerIcon={<i className="fas fa-gift text-white text-2xl"></i>}
      headerIconContainerClassName="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg"
      closeAriaLabel={t('close')}
      footer={
        box ? (
          <Button
            onClick={() => onGoToCase(box)}
            variant="gradient"
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
      ) : null}
    </Modal>
  );
});

export default CasePurchaseModal;

