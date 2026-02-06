import React from 'react';
import { motion } from 'motion/react';
import { observer } from 'mobx-react-lite';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import { getTaskText } from '@/utils/translations';
import type { Task } from '@/types/types';

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  reward?: {
    amount: number;
    type: 'energy' | 'tokens';
  };
}

const TaskCompletionModal: React.FC<TaskCompletionModalProps> = observer(({
  isOpen,
  onClose,
  task,
  reward
}) => {
  const { t, language } = useTranslate();

  const isEnergy = task ? (reward?.type === 'energy' || task.rewardType === 'energy') : false;
  const rewardAmount = task ? (reward?.amount || task.reward) : 0;

  const getTaskIcon = (code: string) => {
    switch (code) {
      case 'DAILY_LOGIN':
        return 'fas fa-calendar-day';
      case 'TELEGRAM_SUB':
        return 'fas fa-bullhorn';
      case 'REF_USERS':
        return 'fas fa-user-friends';
      case 'CHAT_BOOST':
        return 'fas fa-rocket';
      case 'STORY_SHARE':
        return 'fas fa-share';
      default:
        return 'fas fa-star';
    }
  };

  const getTaskGradient = (type: string) => {
    switch (type) {
      case 'DAILY':
        return 'from-amber-500 to-orange-600';
      case 'ONE_TIME':
        return 'from-blue-500 to-indigo-600';
      case 'SPECIAL':
        return 'from-emerald-500 to-teal-600';
      default:
        return 'from-purple-500 to-violet-600';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={true}
      className="p-4"
    >
      {task ? (
      <div className="relative">
        {/* Header */}
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: 'spring',
              delay: 0.1,
              bounce: 0.4
            }}
            className={`w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br ${getTaskGradient(task.type)} flex items-center justify-center shadow-lg`}
          >
            <i className={`${getTaskIcon(task.code)} text-white text-4xl`}></i>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('taskCompleted')}
          </h2>
          <p className="text-gray-400 text-sm">
            {getTaskText(task, language)}
          </p>
        </div>

        {/* Reward Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary-700/50 rounded-lg p-4 mb-4 border border-primary-600"
        >
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">{t('taskRewardReceived')}</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-white">
                +{rewardAmount}
              </span>
              <i className={`fa-solid ${isEnergy ? 'fa-bolt text-user-message-gradient' : 'fa-gem text-secondary-gradient'} text-2xl`}></i>
            </div>
          </div>
        </motion.div>

        {/* Close Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={onClose}
            variant="gradient"
            size="default"
            className="w-full"
            icon="fas fa-check"
          >
            {t('great')}
          </Button>
        </motion.div>
      </div>
      ) : null}
    </Modal>
  );
});

export default TaskCompletionModal;
