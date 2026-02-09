import React, { memo } from 'react';
import { motion } from 'motion/react';

const GRADIENT = 'linear-gradient(135deg, #ff1cf7, #b249f8, #b249f8)';
const JUMP_HEIGHT = 14;
const DOT_SIZE = 8;
const CYCLE = 0.4;

interface TypingIndicatorProps {
  avatarUrl?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = memo(({ avatarUrl }) => (
  <div className="message-container flex items-start mb-6">
    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mr-2 overflow-hidden">
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <i className="fas fa-mask text-xs"></i>
      )}
    </div>
    <div className="rounded-xl rounded-tl-none px-4 py-3">
      <div className="flex items-center gap-1.5" style={{ height: DOT_SIZE + JUMP_HEIGHT }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full origin-bottom shrink-0"
            style={{
              width: DOT_SIZE,
              height: DOT_SIZE,
              background: GRADIENT,
              boxShadow: '0 0 8px #b249f8',
            }}
            animate={{
              y: [0, -JUMP_HEIGHT, 0],
              scale: [1, 1.6, 1],
            }}
            transition={{
              duration: CYCLE * 3,
              repeat: Infinity,
              ease: [0.33, 1, 0.68, 1],
              delay: i * CYCLE,
            }}
          />
        ))}
      </div>
    </div>
  </div>
));

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;

