import React from 'react';

type RewardsHeaderProps = {
    activeTab: 'available' | 'purchased';
    onChange: (tab: 'available' | 'purchased') => void;
    title: string;
    availableLabel: string;
    purchasedLabel: string;
};

const RewardsHeader: React.FC<RewardsHeaderProps> = ({
    activeTab,
    onChange,
    title,
    availableLabel,
    purchasedLabel
}) => {
    const isMobile = document.body.classList.contains('telegram-mobile');
    return (
        <div
            className="fixed inset-x-4 flex items-center justify-between z-100"
            style={{ marginTop: isMobile ? '136px' : '36px' }}
        >
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <div className="flex bg-primary-800 rounded-lg p-1">
                <button
                    onClick={() => onChange('available')}
                    className={`px-3 py-1 text-sm rounded-md transition cursor-pointer ${
                        activeTab === 'available'
                            ? 'bg-secondary-500 text-white'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {availableLabel}
                </button>
                <button
                    onClick={() => onChange('purchased')}
                    className={`px-3 py-1 text-sm rounded-md transition cursor-pointer ${
                        activeTab === 'purchased'
                            ? 'bg-secondary-500 text-white'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {purchasedLabel}
                </button>
            </div>
        </div>
    );
};

export default RewardsHeader;
