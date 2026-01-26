import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  DollarSign, 
  Ticket, 
  Users, 
  ExternalLink, 
  Image, 
  X,
  Eye,
  Phone,
  User,
  Store,
  Edit,
  Trash2,
  Save,
  Calendar,
  Gift,
  AlertTriangle,
  FileText
} from 'lucide-react'
import { supabase } from '../supabase'
import { Skeleton } from '../components/ui/Skeleton'
import { TeamManager } from '../components/TeamManager'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { useToast } from '../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '../components/ui/Spinner'

export function RifaAdmin() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [rifa, setRifa] = useState(null)
  const [bilhetes, setBilhetes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedComprovante, setSelectedComprovante] = useState(null)
  
  // Estados para edição
  const [editando, setEditando] = useState(false)
  const [formEdit, setFormEdit] = useState({ titulo: '', descricao: '', premio: '', data_sorteio: '' })
  const [salvando, setSalvando] = useState(false)
  
  // Estados para exclusão
  const [modalExcluir, setModalExcluir] = useState(false)
  const [confirmacao1, setConfirmacao1] = useState(false)
  const [confirmacao2, setConfirmacao2] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  // Atualizar título da página com o nome da rifa
  usePageTitle(rifa ? `Administração - ${rifa.titulo}` : 'Administração')

  useEffect(() => {
    carregarDados()
  }, [id])

  async function carregarDados() {
    setLoading(true)
    
    // Carregar dados da rifa
    const { data: rifaData } = await supabase
      .from('rifas')
      .select('*')
      .eq('id', id)
      .single()
    
    // --- MUDANÇA AQUI: Usando RPC para trazer o email do vendedor ---
    const { data: bilhetesData, error } = await supabase
      .rpc('get_vendas_rifa', { p_rifa_id: id })

    if (error) console.error("Erro ao carregar vendas:", error)
    
    setRifa(rifaData)
    setBilhetes(bilhetesData || [])
    
    // Inicializar formulário de edição
    if (rifaData) {
      setFormEdit({
        titulo: rifaData.titulo || '',
        descricao: rifaData.descricao || '',
        premio: rifaData.premio || '',
        data_sorteio: rifaData.data_sorteio ? rifaData.data_sorteio.split('T')[0] : ''
      })
    }
    
    setLoading(false)
  }
  
  function iniciarEdicao() {
    setEditando(true)
  }
  
  function cancelarEdicao() {
    setEditando(false)
    if (rifa) {
      setFormEdit({
        titulo: rifa.titulo || '',
        descricao: rifa.descricao || '',
        premio: rifa.premio || '',
        data_sorteio: rifa.data_sorteio ? rifa.data_sorteio.split('T')[0] : ''
      })
    }
  }
  
  async function salvarEdicao() {
    setSalvando(true)
    
    try {
      const updates = {
        titulo: formEdit.titulo.trim(),
        descricao: formEdit.descricao.trim() || null,
        premio: formEdit.premio.trim() || null,
        data_sorteio: formEdit.data_sorteio || null
      }
      
      const { error } = await supabase
        .from('rifas')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Rifa atualizada com sucesso!')
      setEditando(false)
      await carregarDados() // Recarregar dados
    } catch (error) {
      console.error('Erro ao atualizar rifa:', error)
      toast.error('Erro ao atualizar rifa. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }
  
  function abrirModalExcluir() {
    setModalExcluir(true)
    setConfirmacao1(false)
    setConfirmacao2(false)
  }
  
  function fecharModalExcluir() {
    setModalExcluir(false)
    setConfirmacao1(false)
    setConfirmacao2(false)
  }
  
  async function confirmarExclusao() {
    if (!confirmacao1 || !confirmacao2) {
      toast.error('Por favor, confirme ambas as opções para excluir a rifa.')
      return
    }
    
    setExcluindo(true)
    
    try {
      // Deletar a rifa (cascade vai deletar bilhetes, convites, etc)
      const { error } = await supabase
        .from('rifas')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Rifa excluída com sucesso!')
      navigate('/') // Redirecionar para home
    } catch (error) {
      console.error('Erro ao excluir rifa:', error)
      toast.error('Erro ao excluir rifa. Tente novamente.')
      setExcluindo(false)
    }
  }

  // Atualizar título quando a rifa for carregada
  useEffect(() => {
    if (rifa?.titulo) {
      document.title = `Administração - ${rifa.titulo}`
    }
  }, [rifa])

  function abrirComprovante(url) {
    setSelectedComprovante(url)
    setModalOpen(true)
  }

  // Calcular KPIs
  const totalVendidos = bilhetes.length
  const totalArrecadado = rifa ? totalVendidos * Number(rifa.valor_numero) : 0
  const progresso = rifa ? ((totalVendidos / rifa.qtd_numeros) * 100).toFixed(1) : 0
  const isOwner = rifa?.dono_id === user?.id

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold text-slate-50 block">
                  {loading ? <Skeleton className="w-32 h-5" /> : rifa?.titulo}
                </span>
                <span className="text-xs text-amber-400">Painel Administrativo</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              to={`/rifa/${id}`} 
              className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Rifa</span>
            </Link>
            
            {/* Botões de edição/exclusão - apenas para o dono */}
            {isOwner && !loading && (
              <>
                {!editando ? (
                  <>
                    <button
                      onClick={iniciarEdicao}
                      className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button
                      onClick={abrirModalExcluir}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Excluir</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={cancelarEdicao}
                      className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
                      disabled={salvando}
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Cancelar</span>
                    </button>
                    <button
                      onClick={salvarEdicao}
                      className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                      disabled={salvando}
                    >
                      {salvando ? (
                        <Spinner size="sm" className="text-white" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span className="hidden sm:inline">Salvar</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : (
          <>
            {/* Formulário de Edição - Apenas para o dono */}
            {isOwner && editando && (
              <div className="glass-card p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-emerald-400" />
                  Editar Rifa
                </h2>
                
                <div className="space-y-4">
                  {/* Título */}
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Título da Rifa *</label>
                    <div className="relative">
                      <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        className="input-field pl-11"
                        value={formEdit.titulo}
                        onChange={(e) => setFormEdit(prev => ({ ...prev, titulo: e.target.value }))}
                        placeholder="Ex: iPhone 15 Pro Max"
                        required
                        disabled={salvando}
                      />
                    </div>
                  </div>
                  
                  {/* Descrição */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      Descrição
                    </label>
                    <textarea
                      className="input-field min-h-[100px] resize-y"
                      value={formEdit.descricao}
                      onChange={(e) => setFormEdit(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva os detalhes da rifa, regras, condições, etc."
                      disabled={salvando}
                      rows={4}
                    />
                  </div>
                  
                  {/* Prêmio */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                      <Gift className="w-4 h-4 text-yellow-500" />
                      Prêmio
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={formEdit.premio}
                      onChange={(e) => setFormEdit(prev => ({ ...prev, premio: e.target.value }))}
                      placeholder="Ex: iPhone 15 Pro Max 256GB"
                      disabled={salvando}
                    />
                  </div>
                  
                  {/* Data do Sorteio */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      Data do Sorteio
                    </label>
                    <input
                      type="date"
                      className="input-field"
                      value={formEdit.data_sorteio}
                      onChange={(e) => setFormEdit(prev => ({ ...prev, data_sorteio: e.target.value }))}
                      disabled={salvando}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {/* Total Arrecadado */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Total Arrecadado</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      R$ {totalArrecadado.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bilhetes Vendidos */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Ticket className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Bilhetes Vendidos</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {totalVendidos} <span className="text-base text-slate-500">/ {rifa.qtd_numeros}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Progresso */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-400 mb-1">Progresso</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold text-amber-400">{progresso}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Manager - Apenas para o Dono */}
            <div className="mb-8">
              <TeamManager rifaId={id} />
            </div>

            {/* Tabela de Vendas */}
            <div className="glass-card overflow-hidden">
              <div className="p-5 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-slate-50">Vendas Realizadas</h2>
                <p className="text-sm text-slate-400">Lista de todos os bilhetes vendidos</p>
              </div>

              {bilhetes.length === 0 ? (
                <div className="p-12 text-center">
                  <Ticket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">Nenhuma venda registrada ainda</h3>
                  <p className="text-slate-500 mb-6">Aguarde os compradores realizarem as compras</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-800/50">
                        <th className="text-left px-5 py-3 text-sm font-medium text-slate-400">Número</th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-slate-400">Comprador</th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-slate-400">Contato</th>
                        {/* NOVA COLUNA */}
                        <th className="text-left px-5 py-3 text-sm font-medium text-slate-400">Vendedor</th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-slate-400">Status</th>
                        <th className="text-center px-5 py-3 text-sm font-medium text-slate-400">Comprovante</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bilhetes.map((bilhete, index) => (
                        <tr 
                          key={bilhete.id || bilhete.numero} // Ajuste para chave única
                          className={`
                            border-t border-slate-700/30 transition-colors hover:bg-slate-800/30
                            ${index % 2 === 0 ? 'bg-slate-800/10' : ''}
                          `}
                        >
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center justify-center w-10 h-10 bg-emerald-500/20 text-emerald-400 font-bold rounded-lg">
                              {String(bilhete.numero).padStart(2, '0')}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-700/50 rounded-lg">
                                <User className="w-4 h-4 text-slate-400" />
                              </div>
                              <span className="text-slate-200 font-medium">{bilhete.nome_comprador}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Phone className="w-4 h-4" />
                              <span>{bilhete.contato}</span>
                            </div>
                          </td>
                          
                          {/* DADOS DO VENDEDOR */}
                          <td className="px-5 py-4">
                            {bilhete.vendedor_email ? (
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                                  {bilhete.vendedor_email.charAt(0).toUpperCase()}
                                </span>
                                <span className="text-sm text-slate-300">
                                  {bilhete.vendedor_email.split('@')[0]}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-500 text-sm" title="Venda pelo Link Público">
                                <Store className="w-4 h-4" />
                                <span>Site</span>
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span className={`
                              inline-flex px-3 py-1 rounded-full text-xs font-medium
                              ${bilhete.status === 'pago' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-yellow-500/20 text-yellow-400'}
                            `}>
                              {bilhete.status === 'pago' ? 'Pago' : 'Pendente'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            {bilhete.comprovante_url ? (
                              <button
                                onClick={() => abrirComprovante(bilhete.comprovante_url)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-sm">Ver</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-2 text-slate-500 text-sm">
                                <Image className="w-4 h-4" />
                                Não enviado
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modal do Comprovante */}
      {modalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="glass-card p-4 max-w-3xl w-full max-h-[90vh] overflow-auto animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-50">Comprovante de Pagamento</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {selectedComprovante ? (
              <img 
                src={selectedComprovante} 
                alt="Comprovante de pagamento"
                className="w-full rounded-xl"
              />
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Comprovante não disponível</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Exclusão com Dupla Confirmação */}
      {modalExcluir && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={excluindo ? undefined : fecharModalExcluir}
        >
          <div 
            className="glass-card p-6 max-w-md w-full animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-rose-500/20 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-50 mb-1">Excluir Rifa Permanentemente?</h3>
                <p className="text-sm text-slate-400 mb-2">
                  Esta ação é <span className="text-rose-400 font-semibold">irreversível</span> e irá:
                </p>
                <ul className="text-sm text-slate-400 space-y-1 ml-4 list-disc">
                  <li>Deletar todos os bilhetes vendidos</li>
                  <li>Remover todos os convites pendentes</li>
                  <li>Remover todos os vendedores da equipe</li>
                  <li>Apagar todos os comprovantes de pagamento</li>
                </ul>
              </div>
            </div>

            {/* Primeira Confirmação */}
            <div className="mb-4">
              <label className="flex items-start gap-3 p-3 bg-rose-950/30 border border-rose-500/20 rounded-lg cursor-pointer hover:bg-rose-950/50 transition-colors">
                <input 
                  type="checkbox" 
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-rose-600 focus:ring-rose-500"
                  checked={confirmacao1}
                  onChange={(e) => setConfirmacao1(e.target.checked)}
                  disabled={excluindo}
                />
                <span className="text-xs text-rose-200">
                  Entendo que esta ação é permanente e não pode ser desfeita.
                </span>
              </label>
            </div>

            {/* Segunda Confirmação */}
            <div className="mb-6">
              <label className="flex items-start gap-3 p-3 bg-rose-950/30 border border-rose-500/20 rounded-lg cursor-pointer hover:bg-rose-950/50 transition-colors">
                <input 
                  type="checkbox" 
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-rose-600 focus:ring-rose-500"
                  checked={confirmacao2}
                  onChange={(e) => setConfirmacao2(e.target.checked)}
                  disabled={excluindo}
                />
                <span className="text-xs text-rose-200">
                  Confirmo que desejo excluir a rifa <span className="font-semibold">"{rifa?.titulo}"</span> e todos os seus dados relacionados.
                </span>
              </label>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={fecharModalExcluir}
                disabled={excluindo}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                disabled={!confirmacao1 || !confirmacao2 || excluindo}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all
                  ${confirmacao1 && confirmacao2 && !excluindo
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}
                `}
              >
                {excluindo ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Sim, Excluir Permanentemente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}