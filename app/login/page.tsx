"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Activity, Mail, Lock, User, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: fullName }
          }
        })
        if (error) throw error
        alert('Confirme seu e-mail para continuar!')
      }
      router.push('/role-selection')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F7F6] via-[#FDF5F3] to-[#F0E8E5] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-[0_20px_50px_rgba(165,128,121,0.1)] border border-[#A58079]/10 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 rounded-3xl bg-[#A58079]/10 border border-[#A58079]/20 mb-4">
              <Activity className="w-10 h-10 text-[#A58079]" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A1514] tracking-tight text-center">
              Vitória <span className="text-[#A58079]">Luz</span>
            </h1>
            <p className="text-[#6B5C59] mt-2 text-sm text-center">
              {isLogin ? 'Bem-vindo de volta ao seu sistema' : 'Crie sua conta para começar'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A58079]/50 group-focus-within:text-[#A58079] transition-colors" />
                <input
                  type="text"
                  placeholder="Nome Completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F9F7F6] border border-[#A58079]/10 focus:border-[#A58079] focus:outline-none transition-all placeholder:text-[#6B5C59]/40"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A58079]/50 group-focus-within:text-[#A58079] transition-colors" />
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F9F7F6] border border-[#A58079]/10 focus:border-[#A58079] focus:outline-none transition-all placeholder:text-[#6B5C59]/40"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A58079]/50 group-focus-within:text-[#A58079] transition-colors" />
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F9F7F6] border border-[#A58079]/10 focus:border-[#A58079] focus:outline-none transition-all placeholder:text-[#6B5C59]/40"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs text-center border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#A58079] hover:bg-[#8C6A63] text-white font-bold shadow-[0_10px_20px_rgba(165,128,121,0.2)] hover:shadow-none transition-all transform hover:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-semibold text-[#A58079] hover:text-[#8C6A63] transition-colors"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre aqui'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
