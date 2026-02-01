import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import type { DailyReward } from '@/http/dailyRewardAPI';
import { useTranslate } from '@/utils/useTranslate';

interface DailyRewardProgressProps {
  dailyRewardDay: number;
  lastDailyRewardClaimAt: string | null;
  allRewards: DailyReward[];
  onDayClick: (day: number, reward: DailyReward | null) => void;
}

const DailyRewardProgress: React.FC<DailyRewardProgressProps> = observer(({
  dailyRewardDay,
  lastDailyRewardClaimAt,
  allRewards,
  onDayClick
}) => {
  const { t } = useTranslate();
  // Определяем, какие дни собраны
  const isDayClaimed = (day: number): boolean => {
    if (!lastDailyRewardClaimAt) return false;
    
    // Если день меньше или равен текущему дню награды, значит он собран
    return day <= dailyRewardDay;
  };

  // Получаем награду для дня
  const getRewardForDay = (day: number): DailyReward | null => {
    return allRewards.find(r => r.day === day) || null;
  };

  return (
    <div className="bg-primary-800 border border-primary-700 rounded-xl px-4 pt-2 pb-4">
        <div className='flex flex-col gap-1 mb-4'>
            <h3 className="text-sm font-semibold text-white">
                {t('dailyRewards')}
            </h3>
            <p className='text-xs text-gray-400'>
                {t('dailyRewardsDesc')}
            </p>
        </div>
      <div className="flex items-center justify-between relative">
        {/* Линия между кружочками */}
        <div className="absolute top-1/2 left-5 right-5 h-0.5 bg-primary-600 -translate-y-1/2 z-0" />
        
        {/* Кружочки для каждого дня */}
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const isClaimed = isDayClaimed(day);
          const reward = getRewardForDay(day);
          const isFirst = day === 1;
          const bounceAnimation = isFirst ? { y: [0, -20, 0, -6, 0] } : undefined;
          const bounceTransition = isFirst ? { duration: 1, repeat: Infinity, repeatDelay: 2 } : undefined;
          
          return (
            <motion.button
              key={day}
              onClick={() => onDayClick(day, reward)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={bounceAnimation}
              transition={bounceTransition}
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isClaimed
                  ? 'bg-green-500 border-2 border-green-400'
                  : 'bg-primary-600 border-2 border-primary-500'
              }`}
            >
              {isClaimed ? (
                <i className="fas fa-check text-white text-sm"></i>
              ) : (
                <span className="text-xs text-gray-300 font-semibold">{day}</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});

export default DailyRewardProgress;
