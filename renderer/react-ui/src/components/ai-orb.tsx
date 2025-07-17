"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  opacity: number
}

interface AIOrbProps {
  state: "idle" | "listening" | "talking"
  size?: number
}

export function AIOrb({ state, size = 300 }: AIOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = size
    canvas.height = size

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      const particleCount = state === "talking" ? 150 : state === "listening" ? 100 : 80

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2
        const radius = 60 + Math.random() * 40

        particlesRef.current.push({
          x: size / 2 + Math.cos(angle) * radius,
          y: size / 2 + Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: Math.random() * 100,
          maxLife: 100 + Math.random() * 50,
          size: 1 + Math.random() * 2,
          opacity: 0.3 + Math.random() * 0.7,
        })
      }
    }

    const updateParticles = () => {
      const centerX = size / 2
      const centerY = size / 2
      const time = timeRef.current * 0.01

      particlesRef.current.forEach((particle, index) => {
        // Calculate distance from center
        const dx = particle.x - centerX
        const dy = particle.y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Different behaviors based on state
        let targetRadius = 70
        let intensity = 0.02
        let turbulence = 0.5

        switch (state) {
          case "talking":
            targetRadius = 60 + Math.sin(time * 3 + index * 0.1) * 30
            intensity = 0.05
            turbulence = 2
            break
          case "listening":
            targetRadius = 80 + Math.sin(time * 2 + index * 0.05) * 15
            intensity = 0.03
            turbulence = 1
            break
          case "idle":
            targetRadius = 75 + Math.sin(time + index * 0.02) * 10
            intensity = 0.02
            turbulence = 0.5
            break
        }

        // Apply forces
        const force = (targetRadius - distance) * intensity
        const angle = Math.atan2(dy, dx)

        particle.vx += Math.cos(angle) * force
        particle.vy += Math.sin(angle) * force

        // Add turbulence
        particle.vx += (Math.random() - 0.5) * turbulence * 0.1
        particle.vy += (Math.random() - 0.5) * turbulence * 0.1

        // Apply damping
        particle.vx *= 0.95
        particle.vy *= 0.95

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Update life
        particle.life += 1
        if (particle.life > particle.maxLife) {
          particle.life = 0
          // Respawn particle
          const respawnAngle = Math.random() * Math.PI * 2
          const respawnRadius = targetRadius + (Math.random() - 0.5) * 20
          particle.x = centerX + Math.cos(respawnAngle) * respawnRadius
          particle.y = centerY + Math.sin(respawnAngle) * respawnRadius
        }

        // Update opacity based on life and state
        const lifeRatio = 1 - particle.life / particle.maxLife
        particle.opacity = lifeRatio * (state === "talking" ? 0.8 : state === "listening" ? 0.6 : 0.4)
      })
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, size, size)

      // Create gradient background
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
      gradient.addColorStop(0, "rgba(239, 68, 68, 0.1)")
      gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.05)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)

      // Draw connections between nearby particles
      ctx.strokeStyle = `rgba(239, 68, 68, 0.1)`
      ctx.lineWidth = 0.5

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i]
          const p2 = particlesRef.current[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 50) {
            const opacity = (1 - distance / 50) * 0.3
            ctx.strokeStyle = `rgba(239, 68, 68, ${opacity})`
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      // Draw particles
      particlesRef.current.forEach((particle) => {
        const alpha = particle.opacity

        // Create particle gradient
        const particleGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 2,
        )

        if (state === "talking") {
          particleGradient.addColorStop(0, `rgba(239, 68, 68, ${alpha})`)
          particleGradient.addColorStop(1, `rgba(239, 68, 68, 0)`)
        } else if (state === "listening") {
          particleGradient.addColorStop(0, `rgba(59, 130, 246, ${alpha})`)
          particleGradient.addColorStop(1, `rgba(59, 130, 246, 0)`)
        } else {
          particleGradient.addColorStop(0, `rgba(168, 85, 247, ${alpha})`)
          particleGradient.addColorStop(1, `rgba(168, 85, 247, 0)`)
        }

        ctx.fillStyle = particleGradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw central core
      const coreSize =
        state === "talking"
          ? 8 + Math.sin(timeRef.current * 0.1) * 3
          : state === "listening"
            ? 6 + Math.sin(timeRef.current * 0.05) * 2
            : 5 + Math.sin(timeRef.current * 0.02) * 1

      const coreGradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, coreSize * 2)

      if (state === "talking") {
        coreGradient.addColorStop(0, "rgba(239, 68, 68, 0.9)")
        coreGradient.addColorStop(1, "rgba(239, 68, 68, 0)")
      } else if (state === "listening") {
        coreGradient.addColorStop(0, "rgba(59, 130, 246, 0.9)")
        coreGradient.addColorStop(1, "rgba(59, 130, 246, 0)")
      } else {
        coreGradient.addColorStop(0, "rgba(168, 85, 247, 0.7)")
        coreGradient.addColorStop(1, "rgba(168, 85, 247, 0)")
      }

      ctx.fillStyle = coreGradient
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, coreSize, 0, Math.PI * 2)
      ctx.fill()
    }

    const animate = () => {
      timeRef.current += 1
      updateParticles()
      drawParticles()
      animationRef.current = requestAnimationFrame(animate)
    }

    initParticles()
    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [state, size])

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="rounded-full"
        style={{
          filter: "blur(0.5px)",
          background: "radial-gradient(circle, rgba(0,0,0,0.3) 0%, transparent 70%)",
        }}
      />
    </div>
  )
}
