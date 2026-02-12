import React from 'react';
import { motion } from 'motion/react';
import Button from '@/components/ui/button';
import { AgentPreview } from '@/utils/agentUtils';
import type { MediaFile } from '@/types/types';

interface HistoryCardProps {
    title: string;
    description: string;
    selectText: string;
    loadingText: string;
    isSaving: boolean;
    preview?: MediaFile | null;
    showLeftSwipeHint?: boolean;
    showRightSwipeHint?: boolean;
    onPrev?: () => void;
    onNext?: () => void;
    onSelect: () => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
    title,
    description,
    selectText,
    loadingText,
    isSaving,
    preview,
    showLeftSwipeHint = false,
    showRightSwipeHint = false,
    onPrev,
    onNext,
    onSelect
}) => {
    return (
        <motion.div
            className="flex flex-col gap-4 p-4 rounded-[40px] backdrop-blur-sm select-none w-full items-center justify-center"
            style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
            }}
        >
            {/* Preview - внутри карточки */}
            {preview && (
                <div className="w-[80%] relative">
                    <AgentPreview
                        preview={preview}
                        size="full"
                    />

                    {/* Swipe hints (decorative) */}
                    {showLeftSwipeHint && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onPrev?.();
                            }}
                            className="absolute left-0 top-1/2 -translate-x-12 -translate-y-1/2 animate-swipe-hint-left cursor-pointer"
                            aria-label="Previous"
                        >
                            <div className="w-15 h-15 flex items-center justify-center">
                                <i className="fas fa-chevron-left text-white/90 text-xl text-semibold"></i>
                            </div>
                        </button>
                    )}
                    {showRightSwipeHint && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onNext?.();
                            }}
                            className="absolute right-0 top-1/2 translate-x-12 -translate-y-1/2 animate-swipe-hint-right cursor-pointer"
                            aria-label="Next"
                        >
                            <div className="w-15 h-15 flex items-center justify-center">
                                <i className="fas fa-chevron-right text-white/90 text-xl text-semibold"></i>
                            </div>
                        </button>
                    )}
                </div>
            )}
            
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
                variant="gradient"
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

