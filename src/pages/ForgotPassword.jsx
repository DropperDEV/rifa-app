import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { Mail, Ticket, ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:5173/update-password',
      })

      if (error) throw error

      addToast({
        type: 'success',
        title: 'Verifique seu e-mail',
        message: 'Se este e-mail existir, um link de recuperação foi enviado.'
      })
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error)
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível enviar o e-mail de recuperação. Tente novamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-50">RifaOrganizer</h1>
        </div>

        <div className="glass-card p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-slate-50 mb-2 text-center">Recuperar Senha</h2>
          <p className="text-slate-400 text-sm text-center mb-6">
            Digite seu e-mail para receber um link de redefinição de senha
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                E-mail
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all group-hover:border-slate-600/50"
                  placeholder="seu@email.com"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 group-focus-within:text-emerald-500 transition-colors" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 relative overflow-hidden group"
            >
              <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                Enviar Link de Recuperação
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
