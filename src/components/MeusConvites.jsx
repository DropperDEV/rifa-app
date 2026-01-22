import { useState, useEffect } from 'react'
import { Mail, Check, X, Ticket, Loader2, User } from 'lucide-react'
import { supabase } from '../supabase'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

export function MeusConvites() {
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
      // NOVA LÓGICA: Chamada RPC simples e direta
      const { data, error } = await supabase
        .rpc('get_meus_convites_pendentes')

      if (error) throw error

      setConvites(data || [])
    } catch (error) {
      console.error('Erro ao carregar convites:', error)
      toast.error('Erro ao buscar convites')
    } finally {
      setLoading(false)
    }
  }

  async function aceitarConvite(conviteId, rifaId) {
    setProcessando(conviteId)
    
    try {
      // 1. Inserir na tabela rifa_vendedores
      const { error: insertError } = await supabase
        .from('rifa_vendedores')
        .insert({ rifa_id: rifaId, user_id: user.id })

      if (insertError) {
        if (insertError.code === '23505') {
          toast.error('Você já está nesta equipe!')
        } else {
          throw insertError
        }
        // Se já existe, apenas atualizamos o convite para aceito para limpar a lista
      }

      // 2. Atualizar status do convite
      const { error: updateError } = await supabase
        .from('convites_rifa')
        .update({ status: 'aceito' })
        .eq('id', conviteId)

      if (updateError) throw updateError

      toast.success('Convite aceito com sucesso!')
      carregarConvites()
    } catch (error) {
      console.error('Erro ao aceitar:', error)
      toast.error('Erro ao aceitar convite.')
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
      console.error('Erro ao recusar:', error)
      toast.error('Erro ao recusar convite.')
    } finally {
      setProcessando(null)
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      </div>
    )
  }

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
        {convites.map(convite => (
          <div
            key={convite.convite_id}
            className="glass-card p-5 border-l-4 border-l-yellow-500/50 hover:border-l-yellow-500 transition-colors"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg shrink-0">
                <Ticket className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-slate-50 mb-1 truncate">
                  {convite.titulo}
                </h4>
                
                {convite.descricao && (
                  <p className="text-sm text-slate-400 line-clamp-2 mb-2">
                    {convite.descricao}
                  </p>
                )}
                
                <p className="text-xs text-slate-500 mb-2">
                  Valor por número: R$ {Number(convite.valor_numero).toFixed(2)}
                </p>

                {/* EMAIL DO CRIADOR */}
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-800/50 rounded-md w-fit">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-300 truncate max-w-[150px]" title={convite.dono_email}>
                    {convite.dono_email}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => aceitarConvite(convite.convite_id, convite.rifa_id)}
                disabled={processando === convite.convite_id}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-2 text-sm disabled:opacity-50"
              >
                {processando === convite.convite_id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Aceitar
                  </>
                )}
              </button>
              <button
                onClick={() => recusarConvite(convite.convite_id)}
                disabled={processando === convite.convite_id}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {processando === convite.convite_id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}