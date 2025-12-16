import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { motion, AnimatePresence } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

const MissionProgressBase: React.FC = () => {
  const { chat } = React.useContext(Context) as IStoreContext;
  const { t } = useTranslate();
  const { hapticImpact } = useHapticFeedback();
  const [isExpanded, setIsExpanded] = useState(false);

  const progressPercent = chat.forceProgress;
  const mission = chat.mission;
  const currentStage = chat.currentStage;

  const handleToggle = () => {
    hapticImpact('soft');
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex justify-end text-xs mb-2">
            <div
              className="flex items-center gap-2 cursor-pointer backdrop-blur-sm rounded-full p-2"
              onClick={handleToggle}
            >
              <span className="text-amber-400 font-medium flex items-center">
                <i className="fas fa-gift mr-1"></i>
                {t('mission')} {currentStage}
              </span>
              {mission && (
                <button
                  className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  aria-label="Toggle mission"
                >
                  <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 h-3 bg-primary-700 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-600 persuasion-bar"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Current Mission - Collapsible */}
          <AnimatePresence>
            {mission && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-4 bg-primary-800 p-2 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-100">{t('mission')}:</span>
                    <span className="flex-1 text-xs text-gray-400">{mission}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const MissionProgress = observer(MissionProgressBase);

export default MissionProgress;

