import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FORGE - The AI Product Architect That Thinks Before It Codes',
  description: 'Stop building prototypes. Start shipping products. Built for founders who need real software, not demos.',
  keywords: ['AI', 'product architect', 'web development', 'SaaS', 'production-ready'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
