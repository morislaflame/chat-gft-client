import React from 'react';
import Button from '@/components/ui/button';

type RewardsHeaderProps = {
    activeTab: 'available' | 'purchased';
    onChange: (tab: 'available' | 'purchased') => void;
    availableLabel: string;
    purchasedLabel: string;
    title?: string;
};

const RewardsHeader: React.FC<RewardsHeaderProps> = ({
    activeTab,
    onChange,
    availableLabel,
    purchasedLabel
}) => {
    const isMobile = document.body.classList.contains('telegram-mobile');
    const tabs = [
        { key: 'available', label: availableLabel },
        { key: 'purchased', label: purchasedLabel },
    ] as const;

    return (
        <div
            className="fixed inset-x-4 flex items-center justify-between z-100"
            style={{ marginTop: isMobile ? '142px' : '42px' }}
        >
            <div className="bg-card border border-primary-700 rounded-xl p-2 w-full">
                <div className="grid grid-cols-2 gap-2">
                    {tabs.map((tab) => (
                        <div
                            key={tab.key}
                            className="transition-transform active:scale-[0.98]"
                        >
                            <Button
                                type="button"
                                aria-label={tab.label}
                                onClick={() => onChange(tab.key)}
                                variant={activeTab === tab.key ? 'gradient' : 'default'}
                                size="sm"
                                className="w-full"
                            >
                                {tab.label}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RewardsHeader;
