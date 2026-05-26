import React from 'react';
import { motion } from 'motion/react';

interface ComingSoonStoryCardProps {
    title: string;
    showLeftSwipeHint?: boolean;
    onPrev?: () => void;
}

const ComingSoonStoryCard: React.FC<ComingSoonStoryCardProps> = ({
    title,
    showLeftSwipeHint = false,
    onPrev,
}) => {
    return (
        <motion.div
            className="flex flex-col gap-6 p-6 rounded-[30px] border border-white/15 bg-black/40 backdrop-blur-md select-none w-full items-center justify-center min-h-[280px]"
            style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
            }}
        >
            <div className="w-[80%] relative flex items-center justify-center py-8">
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
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/5">
                    <i className="fa-solid fa-hourglass-half text-3xl text-white/70" aria-hidden />
                </div>
            </div>

            <div className="text-center px-2">
                <p className="text-xl font-semibold leading-snug text-white/90">{title}</p>
            </div>
        </motion.div>
    );
};

export default ComingSoonStoryCard;
