import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

type RippleState = { x: number; y: number; size: number } | null;

/** Как у `Button`: лёгкое сжатие при нажатии + ripple от точки касания */
const TAP_FEEDBACK = {
  whileTap: {
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeInOut" as const },
  },
} as const;

export type PressableRippleSurfaceProps = Omit<
  React.ComponentProps<typeof motion.button>,
  "children"
> & {
  children: React.ReactNode;
  rippleClassName?: string;
};

export const PressableRippleSurface = React.forwardRef<HTMLButtonElement, PressableRippleSurfaceProps>(
  (
    {
      className,
      children,
      rippleClassName = "bg-white/40",
      onPointerDown,
      type = "button",
      ...rest
    },
    ref
  ) => {
    const innerRef = React.useRef<HTMLButtonElement>(null);
    const [ripple, setRipple] = React.useState<RippleState>(null);

    const mergedRef = React.useCallback(
      (el: HTMLButtonElement | null) => {
        (innerRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      },
      [ref]
    );

    const handlePointerDown = React.useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(e);
        if (e.defaultPrevented || e.button !== 0) return;
        const el = innerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = 2 * Math.max(rect.width, rect.height);
        setRipple({ x, y, size });
      },
      [onPointerDown]
    );

    return (
      <motion.button
        ref={mergedRef}
        type={type}
        className={cn(
          "relative cursor-pointer overflow-hidden select-none outline-none transition-[box-shadow,background-color] duration-200 ease-out",
          "focus-visible:ring-2 focus-visible:ring-primary-500/50",
          className
        )}
        {...rest}
        {...TAP_FEEDBACK}
        onPointerDown={handlePointerDown}
      >
        {ripple ? (
          <span
            className="pointer-events-none absolute z-0"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.span
              className={cn("block size-full rounded-full", rippleClassName)}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onAnimationComplete={() => setRipple(null)}
            />
          </span>
        ) : null}
        <span className="relative z-10 block w-full">{children}</span>
      </motion.button>
    );
  }
);

PressableRippleSurface.displayName = "PressableRippleSurface";
