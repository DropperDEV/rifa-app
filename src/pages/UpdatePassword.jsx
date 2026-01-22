import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { Lock, Ticket, Save, Loader2 } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

export function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  // CORREÇÃO: Usamos 'toast' em vez de '{ addToast }'
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    // Verifica sessão ativa. O link mágico do Supabase já loga o usuário automaticamente.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
          toast.error('Link inválido ou expirado. Solicite novamente.')
          navigate('/login')
      }
    }
    
    checkSession()
  }, [navigate]) // Removi toast das dependências para evitar loops

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      toast.success('Sua senha foi redefinida com sucesso!')
      
      // Redireciona para home ou login
      navigate('/')
      
    } catch (error) {
      console.error('Erro ao atualizar senha:', error)
      toast.error('Não foi possível atualizar a senha. Tente novamente.')
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
          <h2 className="text-xl font-bold text-slate-50 mb-2 text-center">Nova Senha</h2>
          <p className="text-slate-400 text-sm text-center mb-6">
            Digite sua nova senha abaixo
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                Nova Senha
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all group-hover:border-slate-600/50"
                  placeholder="******"
                  minLength={6}
                  required
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 group-focus-within:text-emerald-500 transition-colors" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 relative overflow-hidden group"
            >
              <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                <Save className="w-4 h-4" />
                Salvar Nova Senha
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}