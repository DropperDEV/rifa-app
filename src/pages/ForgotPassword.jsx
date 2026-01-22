import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { Mail, Ticket, ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  
  // CORREÇÃO 1: Usar o hook da mesma forma que no Login
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // O Supabase exige uma URL completa para redirecionar
      // Garanta que essa URL está nas configurações de "Redirect URLs" do Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://rifa-app-vercel.vercel.app/update-password',
      })

      if (error) throw error

      // CORREÇÃO 2: Usar o método .success direto
      toast.success('Se o e-mail existir, um link foi enviado!')
      
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      
      // Tratamento específico para o erro de limite de tempo (Rate Limit)
      if (error.message.includes('security purposes')) {
        toast.error('Muitas tentativas. Aguarde 60 segundos.')
      } else {
        toast.error('Erro ao enviar e-mail. Tente novamente.')
      }
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
                  className="input-field pl-10"
                  placeholder="seu@email.com"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 relative group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Enviar Link de Recuperação</span>
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