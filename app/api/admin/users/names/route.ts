import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface UserNamePayload {
  userIds?: string[]
}

interface ProfileRecord {
  full_name: string | null
  id: string
}

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

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as UserNamePayload
    const uniqueUserIds = [...new Set((payload.userIds ?? []).filter(Boolean))]

    if (uniqueUserIds.length === 0) {
      return NextResponse.json({ names: {} })
    }

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
      return NextResponse.json({ error: 'Nao foi possivel validar o perfil administrador.' }, { status: 500 })
    }

    if (!adminRole) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    }

    const adminClient =
      serviceRoleKey
        ? createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : supabase

    const names: Record<string, string> = {}

    const { data: profilesData, error: profilesError } = await adminClient
      .from('profiles')
      .select('id, full_name')
      .in('id', uniqueUserIds)

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 })
    }

    for (const profile of (profilesData ?? []) as ProfileRecord[]) {
      if (profile.full_name?.trim()) {
        names[profile.id] = profile.full_name.trim()
      }
    }

    const missingUserIds = uniqueUserIds.filter((userId) => !names[userId])

    if (serviceRoleKey && missingUserIds.length > 0) {
      await Promise.all(
        missingUserIds.map(async (userId) => {
          const { data, error } = await adminClient.auth.admin.getUserById(userId)

          if (error || !data.user) {
            return
          }

          const metadataName = typeof data.user.user_metadata?.full_name === 'string'
            ? data.user.user_metadata.full_name.trim()
            : ''

          if (metadataName) {
            names[userId] = metadataName
            return
          }

          if (data.user.email) {
            names[userId] = data.user.email
          }
        })
      )
    }

    return NextResponse.json(
      { names },
      {
        headers: {
          'Cache-Control': 'private, no-store',
        },
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao carregar nomes de usuarios.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
