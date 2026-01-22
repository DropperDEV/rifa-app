import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Ticket, Gift, Calendar, Hash, DollarSign, FileText } from 'lucide-react'
import { supabase } from '../supabase'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { Spinner } from '../components/ui/Spinner'

export function NovaRifa() {
  const { user } = useAuth()
  const [form, setForm] = useState({ 
    titulo: '', 
    descricao: '',
    premio: '',
    valor_numero: '', 
    qtd_numeros: 100,
    data_sorteio: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const handleCriar = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.from('rifas').insert([{
      titulo: form.titulo,
      descricao: form.descricao || null,
      premio: form.premio || null,
      valor_numero: Number(form.valor_numero),
      qtd_numeros: Number(form.qtd_numeros),
      data_sorteio: form.data_sorteio || null,
      dono_id: user.id  // Define o usuário atual como dono
    }])
    
    if (error) {
      toast.error('Erro ao criar rifa. Tente novamente.')
      setLoading(false)
    } else {
      toast.success('Rifa criada com sucesso!')
      navigate('/')
    }
  }

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-50">Nova Rifa</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="glass-card p-6">
          <h1 className="text-2xl font-bold text-slate-50 mb-2">Criar Nova Rifa</h1>
          <p className="text-slate-400 mb-6">Preencha as informações abaixo para criar sua rifa</p>
          
          <form onSubmit={handleCriar} className="space-y-5">
            {/* Título */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">Título da Rifa *</label>
              <div className="relative">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  placeholder="Ex: iPhone 15 Pro Max" 
                  className="input-field pl-11" 
                  value={form.titulo}
                  onChange={e => updateField('titulo', e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">Descrição (opcional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <textarea 
                  placeholder="Detalhes sobre a rifa..."
                  className="input-field pl-11 min-h-[80px] resize-none" 
                  value={form.descricao}
                  onChange={e => updateField('descricao', e.target.value)} 
                  disabled={loading}
                />
              </div>
            </div>

            {/* Prêmio */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">Prêmio (opcional)</label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  placeholder="Ex: iPhone 15 Pro Max 256GB" 
                  className="input-field pl-11" 
                  value={form.premio}
                  onChange={e => updateField('premio', e.target.value)} 
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Valor */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">Valor por Número *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    placeholder="25.00" 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    className="input-field pl-11" 
                    value={form.valor_numero}
                    onChange={e => updateField('valor_numero', e.target.value)} 
                    required 
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Quantidade */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">Qtd. de Números *</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    placeholder="100" 
                    type="number" 
                    min="1"
                    max="1000"
                    className="input-field pl-11" 
                    value={form.qtd_numeros}
                    onChange={e => updateField('qtd_numeros', e.target.value)} 
                    required 
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Data Sorteio */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">Data do Sorteio (opcional)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="date"
                  className="input-field pl-11" 
                  value={form.data_sorteio}
                  onChange={e => updateField('data_sorteio', e.target.value)} 
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Criando...
                </>
              ) : (
                <>
                  <Ticket className="w-5 h-5" />
                  Criar Rifa
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}