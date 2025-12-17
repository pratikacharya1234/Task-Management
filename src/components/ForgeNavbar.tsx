'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function ForgeNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b-2 border-surface-600 shadow-forge"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg shadow-ember flex items-center justify-center">
                <svg className="w-7 h-7 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg blur opacity-30 -z-10" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-secondary to-primary">
                FORGE
              </h1>
              <p className="text-xs text-text-secondary font-mono">v1.0.0-alpha</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#docs">Docs</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#about">About</NavLink>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 font-heading font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-forge px-6 py-2 text-sm"
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-surface-600 py-4"
          >
            <div className="flex flex-col gap-4">
              <NavLink href="#features" mobile>Features</NavLink>
              <NavLink href="#docs" mobile>Docs</NavLink>
              <NavLink href="#pricing" mobile>Pricing</NavLink>
              <NavLink href="#about" mobile>About</NavLink>
              <div className="flex flex-col gap-2 pt-4 border-t border-surface-600">
                <button className="w-full py-2 text-text-secondary hover:text-text-primary transition-colors">
                  Sign In
                </button>
                <button className="btn-forge w-full py-2">Get Started</button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

function NavLink({ href, children, mobile = false }: { href: string; children: React.ReactNode; mobile?: boolean }) {
  return (
    <motion.a
      href={href}
      className={`font-heading font-medium text-text-secondary hover:text-text-primary transition-colors relative group ${
        mobile ? 'text-lg py-2' : ''
      }`}
      whileHover={{ x: mobile ? 4 : 0 }}
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent group-hover:w-full transition-all duration-300" />
    </motion.a>
  )
}
