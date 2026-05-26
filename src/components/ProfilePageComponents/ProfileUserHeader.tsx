import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Card } from '@/components/ui/card';
import type { UserInfo } from '@/types/types';

const profileMotionEase = [0.22, 1, 0.36, 1] as const;

export type ProfileUserHeaderProps = {
    user: UserInfo | null | undefined;
    displayNickname: string;
    eyebrow?: string;
};

const ProfileUserHeader: React.FC<ProfileUserHeaderProps> = ({ user: u, displayNickname, eyebrow }) => {
    const prefersReducedMotion = useReducedMotion();

    return (
        <Card className="p-5 overflow-hidden">
            <div className="flex items-center gap-4">
                <motion.div
                    className="relative h-[5.25rem] w-[5.25rem] shrink-0 overflow-hidden rounded-xl btn-default-silver-border bg-primary-800 shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/10"
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.32, ease: profileMotionEase, delay: prefersReducedMotion ? 0 : 0.02 }}
                >
                    {u?.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <i className="fas fa-user text-[2.25rem] text-zinc-500" aria-hidden />
                        </div>
                    )}
                </motion.div>
                <div className="min-w-0 flex-1 py-0.5">
                    {eyebrow ? (
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{eyebrow}</p>
                    ) : null}
                    <h1 className="text-xl font-semibold leading-snug text-white break-words">{displayNickname}</h1>
                </div>
            </div>
        </Card>
    );
};

export default ProfileUserHeader;
