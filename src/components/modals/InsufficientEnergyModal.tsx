import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import { STORE_ROUTE } from '@/utils/consts';

const InsufficientEnergyModal: React.FC = observer(() => {
  const { chat } = useContext(Context) as IStoreContext;
  const { t } = useTranslate();
  const navigate = useNavigate();
  const isOpen = chat.insufficientEnergy;

  const handleClose = () => {
    chat.closeInsufficientEnergy();
  };

  const handleGoToStore = () => {
    chat.closeInsufficientEnergy();
    navigate(STORE_ROUTE);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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
              delay: 0.2,
              bounce: 0.4
            }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg"
          >
            <i className="fa-solid fa-bolt text-white text-4xl"></i>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('insufficientEnergy')}
          </h2>
          <p className="text-gray-400 text-sm">
            {t('insufficientEnergyDesc')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={handleGoToStore}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden cursor-pointer"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <i className="fa-solid fa-store text-white"></i>
              {t('goToStore')}
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleClose}
            className="w-full bg-primary-700 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            {t('cancel')}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
});

export default InsufficientEnergyModal;

