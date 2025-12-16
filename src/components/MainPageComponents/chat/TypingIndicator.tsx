import React, { memo } from 'react';

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
    <div className="bg-primary-800 rounded-xl rounded-tl-none px-4 py-3">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
));

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;

