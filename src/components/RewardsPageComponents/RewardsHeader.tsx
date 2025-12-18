import React from 'react';
import { AnimatedBackground } from '@/components/ui/animated-background';

type RewardsHeaderProps = {
    activeTab: 'available' | 'purchased' | 'boxes';
    onChange: (tab: 'available' | 'purchased' | 'boxes') => void;
    availableLabel: string;
    purchasedLabel: string;
    boxesLabel: string;
    title?: string;
};

const RewardsHeader: React.FC<RewardsHeaderProps> = ({
    activeTab,
    onChange,
    availableLabel,
    purchasedLabel,
    boxesLabel
}) => {
    const isMobile = document.body.classList.contains('telegram-mobile');
    const tabs = [
        { key: 'available', label: availableLabel },
        { key: 'boxes', label: boxesLabel },
        { key: 'purchased', label: purchasedLabel },
    ] as const;

    return (
        <div
            className="fixed inset-x-4 flex items-center justify-between z-100"
            style={{ marginTop: isMobile ? '142px' : '42px' }}
        >
            <div className="rounded-lg bg-primary-900 p-[2px] w-full">
                <AnimatedBackground
                    defaultValue={activeTab}
                    onValueChange={(val) => {
                        if (val) onChange(val as RewardsHeaderProps['activeTab']);
                    }}
                    className="rounded-md bg-secondary-500"
                    transition={{ ease: 'easeInOut', duration: 0.2 }}
                >
                    {tabs.map((tab) => (
                        <div
                            key={tab.key}
                            data-id={tab.key}
                            className="relative inline-flex w-1/3 justify-center transition-transform active:scale-[0.98]"
                        >
                            <button
                                type="button"
                                aria-label={tab.label}
                                className={`w-full inline-flex items-center justify-center px-3 py-2 text-sm font-semibold ${
                                    activeTab === tab.key
                                        ? 'text-white'
                                        : 'text-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        </div>
                    ))}
                </AnimatedBackground>
            </div>
        </div>
    );
};

export default RewardsHeader;
