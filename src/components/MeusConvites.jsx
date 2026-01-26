import { useState, useEffect } from 'react'
import { Mail, Check, X, Ticket, Loader2, User, Briefcase, Shield } from 'lucide-react'
import { supabase } from '../supabase'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

// 1. Recebemos a prop 'onUpdate' aqui
export function MeusConvites({ onUpdate }) {
  const { user } = useAuth()
  const toast = useToast()
  const [convites, setConvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [processando, setProcessando] = useState(null)

  useEffect(() => {
    if (user) carregarConvites()
  }, [user])

  async function carregarConvites() {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_meus_convites_pendentes')
      if (error) throw error
      //console.log(data)
      setConvites(data || [])
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao buscar convites')
    } finally {
      setLoading(false)
    }
  }

  async function aceitarConvite(conviteId) {
    setProcessando(conviteId)
    try {
      const { data, error } = await supabase.rpc('aceitar_convite_vendedor', { 
        p_convite_id: conviteId 
      })

      if (error) throw error

      if (data && data.success === false) {
      toast.error(data.message)
      return
    }

      toast.success('Convite aceito! Você entrou para a equipe.')
      
      // Atualiza a lista local (remove o convite da tela)
      await carregarConvites()

      // 2. AVISA O PAI (HOME) PARA RECARREGAR AS RIFAS
      if (onUpdate) {
        onUpdate()
      }

    } catch (error) {
      console.error('Erro:', error)
      toast.error(error.message || 'Erro ao aceitar convite.')
    } finally {
      setProcessando(null)
    }
  }

  async function recusarConvite(conviteId) {
    setProcessando(conviteId)
    try {
      const { error } = await supabase
        .from('convites_rifa')
        .update({ status: 'recusado' })
        .eq('id', conviteId)

      if (error) throw error
      toast.info('Convite recusado')
      carregarConvites()
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao recusar convite.')
    } finally {
      setProcessando(null)
    }
  }

  if (loading) return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    </div>
  )

  if (convites.length === 0) return null

  return (
    <section className="max-w-6xl mx-auto px-4 pb-8">
      <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
        <Mail className="w-5 h-5 text-yellow-400" />
        Meus Convites Pendentes
        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
          {convites.length}
        </span>
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {convites.map(convite => {
          //console.log(convite)
          const isGestor = convite.cargo === 'gestor'
          return (
          <div key={convite.convite_id} className="glass-card p-5 border-l-4 border-l-yellow-500/50 hover:border-l-yellow-500 transition-colors">
            
            {isGestor && (
                <div className="absolute top-0 right-0 bg-purple-500/20 text-purple-300 text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg border-l border-b border-purple-500/30 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Gestor
                </div>
              )}

            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg shrink-0">
                <Ticket className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-slate-50 mb-1 truncate">{convite.titulo}</h4>
                {convite.descricao && <p className="text-sm text-slate-400 line-clamp-2 mb-2">{convite.descricao}</p>}
                <p className="text-xs text-slate-500 mb-2">Valor: R$ {Number(convite.valor_numero).toFixed(2)}</p>
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-800/50 rounded-md w-fit">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-300 truncate max-w-[150px]">{convite.dono_email}</span>
                  <div className="flex items-center gap-1.5">
                       {isGestor ? <Shield className="w-3 h-3 text-purple-400" /> : <Briefcase className="w-3 h-3 text-emerald-400" />}
                       <span className={`text-xs ${isGestor ? 'text-purple-400' : 'text-emerald-400'}`}>
                         Convite para: {isGestor ? 'Gestor' : 'Vendedor'}
                       </span>
                    </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => aceitarConvite(convite.convite_id)}
                disabled={processando === convite.convite_id}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-2 text-sm disabled:opacity-50"
              >
                {processando === convite.convite_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Aceitar</>}
              </button>
              <button
                onClick={() => recusarConvite(convite.convite_id)}
                disabled={processando === convite.convite_id}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {processando === convite.convite_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              </button>
            </div>
          </div>
          )
        })}
      </div>
    </section>
  )
}