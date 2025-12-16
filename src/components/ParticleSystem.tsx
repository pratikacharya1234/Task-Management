'use client'

import { useEffect, useRef } from 'react'

export function ParticleSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Particle class for ember effects
    class Ember {
      x: number
      y: number
      size: number
      speedY: number
      speedX: number
      life: number
      maxLife: number

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth
        this.y = canvasHeight + 10
        this.size = Math.random() * 3 + 1
        this.speedY = -Math.random() * 2 - 0.5
        this.speedX = (Math.random() - 0.5) * 0.5
        this.life = 0
        this.maxLife = Math.random() * 200 + 100
      }

      update() {
        this.y += this.speedY
        this.x += this.speedX
        this.life++

        // Add some flicker
        this.speedY += (Math.random() - 0.5) * 0.1
      }

      draw() {
        if (!ctx) return

        const opacity = 1 - this.life / this.maxLife
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2)

        gradient.addColorStop(0, `rgba(233, 116, 81, ${opacity})`) // Burnt Sienna
        gradient.addColorStop(0.5, `rgba(184, 115, 51, ${opacity * 0.6})`) // Warm Copper
        gradient.addColorStop(1, 'rgba(139, 21, 56, 0)') // Deep Burgundy fade

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()

        // Add glow
        ctx.shadowBlur = 15
        ctx.shadowColor = 'rgba(233, 116, 81, 0.5)'
      }

      isDead() {
        return this.life >= this.maxLife || this.y < -10
      }
    }

    const embers: Ember[] = []
    const maxEmbers = 50

    // Animation loop
    function animate() {
      if (!ctx || !canvas) return

      // Clear with fade effect for trails
      ctx.fillStyle = 'rgba(44, 36, 32, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add new embers
      if (embers.length < maxEmbers && Math.random() < 0.3) {
        embers.push(new Ember(canvas.width, canvas.height))
      }

      // Update and draw embers
      for (let i = embers.length - 1; i >= 0; i--) {
        embers[i].update()
        embers[i].draw()

        if (embers[i].isDead()) {
          embers.splice(i, 1)
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
