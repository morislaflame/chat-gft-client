import React from 'react';

interface NavigationControlsProps {
    activeIndex: number;
    totalItems: number;
    onPrevious: () => void;
    onNext: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
    activeIndex,
    totalItems,
    onPrevious,
    onNext
}) => {
    return (
        <div className="flex justify-center items-center gap-4 mt-4">
            <button
                onClick={onPrevious}
                disabled={activeIndex === 0}
                className="flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm disabled:opacity-50 transition-all duration-200 hover:scale-110"
                // style={{
                //     background: 'rgba(0, 0, 0, 0.50)',
                //     boxShadow: '0 4px 5px 0 rgba(255, 255, 255, 0.50) inset, 0 -4px 5px 0 rgba(0, 0, 0, 0.50) inset',
                // }}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            <div
                className="flex items-center gap-1 p-2 rounded-full backdrop-blur-sm"
                // style={{
                //     background: 'rgba(0, 0, 0, 0.50)',
                //     boxShadow: '0 4px 5px 0 rgba(255, 255, 255, 0.50) inset, 0 -4px 5px 0 rgba(0, 0, 0, 0.50) inset',
                // }}
            >
                {Array.from({ length: totalItems }).map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            activeIndex === idx ? 'bg-white' : 'bg-white/40'
                        }`}
                    />
                ))}
            </div>
            <button
                onClick={onNext}
                disabled={activeIndex === totalItems - 1}
                className="flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm disabled:opacity-50 transition-all duration-200 hover:scale-110"
                // style={{
                //     background: 'rgba(0, 0, 0, 0.50)',
                //     boxShadow: '0 4px 5px 0 rgba(255, 255, 255, 0.50) inset, 0 -4px 5px 0 rgba(0, 0, 0, 0.50) inset',
                // }}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        </div>
    );
};

export default NavigationControls;

