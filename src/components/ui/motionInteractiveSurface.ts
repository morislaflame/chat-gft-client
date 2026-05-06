const SCALE_ANIMATION = {
    whileHover: {
        scale: 1.02,
        transition: { type: "spring" as const, stiffness: 350, damping: 22, mass: 0.8 },
    },
    whileTap: {
        scale: 0.95,
        transition: { duration: 1, ease: "easeInOut" as const },
    },
} as const;

/** Те же spring/tap, что у `Button` — для motion‑поверхностей карточек и т.п. */
export const motionInteractiveSurfaceProps = SCALE_ANIMATION;
