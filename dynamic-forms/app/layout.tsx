import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dynamic Forms - Criador de Formulários',
  description: 'Crie formulários dinâmicos com lógica condicional de forma simples e intuitiva',
  keywords: ['formulários', 'forms', 'dinâmico', 'condicional', 'pesquisa'],
  authors: [{ name: 'Dynamic Forms Team' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  )
}