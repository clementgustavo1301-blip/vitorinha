import { Calendar, HardDrive, Home, ShieldCheck, Users, type LucideIcon } from 'lucide-react'

import type { Role } from '@/components/layout/RoleContext'

export type AppRole = Role | 'manager'

export interface AppNavItem {
  href: string
  icon: LucideIcon
  label: string
  mobileLabel: string
  pageTitle: string
  roles: AppRole[]
}

const NAV_ITEMS: AppNavItem[] = [
  {
    href: '/',
    icon: Home,
    label: 'Dashboard',
    mobileLabel: 'Inicio',
    pageTitle: 'Dashboard',
    roles: ['nurse', 'receptionist', 'admin'],
  },
  {
    href: '/calendar',
    icon: Calendar,
    label: 'Agenda Hibrida',
    mobileLabel: 'Agenda',
    pageTitle: 'Agenda Hibrida',
    roles: ['nurse', 'receptionist', 'admin'],
  },
  {
    href: '/patients',
    icon: Users,
    label: 'Pacientes e Prontuarios',
    mobileLabel: 'Pacientes',
    pageTitle: 'Pacientes e Prontuarios',
    roles: ['nurse', 'admin'],
  },
  {
    href: '/admin/approvals',
    icon: ShieldCheck,
    label: 'Homologacoes',
    mobileLabel: 'Aprovacoes',
    pageTitle: 'Homologacoes',
    roles: ['admin'],
  },
  {
    href: '/admin/storage',
    icon: HardDrive,
    label: 'Gerenciamento de Dados',
    mobileLabel: 'Dados',
    pageTitle: 'Gerenciamento de Dados',
    roles: ['admin'],
  },
]

export function getNavItems(role: Role): AppNavItem[] {
  // Map synonyms
  const normalizedRole = (role as string) === 'manager' || (role as string) === 'gestor' ? 'admin' : role

  // If role is missing or invalid, fallback to nurse navigation (safest default)
  const activeRole = normalizedRole || 'nurse'

  return NAV_ITEMS.filter((item) => item.roles.includes(activeRole as any))
}

export function isNavItemActive(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getPageTitle(pathname: string) {
  if (pathname.startsWith('/appointments')) {
    return 'Novo Agendamento'
  }

  if (pathname.startsWith('/attendances')) {
    return 'Novo Atendimento'
  }

  return NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href))?.pageTitle ?? 'DermaCare'
}
