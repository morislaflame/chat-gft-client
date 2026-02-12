import { useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

// Utility functions
const rand = (min: number, max: number) => Math.random() * (max - min) + min
const randInt = (min: number, max: number) => Math.floor(rand(min, max))

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  decay: number
  color: string
  size: number
}

interface Firework {
  x: number
  y: number
  targetY: number
  vx: number
  vy: number
  color: string
  trail: { x: number; y: number; alpha: number }[]
}

export interface FireworksBackgroundProps {
  className?: string
  children?: React.ReactNode
  /** Array of colors to use for fireworks */
  colors?: string[]
  /** Interval between auto-launches in ms (0 to disable). Ignored when burstCount is set. */
  autoLaunchInterval?: number
  /** Number of particles per explosion */
  particleCount?: number
  /** When true, no dark background or gradient overlay (transparent) */
  transparent?: boolean
  /** Launch exactly this many fireworks then stop and call onBurstComplete after they finish */
  burstCount?: number
  /** Called after burstCount fireworks have been launched and their animations have finished */
  onBurstComplete?: () => void
}

export function FireworksBackground({
  className,
  children,
  colors = [
    "#ff595e",
    "#ffca3a",
    "#8ac926",
    "#1982c4",
    "#6a4c93",
    "#f72585",
    "#4cc9f0",
    "#80ed99",
    "#ffd166",
    "#ef476f",
  ],
  autoLaunchInterval = 600,
  particleCount = 80,
  transparent = false,
  burstCount,
  onBurstComplete,
}: FireworksBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const fireworksRef = useRef<Firework[]>([])
  const animationRef = useRef<number | undefined>(undefined)
  const launchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const burstTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const clickHandlerRef = useRef<((e: MouseEvent) => void) | null>(null)
  const scaleRef = useRef(1)

  const getRandomColor = useCallback(() => {
    return colors[randInt(0, colors.length)] || `hsl(${randInt(0, 360)}, 100%, 60%)`
  }, [colors])

  const createExplosion = useCallback(
    (x: number, y: number, color: string) => {
      const scale = scaleRef.current
      const particles: Particle[] = []
      // Scale particle count with screen size
      const count = Math.floor(particleCount * Math.max(1, scale * 0.8))

      for (let i = 0; i < count; i++) {
        const angle = rand(0, Math.PI * 2)
        const speed = rand(2, 8) * scale
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: rand(0.008, 0.018),
          color,
          size: rand(2, 5),
        })
      }
      particlesRef.current.push(...particles)
    },
    [particleCount],
  )

  const launchFirework = useCallback(
    (targetX?: number, targetY?: number) => {
      const container = containerRef.current
      if (!container) return

      const width = container.offsetWidth
      const height = container.offsetHeight
      const scale = scaleRef.current

      const x = targetX ?? rand(width * 0.1, width * 0.9)
      const startY = height
      // Target explosion in upper half of screen (small Y = top); avoid lower part
      const endY = targetY ?? rand(height * 0.08, height * 0.5)
      const color = getRandomColor()

      // Higher initial speed so rockets reach top targets before apex
      const angle = Math.atan2(endY - startY, x - (targetX ?? x)) - Math.PI / 2
      const speed = rand(24, 36) * scale

      fireworksRef.current.push({
        x,
        y: startY,
        targetY: endY,
        vx: Math.cos(angle + Math.PI / 2) * speed * 0.15,
        vy: -speed,
        color,
        trail: [],
      })
    },
    [getRandomColor],
  )

  const scheduleNextLaunch = useCallback(() => {
    if (autoLaunchInterval <= 0) return
    launchTimeoutRef.current = setTimeout(
      () => {
        launchFirework()
        scheduleNextLaunch()
      },
      rand(autoLaunchInterval * 0.5, autoLaunchInterval * 1.5),
    )
  }, [autoLaunchInterval, launchFirework])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = 0
    let height = 0
    let scale = 1

    // Setup canvas size
    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width
      canvas.height = height
      // Scale factor based on viewport (baseline 800px)
      scale = Math.min(width, height) / 800
      scaleRef.current = scale
    }
    updateSize()

    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(container)

    // Animation loop
    const animate = () => {
      if (transparent) {
        ctx.clearRect(0, 0, width, height)
      } else {
        // Semi-transparent clear for trail effect
        ctx.fillStyle = "rgba(10, 10, 20, 0.15)"
        ctx.fillRect(0, 0, width, height)
      }

      // Scale-adjusted values
      const trailSize = Math.max(2, 3 * scale)
      const headSize = Math.max(3, 5 * scale)
      const gravity = 0.25 * scale
      const particleGravity = 0.1 * scale

      // Update and draw fireworks
      for (let i = fireworksRef.current.length - 1; i >= 0; i--) {
        const fw = fireworksRef.current[i]

        // Add trail point
        fw.trail.push({ x: fw.x, y: fw.y, alpha: 1 })
        if (fw.trail.length > 20) fw.trail.shift()

        // Update position
        fw.x += fw.vx * scale
        fw.y += fw.vy * scale
        fw.vy += gravity

        // Draw trail with gradient
        for (let j = 0; j < fw.trail.length; j++) {
          const point = fw.trail[j]
          const progress = j / fw.trail.length
          ctx.beginPath()
          ctx.arc(point.x, point.y, trailSize * progress, 0, Math.PI * 2)
          ctx.fillStyle = fw.color
          ctx.globalAlpha = progress * 0.7
          ctx.fill()
        }
        ctx.globalAlpha = 1

        // Draw firework head with glow
        ctx.save()
        ctx.beginPath()
        ctx.arc(fw.x, fw.y, headSize, 0, Math.PI * 2)
        ctx.fillStyle = fw.color
        ctx.shadowColor = fw.color
        ctx.shadowBlur = 15 * scale
        ctx.fill()
        ctx.restore()

        // Check if should explode
        if (fw.vy >= 0 || fw.y <= fw.targetY) {
          createExplosion(fw.x, fw.y, fw.color)
          fireworksRef.current.splice(i, 1)
        }
      }

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]

        p.vy += particleGravity
        p.vx *= 0.985
        p.vy *= 0.985
        p.x += p.vx * scale
        p.y += p.vy * scale
        p.alpha -= p.decay

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1)
          continue
        }

        // Draw particle with glow
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10 * scale
        ctx.fill()
        ctx.restore()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    const isBurst = typeof burstCount === "number" && burstCount > 0

    if (isBurst) {
      // Launch burstCount fireworks with staggered delay, then call onBurstComplete
      const delayBetween = 180
      for (let i = 0; i < burstCount; i++) {
        const t = setTimeout(() => {
          launchFirework()
        }, i * delayBetween)
        burstTimeoutsRef.current.push(t)
      }
      const finishAt = burstCount * delayBetween + 3800
      const doneT = setTimeout(() => {
        onBurstComplete?.()
      }, finishAt)
      burstTimeoutsRef.current.push(doneT)
    } else {
      // Start auto-launching
      if (autoLaunchInterval > 0) {
        launchFirework()
        scheduleNextLaunch()
      }

      // Click handler
      clickHandlerRef.current = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect()
        launchFirework(e.clientX - rect.left, e.clientY - rect.top)
      }
      container.addEventListener("click", clickHandlerRef.current)
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (launchTimeoutRef.current) clearTimeout(launchTimeoutRef.current)
      burstTimeoutsRef.current.forEach((id) => clearTimeout(id))
      burstTimeoutsRef.current = []
      resizeObserver.disconnect()
      if (clickHandlerRef.current) {
        container.removeEventListener("click", clickHandlerRef.current)
        clickHandlerRef.current = null
      }
    }
  }, [createExplosion, launchFirework, scheduleNextLaunch, autoLaunchInterval, transparent, burstCount, onBurstComplete])

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 overflow-hidden",
        transparent ? "bg-transparent" : "bg-[#0a0a14]",
        className
      )}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Subtle gradient overlay (hidden when transparent) */}
      {!transparent && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at bottom, rgba(30, 20, 50, 0.3) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Content layer */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}

export default function FireworksBackgroundDemo() {
  return <FireworksBackground />
}
