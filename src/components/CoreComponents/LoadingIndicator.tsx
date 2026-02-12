import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { createRoot, type Root } from 'react-dom/client';
import { StarfieldBackground } from '@/components/ui/backgrounds/starfield-background';

const GRADIENT = 'linear-gradient(135deg, #ff1cf7, #b249f8, #b249f8)';
const JUMP_HEIGHT = 28;
const DOT_HEIGHT = 12;
const DOT_WIDTH = 12;
const CYCLE = 0.45;

const OVERLAY_ROOT_ID = 'global-loading-indicator-root';

let overlayRoot: Root | null = null;
let overlayHostEl: HTMLElement | null = null;
let overlayRefCount = 0;
let overlayVisible = false;

function ensureOverlayRoot() {
    if (typeof document === 'undefined') return;

    if (!overlayHostEl) {
        overlayHostEl = document.getElementById(OVERLAY_ROOT_ID) as HTMLElement | null;
        if (!overlayHostEl) {
            overlayHostEl = document.createElement('div');
            overlayHostEl.id = OVERLAY_ROOT_ID;
            document.body.appendChild(overlayHostEl);
        }
    }

    if (!overlayRoot && overlayHostEl) {
        overlayRoot = createRoot(overlayHostEl);
        overlayRoot.render(<LoadingOverlay visible={false} />);
    }
}

function setOverlayVisible(nextVisible: boolean) {
    if (typeof document === 'undefined') return;
    ensureOverlayRoot();
    if (!overlayRoot) return;
    if (overlayVisible === nextVisible) return;

    overlayVisible = nextVisible;
    overlayRoot.render(<LoadingOverlay visible={overlayVisible} />);
}

function LoadingOverlay({ visible }: { visible: boolean }) {
    return (
        <div
            className={[
                // Keep loader under Header/BottomNavigation (they are z-20)
                'fixed inset-0 z-[19] transition-opacity duration-200',
                visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
            ].join(' ')}
            style={{ visibility: visible ? 'visible' : 'hidden' }}
            aria-hidden={!visible}
        >
            <StarfieldBackground
                className="!fixed inset-0 h-full"
                starColor="#b249f8"
                count={100}
                speed={0.5}
                twinkle
            >
                <div className="flex items-center justify-center h-full w-full min-h-[100vh]">
                    <div className="flex flex-col gap-4 items-center relative">
                        <div className="flex items-end gap-3" style={{ height: DOT_HEIGHT + JUMP_HEIGHT }}>
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="rounded-full origin-bottom"
                                    style={{
                                        width: DOT_WIDTH,
                                        height: DOT_HEIGHT,
                                        background: GRADIENT,
                                        boxShadow: '0 0 14px #b249f8',
                                    }}
                                    animate={{
                                        y: [0, -JUMP_HEIGHT, 0],
                                        scale: [1, 1.6, 1],
                                    }}
                                    transition={{
                                        duration: CYCLE * 3,
                                        repeat: Infinity,
                                        ease: [0.33, 1, 0.68, 1],
                                        delay: i * CYCLE,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </StarfieldBackground>
        </div>
    );
}

const LoadingIndicator: React.FC = () => {
    useEffect(() => {
        overlayRefCount += 1;
        setOverlayVisible(true);

        return () => {
            overlayRefCount = Math.max(0, overlayRefCount - 1);
            if (overlayRefCount === 0) {
                // Keep overlay mounted to avoid restarting animations next time.
                setOverlayVisible(false);
            }
        };
    }, []);

    // Intentionally render nothing: all visuals live in a single global overlay.
    return null;
};

export default LoadingIndicator;
