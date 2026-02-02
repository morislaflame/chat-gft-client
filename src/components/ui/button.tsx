import * as React from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "destructive"
  | "gradient"
  | "glass";

type ButtonSize = "default" | "sm" | "lg" | "icon";

export type ButtonState = "default" | "success";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "color"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
  /** Optional state for smooth overlay transition (e.g. "Copied" feedback) */
  state?: ButtonState;
}

const base =
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold overflow-hidden h-fit" +
  "transition-[box-shadow,color,background-color,border-color,outline-color,transform,opacity] duration-400 ease-out select-none " +
  "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "active:scale-[0.95] " +
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "btn-default-silver-border text-foreground shadow-none " +
    "hover:brightness-110 active:brightness-95 focus-visible:ring-primary/50 focus-visible:shadow-none",

  secondary:
    "btn-secondary-gradient-border text-secondary-foreground shadow-none " +
    "hover:brightness-110 active:brightness-95",

  outline:
    "btn-outline-gradient-border text-foreground shadow-none " +
    "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",

  ghost:
    "btn-ghost-gradient-border text-foreground shadow-none " +
    "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",

  link:
    "text-primary underline-offset-4 hover:underline active:opacity-80 shadow-none border-0 bg-transparent",

  destructive:
    "btn-destructive-gradient-border text-destructive-foreground shadow-none " +
    "hover:brightness-110 active:brightness-95",

  gradient:
    "btn-gradient-border text-white shadow-none relative overflow-hidden " +
    "hover:brightness-110 active:brightness-95 " +
    "before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-b before:from-white/18 before:to-transparent before:pointer-events-none",

  glass:
    "btn-glass-gradient-border text-white shadow-none " +
    "hover:brightness-110 active:bg-white/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "px-4 py-2",
  sm: "px-3 py-2 text-xs",
  lg: "px-5 text-base",
  icon: "h-9 w-9 px-0 py-2",
};

const iconSizeClasses: Record<ButtonSize, string> = {
  default: "text-sm",
  sm: "text-xs",
  lg: "text-base",
  icon: "text-base",
};

const rippleClasses: Record<ButtonVariant, string> = {
  default: "bg-white/40",
  secondary: "bg-primary-foreground/30",
  outline: "bg-foreground/25",
  ghost: "bg-foreground/20",
  link: "bg-primary/40",
  destructive: "bg-white/50",
  gradient: "bg-[#4c2d65]",
  glass: "bg-white/40",
};

const SCALE_ANIMATION = {
  whileHover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 350, damping: 22, mass: 0.8 },
  },
  whileTap: {
    scale: 0.95,
    transition: { duration: 1, ease: "easeInOut" },
  },
} as const;

const stateOverlayClasses: Record<Exclude<ButtonState, "default">, string> = {
  success: "bg-green-500",
};

type RippleState = { x: number; y: number; size: number } | null;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      icon,
      iconPosition = "left",
      type,
      children: childrenProp,
      onPointerDown,
      state = "default",
      ...props
    },
    ref
  ) => {
    const children = childrenProp as React.ReactNode;
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [ripple, setRipple] = React.useState<RippleState>(null);

    const mergedRef = React.useCallback(
      (el: HTMLButtonElement | null) => {
        (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) {
          const r = ref as React.MutableRefObject<HTMLButtonElement | null>;
          r.current = el;
        }
      },
      [ref]
    );

    const handlePointerDown = React.useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(e);
        if (e.defaultPrevented || e.button !== 0) return;
        const el = buttonRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = 2 * Math.max(rect.width, rect.height);
        setRipple({ x, y, size });
      },
      [onPointerDown]
    );

    const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

    const iconEl = icon ? <i className={cn(icon, iconSizeClasses[size])} /> : null;
    const content = (
      <span
        className={cn(
          "relative z-10 inline-flex items-center justify-center gap-2",
          (variant === "gradient" || variant === "glass") && "relative z-10"
        )}
      >
        {iconPosition === "left" && iconEl}
        {children}
        {iconPosition === "right" && iconEl}
      </span>
    );

    // Minimal "asChild" support without extra deps.
    if (asChild) {
      const onlyChild = React.Children.only(children);
      if (!React.isValidElement(onlyChild)) return null;

      const childEl = onlyChild as React.ReactElement<Record<string, unknown>>;
      const childProps = childEl.props as Record<string, unknown> & { className?: string };

      return React.cloneElement(childEl, {
        ...props,
        className: cn(classes, childProps.className, className),
      });
    }

    return (
      <motion.button
        ref={mergedRef}
        type={type ?? "button"}
        className={classes}
        onPointerDown={handlePointerDown}
        {...SCALE_ANIMATION}
        {...props}
      >
        {ripple && (
          <span
            className="absolute pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.span
              className={cn("block w-full h-full rounded-full", rippleClasses[variant])}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onAnimationComplete={() => setRipple(null)}
            />
          </span>
        )}
        <AnimatePresence mode="wait">
          {state !== "default" && stateOverlayClasses[state] ? (
            <motion.span
              key={state}
              className={cn(
                "absolute inset-0 rounded-[inherit] pointer-events-none z-[1] border-none",
                stateOverlayClasses[state]
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          ) : null}
        </AnimatePresence>
        {content}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
