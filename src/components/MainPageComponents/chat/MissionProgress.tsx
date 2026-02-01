import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { motion, AnimatePresence } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

const MissionProgressBase: React.FC = () => {
  const { chat } = React.useContext(Context) as IStoreContext;
  const { t, language } = useTranslate();
  const { hapticImpact } = useHapticFeedback();
  const [isExpanded, setIsExpanded] = useState(false);

  const progressPercent = chat.forceProgress;
  const missionText = chat.mission;
  const currentStage = chat.currentStage;

  const missionMeta = chat.missions.find((m) => m.orderIndex === currentStage) || null;
  const missionTitle = missionMeta
    ? (language === 'en' ? (missionMeta.titleEn || missionMeta.title) : missionMeta.title)
    : null;
  const missionDescription = missionMeta
    ? (language === 'en' ? (missionMeta.descriptionEn || missionMeta.description) : missionMeta.description)
    : null;

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
              {(missionTitle || missionText) && (
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
            {(missionTitle || missionText) && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-4 bg-primary-800 p-2 rounded-lg">
                  {missionTitle ? (
                    <div className="flex items-start gap-2 mb-1">
                      {/* <span className="text-xs text-gray-100">{t('mission')}:</span> */}
                      <span className="flex-1 text-md text-gray-200">{missionTitle}</span>
                    </div>
                  ) : null}

                  {missionDescription ? (
                    <div className="flex items-start gap-2 mt-1">
                      {/* <span className="text-xs text-gray-100">{t('mission')}:</span> */}
                      <span className="flex-1 text-xs text-gray-400">{missionDescription}</span>
                    </div>
                  ) : null}

                  {/* Fallback to the dynamic mission text from LLM service (if any) */}
                  {missionText && !missionDescription ? (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-gray-100">{t('mission')}:</span>
                      <span className="flex-1 text-xs text-gray-400">{missionText}</span>
                    </div>
                  ) : null}
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

