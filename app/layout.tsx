import type { Metadata } from 'next'
import { Instrument_Serif, Inter } from 'next/font/google'
import './globals.css'
import { RoleProvider } from '@/components/layout/RoleContext'
import AppShell from '@/components/layout/AppShell'

const instrumentSerif = Instrument_Serif({ 
  subsets: ['latin'], 
  variable: '--font-serif',
  weight: ['400'] 
})
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'] 
})

export const metadata: Metadata = {
  title: 'DermaCare - Enfermagem Dermatológica',
  description: 'Sistema Híbrido de Agendamento e Prontuário de Feridas',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${instrumentSerif.variable} font-sans bg-background text-text`}>
        <RoleProvider>
          <AppShell>
            {children}
          </AppShell>
        </RoleProvider>
      </body>
    </html>
  )
}

