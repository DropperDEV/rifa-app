import { useState, useEffect } from 'react'
import { UserPlus, Users, Mail, Trash2, Clock, Check, AlertTriangle, X } from 'lucide-react'
import { supabase } from '../supabase'
import { useToast } from '../contexts/ToastContext'
import { Spinner } from '../components/ui/Spinner'

export function TeamManager({ rifaId }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [vendedores, setVendedores] = useState([])
  const [convites, setConvites] = useState([])
  const [loadingTeam, setLoadingTeam] = useState(true)
  
  // MUDANÇA 1: Agora guardamos o Objeto inteiro (não só o ID) para mostrar o email no modal
  const [vendedorParaRemover, setVendedorParaRemover] = useState(null)
  
  // MUDANÇA 2: Estado para o checkbox de segurança
  const [confirmacaoSegura, setConfirmacaoSegura] = useState(false)
  
  const toast = useToast()

  useEffect(() => {
    if (rifaId) carregarEquipe()
  }, [rifaId])

  async function carregarEquipe() {
    setLoadingTeam(true)
    const { data: vends, error } = await supabase
    .rpc('get_vendedores_com_email', { p_rifa_id: rifaId })
    
    if (error) console.error("Erro RPC:", error)

    setVendedores(vends || [])
    
    const { data: convs } = await supabase
      .from('convites_rifa')
      .select('*')
      .eq('rifa_id', rifaId)
      .order('created_at', { ascending: false })
    
    setConvites(convs || [])
    setLoadingTeam(false)
  }

  async function handleConvidar(e) {
    e.preventDefault()
    if (!email.trim()) return

    const {
      data: { user }
    } = await supabase.auth.getUser()

    setLoading(true)
    const emailFormatado = email.toLowerCase().trim()

    if (user?.email?.toLowerCase() === emailFormatado) {
      toast.error('Você não pode se convidar para a própria equipe.')
      setLoading(false)
      return
    }

    

    try {
      // 1. Verificar se esse email JÁ foi convidado antes
      const { data: conviteExistente } = await supabase
        .from('convites_rifa')
        .select('*')
        .eq('rifa_id', rifaId)
        .eq('email_convidado', emailFormatado)
        .maybeSingle()

      // Se já existe registro no banco...
      if (conviteExistente) {
        if (conviteExistente.status === 'pendente') {
          toast.error('Já existe um convite pendente para este email!')
          setLoading(false)
          return
        }
      
        if (conviteExistente.status === 'aceito') {
          const { data: stillVendedor } = await supabase
            .from('rifa_vendedores')
            .select('id')
            .eq('rifa_id', rifaId)
            .eq('user_id', conviteExistente.user_id)
            .maybeSingle()
      
          if (!stillVendedor) {
            const { error: updateError } = await supabase
              .from('convites_rifa')
              .update({ status: 'pendente', created_at: new Date() })
              .eq('id', conviteExistente.id)
      
            if (updateError) {
              console.error(updateError)
              toast.error('Erro ao reenviar convite.')
            } else {
              toast.success('Convite reenviado com sucesso! O usuário verá o convite na sua dashboard.')
              setEmail('')
              carregarEquipe()
            }
      
            setLoading(false)
            return
          }
      
          toast.info('Este usuário já aceitou e faz parte da equipe.')
          setLoading(false)
          return
        }
      
        if (conviteExistente.status === 'recusado') {
          const { error: updateError } = await supabase
            .from('convites_rifa')
            .update({ status: 'pendente', created_at: new Date() })
            .eq('id', conviteExistente.id)
      
          if (updateError) {
            console.error(updateError)
            toast.error('Erro ao reenviar convite.')
          } else {
            toast.success('Convite reenviado com sucesso! O usuário verá o convite na sua dashboard.')
            setEmail('')
            carregarEquipe()
          }
      
          setLoading(false)
          return
        }
      }

      // 2. Se não existe convite, criar um novo
      // Buscar se o usuário já existe no sistema
      const { data: userId } = await supabase
        .rpc('buscar_usuario_por_email', { email_busca: emailFormatado })

      // Criar o convite (com ou sem user_id)
      const conviteData = {
        rifa_id: rifaId,
        email_convidado: emailFormatado,
        status: 'pendente'
      }

      if (userId) {
        conviteData.user_id = userId
      }

      const { error: inviteError } = await supabase
        .from('convites_rifa')
        .insert(conviteData)

      if (inviteError) {
        if (inviteError.code === '23505') {
          toast.error('Já existe um convite para este email!')
        } else {
          toast.error('Erro ao criar convite')
        }
        setLoading(false)
        return
      }

      // Sucesso - o usuário verá o convite na dashboard quando fizer login
      toast.success(`Convite criado para ${emailFormatado}! O usuário verá o convite na sua dashboard.`)
      setEmail('')
      carregarEquipe()
    } catch (err) {
      console.error(err)
      toast.error('Erro inesperado')
    } finally {
      setLoading(false)
    }
  }
  
  // MUDANÇA 3: Recebe o objeto completo (vendedor) e reseta o checkbox
  function solicitarRemocao(vendedor) {
    setVendedorParaRemover(vendedor)
    setConfirmacaoSegura(false) // Reseta o checkbox sempre que abre
  }

  async function confirmarRemocao() {
    if (!vendedorParaRemover) return;
  
    // 1) remove da tabela de vendedores
    const { error: delError } = await supabase
      .from('rifa_vendedores')
      .delete()
      .eq('id', vendedorParaRemover.id);
  
    if (delError) {
      toast.error('Erro ao remover vendedor');
      return;
    }
  
    // 2) limpa convites relacionados (por user_id e por email)
    try {
      if (vendedorParaRemover.user_id) {
        await supabase
        .from('convites_rifa')
        .delete()
        .eq('rifa_id', rifaId)
        .or(
          `email_convidado.eq.${vendedorParaRemover.email}` +
          (vendedorParaRemover.user_id
            ? `,user_id.eq.${vendedorParaRemover.user_id}`
            : '')
        );
      }
  
      
  
      toast.success('Vendedor removido e convites limpos');
    } catch (err) {
      console.error(err);
      toast.success('Vendedor removido');
      toast.error('Falha ao limpar alguns convites (ver console).');
    }
  
    setVendedorParaRemover(null);
    carregarEquipe();
  }
  

  async function cancelarConvite(conviteId) {
    const { error } = await supabase
      .from('convites_rifa')
      .delete()
      .eq('id', conviteId)
    
    if (error) toast.error('Erro ao cancelar convite')
    else {
      toast.success('Convite cancelado')
      carregarEquipe()
    }
  }

  return (
    <div className="glass-card p-6 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-xl">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-50">Equipe de Vendas</h3>
          <p className="text-sm text-slate-400">Gerencie quem pode vender números</p>
        </div>
      </div>

      <form onSubmit={handleConvidar} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="email"
            placeholder="Digite o e-mail do vendedor"
            className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2 outline-none focus:border-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : <UserPlus className="w-4 h-4" />}
          <span className="hidden sm:inline">Adicionar</span>
        </button>
      </form>

      {loadingTeam ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          
          {vendedores.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                Vendedores Ativos ({vendedores.length})
              </h4>
              <div className="space-y-2">
                {vendedores.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs">
                        {v.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm font-medium">{v.email}</p> 
                        <p className="text-slate-500 text-xs">Entrou em {new Date(v.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {/* MUDANÇA 4: Passando o objeto 'v' inteiro, não só o ID */}
                    <button
                      onClick={() => solicitarRemocao(v)}
                      className="text-slate-500 hover:text-rose-500 p-2 transition-colors"
                      title="Remover da equipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {convites.filter(c => c.status === 'pendente').length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3">
                Convites Pendentes
              </h4>
              <div className="space-y-2">
                {convites.filter(c => c.status === 'pendente').map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/30 rounded-lg border-l-2 border-l-yellow-500/50">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-slate-300 text-sm">{c.email_convidado}</span>
                    </div>
                    <button
                      onClick={() => cancelarConvite(c.id)}
                      className="text-slate-500 hover:text-rose-500 p-2 transition-colors"
                      title="Cancelar convite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {vendedores.length === 0 && convites.length === 0 && (
            <div className="text-center py-8 text-slate-500 bg-slate-800/20 rounded-lg border border-dashed border-slate-700">
              <p>Ninguém na equipe ainda.</p>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL DE CONFIRMAÇÃO SEGURO --- */}
      {vendedorParaRemover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-rose-500/20 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-50 mb-1">Remover Vendedor?</h3>
                <p className="text-sm text-slate-400">
                  Você está removendo <span className="text-slate-200 font-semibold">{vendedorParaRemover.email}</span>.
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Ele perderá acesso imediato a esta rifa.
                </p>
              </div>
            </div>

            {/* CHECKBOX DE DUPLA PRECAUÇÃO */}
            <div className="mt-4 mb-6">
              <label className="flex items-start gap-3 p-3 bg-rose-950/30 border border-rose-500/20 rounded-lg cursor-pointer hover:bg-rose-950/50 transition-colors">
                <input 
                  type="checkbox" 
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-rose-600 focus:ring-rose-500"
                  checked={confirmacaoSegura}
                  onChange={(e) => setConfirmacaoSegura(e.target.checked)}
                />
                <span className="text-xs text-rose-200">
                  Estou ciente de que esta ação é irreversível e desejo remover este vendedor.
                </span>
              </label>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setVendedorParaRemover(null)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRemocao}
                disabled={!confirmacaoSegura} // Botão bloqueado
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all
                  ${confirmacaoSegura 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}
                `}
              >
                <Trash2 className="w-4 h-4" />
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}