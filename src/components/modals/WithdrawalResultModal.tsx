import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';

interface WithdrawalResultModalProps {
  isOpen: boolean;
  status: 'success' | 'error' | null;
  message?: string;
  onClose: () => void;
}

const WithdrawalResultModal: React.FC<WithdrawalResultModalProps> = observer(({
  isOpen,
  status,
  message,
  onClose
}) => {
  const { t } = useTranslate();

  const isSuccess = status === 'success';
  const title = status ? (isSuccess ? t('withdrawalSuccessTitle') : t('withdrawalErrorTitle')) : '';
  const description = status ? (isSuccess ? t('withdrawalSuccessDesc') : (message || t('withdrawalErrorDesc'))) : '';
  const iconClass = status ? (isSuccess ? 'fa-circle-check text-green-400' : 'fa-circle-xmark text-red-400') : '';
  const bgGradient = status ? (isSuccess ? 'from-green-500 to-emerald-600' : 'from-red-500 to-red-700') : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={true}
      className="p-4"
    >
      {status ? (
      <div className="relative">
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1, bounce: 0.4 }}
            className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center shadow-lg`}
          >
            <i className={`fa-solid ${iconClass} text-4xl`}></i>
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {title}
          </h2>
          <p className="text-gray-300 text-sm">
            {description}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={onClose}
            variant="default"
            size="lg"
            className="w-full"
            icon="fas fa-check"
          >
            {t('close')}
          </Button>
        </motion.div>
      </div>
      ) : null}
    </Modal>
  );
});

export default WithdrawalResultModal;