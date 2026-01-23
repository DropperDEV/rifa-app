import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Ticket, Calendar, Gift, Users, Settings } from 'lucide-react'
import { supabase } from '../supabase'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { GridNumeros } from '../components/rifa/GridNumeros'
import { ModalCompra } from '../components/rifa/ModalCompra'
import { SkeletonGrid, Skeleton } from '../components/ui/Skeleton'
import { usePageTitle } from '../hooks/usePageTitle'

export function RifaDetalhe() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const [rifa, setRifa] = useState(null)
  const [vendidos, setVendidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [numeroSelecionado, setNumeroSelecionado] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    carregarDados()
    
    // Atualização em Tempo Real
    const channel = supabase
      .channel('vendas')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'bilhetes', 
        filter: `rifa_id=eq.${id}` 
      }, (payload) => {
        setVendidos(prev => [...prev, payload.new.numero])
        toast.info(`Número ${payload.new.numero} foi vendido!`)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  async function carregarDados() {
    setLoading(true)
    const { data: r } = await supabase.from('rifas').select('*').eq('id', id).single()
    const { data: b } = await supabase.from('bilhetes').select('numero').eq('rifa_id', id)
    setRifa(r)
    setVendidos(b?.map(x => x.numero) || [])
    setLoading(false)
  }

  // Atualizar título quando a rifa for carregada
  useEffect(() => {
    if (rifa?.titulo) {
      document.title = `${rifa.titulo} - RifaOrganizer`
    }
  }, [rifa])

  async function handleConfirmarVenda({ comprador, contato, arquivo }) {
    setIsSubmitting(true)
    
    try {
      // Upload Imagem
      let urlPublica = null
      if (arquivo) {
        const nomeArquivo = `${id}/${Date.now()}_${arquivo.name}`
        const { data } = await supabase.storage.from('comprovantes').upload(nomeArquivo, arquivo)
        if (data) {
          const { data: urlData } = supabase.storage.from('comprovantes').getPublicUrl(nomeArquivo)
          urlPublica = urlData.publicUrl
        }
      }

      // Insert no Banco com vendedor_id
      const { error } = await supabase.from('bilhetes').insert({
        rifa_id: id,
        numero: numeroSelecionado,
        nome_comprador: comprador,
        contato: contato,
        comprovante_url: urlPublica,
        vendedor_id: user.id  // Define quem vendeu
      })

      if (error) {
        if (error.code === '23505') {
          toast.error('Este número já foi vendido! Por favor, escolha outro.')
        } else {
          toast.error('Erro ao processar a compra. Tente novamente.')
        }
      } else {
        toast.success(`Número ${numeroSelecionado} comprado com sucesso!`)
        setModalOpen(false)
      }
    } catch (err) {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSelectNumero(num) {
    setNumeroSelecionado(num)
    setModalOpen(true)
  }

  const numeros = rifa ? Array.from({ length: rifa.qtd_numeros }, (_, i) => i + 1) : []
  const progresso = rifa ? ((vendidos.length / rifa.qtd_numeros) * 100).toFixed(1) : 0

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
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-50">
                {loading ? <Skeleton className="w-32 h-6" /> : rifa?.titulo}
              </span>
            </div>
          </div>
          
          <Link 
            to={`/rifa/${id}/admin`} 
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Gerenciar</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <>
            <div className="glass-card p-6 mb-8">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <SkeletonGrid count={50} />
          </>
        ) : (
          <>
            {/* Info da Rifa */}
<div className="glass-card p-6 mb-8">
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-50 mb-2">
        {rifa.titulo}
      </h1>

      {rifa.descricao && (
        <p className="text-slate-400 max-w-2xl break-words">
        {rifa.descricao}
      </p>
      )}
    </div>

    <div className="text-left lg:text-right">
    <p className="text-sm text-slate-400">Valor por número</p>
    <p className="text-3xl font-bold text-emerald-400 whitespace-nowrap">
      R$ {Number(rifa.valor_numero).toFixed(2)}
    </p>
  </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {rifa.premio && (
      <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl min-h-[72px]">
        <Gift className="w-5 h-5 text-yellow-500" />
        <div>
          <p className="text-xs text-slate-400">Prêmio</p>
          <p className="text-slate-200 font-medium">
            {rifa.premio}
          </p>
        </div>
      </div>
    )}

    {rifa.data_sorteio && (
      <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl min-h-[72px]">
        <Calendar className="w-5 h-5 text-blue-400" />
        <div>
          <p className="text-xs text-slate-400">Sorteio</p>
          <p className="text-slate-200 font-medium">
            {new Date(rifa.data_sorteio).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    )}

    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
      <Users className="w-5 h-5 text-emerald-400" />
      <div>
        <p className="text-xs text-slate-400">Vendidos</p>
        <p className="text-slate-200 font-medium">
          {vendidos.length} de {rifa.qtd_numeros} ({progresso}%)
        </p>
      </div>
    </div>
  </div>

  {/* Barra de Progresso */}
  <div className="mt-6">
    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
        style={{ width: `${progresso}%` }}
      />
    </div>
  </div>
</div>


            {/* Legenda */}
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 number-available rounded-md" />
                <span className="text-sm text-slate-400">Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 number-sold rounded-md" />
                <span className="text-sm text-slate-400">Vendido</span>
              </div>
            </div>

            {/* Grid de Números */}
            <GridNumeros 
              numeros={numeros} 
              vendidos={vendidos} 
              onSelectNumero={handleSelectNumero} 
            />
          </>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <ModalCompra
          numero={numeroSelecionado}
          onConfirm={handleConfirmarVenda}
          onClose={() => setModalOpen(false)}
          isLoading={isSubmitting}
        />
      )}
    </div>
  )
}