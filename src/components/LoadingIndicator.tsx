import React from 'react';

const LoadingIndicator: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-full w-full">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-sm text-gray-400">Loading...</div>
            </div>
        </div>
    );
};

export default LoadingIndicator;