import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getStorageMetrics } from '@/lib/admin/storage-metrics'

export const runtime = 'nodejs'

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured.')
  }

  return {
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseAnonKey,
    supabaseUrl,
  }
}

export async function GET() {
  try {
    const { serviceRoleKey, supabaseAnonKey, supabaseUrl } = getSupabaseEnv()
    const cookieStore = await cookies()

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, options, value } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 })
    }

    const { data: adminRole, error: roleError } = await supabase
      .from('user_clinic_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle()

    if (roleError) {
      return NextResponse.json({ error: 'Nao foi possivel validar o perfil do usuario.' }, { status: 500 })
    }

    if (!adminRole) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    }

    const metricsClient =
      serviceRoleKey
        ? createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : supabase

    const metrics = await getStorageMetrics(metricsClient)

    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao carregar metricas de armazenamento.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
