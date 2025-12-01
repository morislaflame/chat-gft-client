import React from 'react';
import { motion } from 'motion/react';
import Button from '@/components/CoreComponents/Button';

interface HistoryCardProps {
    title: string;
    description: string;
    selectText: string;
    loadingText: string;
    isSaving: boolean;
    onSelect: () => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
    title,
    description,
    selectText,
    loadingText,
    isSaving,
    onSelect
}) => {
    return (
        <motion.div
            className="flex flex-col gap-4 p-6 rounded-[40px] backdrop-blur-sm select-none w-full"
            style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
            }}
        >
            {/* History Description */}
            <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                    {title}
                </h3>
                <p className="text-white text-sm">
                    {description}
                </p>
            </div>

            {/* Select Button */}
            <Button
                onClick={onSelect}
                variant="secondary"
                size="lg"
                className="w-full"
                disabled={isSaving}
                // icon="fas fa-check"
            >
                {isSaving ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{loadingText}</span>
                    </div>
                ) : (
                    selectText
                )}
            </Button>
        </motion.div>
    );
};

export default HistoryCard;

