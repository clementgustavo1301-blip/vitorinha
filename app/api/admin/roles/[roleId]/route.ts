import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params
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

    const { data: targetRole, error: targetError } = await adminClient
      .from('user_clinic_roles')
      .select('id, user_id, clinic_id, role')
      .eq('id', roleId)
      .maybeSingle()

    if (targetError) {
      return NextResponse.json({ error: 'Nao foi possivel localizar o vinculo.' }, { status: 500 })
    }

    if (!targetRole) {
      return NextResponse.json({ error: 'Vinculo nao encontrado.' }, { status: 404 })
    }

    const { error: deleteError } = await adminClient
      .from('user_clinic_roles')
      .delete()
      .eq('id', roleId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        deletedRole: targetRole,
        success: true,
      },
      {
        headers: {
          'Cache-Control': 'private, no-store',
        },
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao excluir o vinculo.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
