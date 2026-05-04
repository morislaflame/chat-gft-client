import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { motionInteractiveSurfaceProps } from '@/components/ui/button';

const MotionCard = motion.create(Card);

export type ProfileNftArtifactsBannerProps = {
    title: string;
    description: string;
    onOpen: () => void;
};

const ProfileNftArtifactsBanner: React.FC<ProfileNftArtifactsBannerProps> = ({
    title,
    description,
    onOpen,
}) => {
    const prefersReducedMotion = useReducedMotion();

    return (
        <MotionCard
            role="button"
            tabIndex={0}
            aria-label={`${title}. ${description}`}
            onClick={onOpen}
            onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpen();
                }
            }}
            {...(prefersReducedMotion ? {} : motionInteractiveSurfaceProps)}
            className="group relative w-full cursor-pointer overflow-hidden p-0 text-left outline-none transition-[background-color,box-shadow] duration-400 ease-out hover:bg-primary-700/45 focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(0,0%,2%)]"
        >
            <div
                className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-[inherit] bg-gradient-to-b from-[#ff1cf7] via-secondary-400 to-transparent opacity-90"
                aria-hidden
            />
            <motion.div
                className="pointer-events-none absolute -bottom-0 -left-10 h-60 w-60 rounded-full bg-violet-500 blur-3xl"
                aria-hidden
                animate={
                    prefersReducedMotion ? { opacity: 0.09 } : { opacity: [0.06, 0.11, 0.06] }
                }
                transition={
                    prefersReducedMotion
                        ? undefined
                        : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
                }
            />
            <div className="relative flex gap-4 px-5 py-5">
                <div className="min-w-0 flex-1 flex items-center justify-between gap-3">
                    <div className="flex max-w-[calc(100%-1.5rem)] flex-col gap-2">
                        <span className="min-w-0 flex-1 text-lg font-semibold leading-snug text-zinc-100">{title}</span>
                        {/* <p className="text-sm leading-relaxed text-zinc-400">{description}</p> */}
                    </div>
                    <i
                        className="fa-solid fa-chevron-right mt-1 shrink-0 text-sm text-zinc-500 motion-safe:transition-[transform] motion-safe:duration-400 motion-safe:ease-out group-hover:motion-safe:translate-x-[3px]"
                        aria-hidden
                    />
                </div>
            </div>
        </MotionCard>
    );
};

export default ProfileNftArtifactsBanner;
