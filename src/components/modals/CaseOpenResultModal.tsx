import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';

import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/CoreComponents/Button';
import { useTranslate } from '@/utils/useTranslate';
import type { OpenCaseResponse } from '@/http/caseAPI';
import LazyMediaRenderer from '@/utils/lazy-media-renderer';

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

  if (!openResult) return null;

  const result = openResult.result;

  const isReward = result.type === 'reward';
  const isGems = result.type === 'gems';

  const iconClass = isReward
    ? 'fa-gift text-white'
    : isGems
      ? 'fa-gem text-amber-400'
      : 'fa-bolt text-purple-400';


  const title = t('congratulations');
  const description = t('youWon');

  const amountLabel = !isReward
    ? `+${result.amount} ${t(isGems ? 'gems' : 'energy')}`
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={true}
      className="p-4"
    >
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
            size="md"
            className="w-full"
            icon="fas fa-check"
          >
            {t('close')}
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
});

export default CaseOpenResultModal;

