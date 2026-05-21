import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { FireworksBackground } from '@/components/ui/backgrounds/fireworks-background';

export const GEM_POP_DURATION = 0.45;
export const GEM_FLY_DURATION = 1;
export const GEM_TOTAL_DURATION = GEM_POP_DURATION + GEM_FLY_DURATION;
export const GEM_LIFT_PX = 48;
export const GEM_POP_SCALE = 1.35;
export const GEM_ARRIVAL_SCALE = 0.78;
export const GEM_ARC_OFFSET_PX = 56;
export const GEM_ARC_SAMPLES = 14;

export type FlyingGemCoords = {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
};

function bezier2(A: number, P: number, B: number, t: number): number {
    const u = 1 - t;
    return u * u * A + 2 * u * t * P + t * t * B;
}

function buildGemKeyframes(coords: FlyingGemCoords) {
    const popT = GEM_POP_DURATION / GEM_TOTAL_DURATION;
    const ax = coords.fromX;
    const ay = coords.fromY - GEM_LIFT_PX;
    const bx = coords.toX;
    const by = coords.toY;
    const px = (ax + bx) / 2 - GEM_ARC_OFFSET_PX;
    const py = (ay + by) / 2;
    const xKeyframes: number[] = [coords.fromX, ax];
    const yKeyframes: number[] = [coords.fromY, ay];
    const times: number[] = [0, popT];
    for (let i = 1; i <= GEM_ARC_SAMPLES; i++) {
        const t = i / GEM_ARC_SAMPLES;
        xKeyframes.push(bezier2(ax, px, bx, t));
        yKeyframes.push(bezier2(ay, py, by, t));
        times.push(popT + (1 - popT) * t);
    }
    const n = xKeyframes.length;
    return {
        x: xKeyframes,
        y: yKeyframes,
        scale: [1, GEM_POP_SCALE, ...Array(n - 2).fill(GEM_ARRIVAL_SCALE)],
        opacity: [1, 1, ...Array(n - 2).fill(0.9)],
        times,
    };
}

type FlyingGemOverlayProps = {
    flyingGem: FlyingGemCoords | null;
    showFireworks?: boolean;
    onFlyingGemComplete?: () => void;
    onFireworksComplete?: () => void;
};

export function FlyingGemOverlay({
    flyingGem,
    showFireworks = false,
    onFlyingGemComplete,
    onFireworksComplete,
}: FlyingGemOverlayProps) {
    if (typeof document === 'undefined' || (!flyingGem && !showFireworks)) {
        return null;
    }

    const keyframes = flyingGem ? buildGemKeyframes(flyingGem) : null;

    return createPortal(
        <div className="fixed inset-0 z-[10002] pointer-events-none">
            {showFireworks ? (
                <FireworksBackground
                    className="absolute inset-0"
                    particleCount={70}
                    transparent
                    burstCount={5}
                    onBurstComplete={onFireworksComplete}
                />
            ) : null}
            {flyingGem && keyframes ? (
                <motion.div
                    className="fixed left-0 top-0 w-12 h-12 -ml-6 -mt-6 flex items-center justify-center relative"
                    initial={{
                        x: flyingGem.fromX,
                        y: flyingGem.fromY,
                        scale: 1,
                        opacity: 1,
                    }}
                    animate={{
                        x: keyframes.x,
                        y: keyframes.y,
                        scale: keyframes.scale,
                        opacity: keyframes.opacity,
                    }}
                    transition={{
                        duration: GEM_TOTAL_DURATION,
                        times: keyframes.times,
                        ease: [0.42, 0, 1, 1],
                    }}
                    onAnimationComplete={onFlyingGemComplete}
                >
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        aria-hidden
                    >
                        <motion.div
                            className="absolute w-[72px] h-[72px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                            style={{
                                background: 'linear-gradient(to right, #eab308, #f97316)',
                                filter: 'blur(14px)',
                            }}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{
                                opacity: [0, 0.85, ...Array(keyframes.times.length - 2).fill(0.85)],
                                scale: [0.5, 1.2, ...Array(keyframes.times.length - 2).fill(1.2)],
                            }}
                            transition={{
                                duration: GEM_TOTAL_DURATION,
                                times: keyframes.times,
                                ease: [0.42, 0, 1, 1],
                            }}
                        />
                    </motion.div>
                    <i className="fa-solid fa-gem text-secondary-gradient text-4xl relative z-10" />
                </motion.div>
            ) : null}
        </div>,
        document.body,
    );
}

export function startGemFlightFromRect(sourceRect: DOMRect): FlyingGemCoords | null {
    const targetEl = document.querySelector('[data-gems-target]');
    if (!targetEl) return null;
    const toRect = targetEl.getBoundingClientRect();
    return {
        fromX: sourceRect.left + sourceRect.width / 2,
        fromY: sourceRect.top + sourceRect.height / 2,
        toX: toRect.left + toRect.width / 2,
        toY: toRect.top + toRect.height / 2,
    };
}
