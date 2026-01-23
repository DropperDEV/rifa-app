import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, Mail, Lock, Chrome, UserPlus, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Spinner } from '../components/ui/Spinner'
import { supabase } from '../supabase'
import { usePageTitle } from '../hooks/usePageTitle'

export function LoginPage() {
  usePageTitle('Login')
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn, signUp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          toast.error(error.message === 'Invalid login credentials' ? 'Email ou senha incorretos' : error.message)
        } else {
          toast.success('Login realizado com sucesso!')
          navigate('/')
        }
      } else {
        const { error } = await signUp(email, password)
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Conta criada com sucesso! Você já pode fazer login.')
          setIsLogin(true) // Volta para o modo de login após criar conta
        }
      }
    } catch (error) {
      console.error(error)
      toast.error('Ocorreu um erro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // --- NOVA FUNÇÃO DE LOGIN COM GOOGLE ---
  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin // Isso garante que volta pro seu site
        }
      })
      
      if (error) throw error
      // O Supabase vai redirecionar o usuário para a página do Google automaticamente.
      // Quando ele voltar, o AuthContext vai detectar o login.
      
    } catch (error) {
      console.error(error)
      toast.error('Erro ao conectar com Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-50">RifaOrganizer</h1>
        </div>

        <div className="text-center mb-6">
          <p className="text-slate-400 text-sm">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta grátis'}
          </p>
        </div>

        {/* Form Email/Senha */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              placeholder="seu@email.com"
              className="input-field pl-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="Sua senha"
              className="input-field pl-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <Spinner size="sm" className="text-white" />
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                Entrar
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Criar Conta
              </>
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-sm text-slate-500">ou</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Botão Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-800 font-medium rounded-xl transition-colors"
          disabled={loading}
        >
          <Chrome className="w-5 h-5" />
          Continuar com Google
        </button>

        {/* Toggle Login/Criar */}
        <p className="text-center text-slate-400 text-sm mt-6">
          {isLogin ? 'Não tem conta?' : 'Já tem conta?'}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-400 hover:underline ml-1 font-medium"
            disabled={loading}
          >
            {isLogin ? 'Criar agora' : 'Fazer login'}
          </button>
        </p>
      </div>
    </div>
  )
}