import React from 'react';
import { observer } from 'mobx-react-lite';
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
      title={title}
      description={description}
      headerIcon={<i className={`fa-solid ${iconClass} text-2xl`}></i>}
      headerIconContainerClassName={`bg-gradient-to-br ${bgGradient} shadow-lg`}
      closeAriaLabel={t('close')}
      footer={
        <Button
          onClick={onClose}
          variant="default"
          size="lg"
          className="w-full"
          icon="fas fa-check"
        >
          {t('close')}
        </Button>
      }
    >
      {status ? (
        <></>
      ) : null}
    </Modal>
  );
});

export default WithdrawalResultModal;