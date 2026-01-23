import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Ticket, Plus, Sparkles, LogOut, Users, Settings, Lock, X, Loader2 } from 'lucide-react'
import { NovaRifa } from './pages/NovaRifa'
import { RifaDetalhe } from './pages/RifaDetalhe'
import { RifaAdmin } from './pages/RifaAdmin'
import { LoginPage } from './pages/LoginPage'
import { UpdatePassword } from './pages/UpdatePassword'
import { RifaCard } from './components/rifa/RifaCard'
import { SkeletonCard } from './components/ui/Skeleton'
import { MeusConvites } from './components/MeusConvites'
import { ToastProvider, useToast } from './contexts/ToastContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { supabase } from './supabase'
import { usePageTitle } from './hooks/usePageTitle'

function Home() {
  usePageTitle('Dashboard')
  const { user, signOut } = useAuth()
  const toast = useToast()
  const [minhasRifas, setMinhasRifas] = useState([])
  const [rifasParceiras, setRifasParceiras] = useState([])
  const [vendidos, setVendidos] = useState({})
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  useEffect(() => {
    if (user) carregarRifas()
  }, [user])

  async function carregarRifas() {
    setLoading(true)
    

    
    // 1. Tenta carregar rifas do usuário (como dono)
    // Adicionei 'error' na desestruturação para ver se o Supabase reclama de algo
    const { data: minhas, error: erroMinhas } = await supabase
      .from('rifas')
      .select('*')
      .eq('dono_id', user.id)
      .order('created_at', { ascending: false })
    
   

    // 2. Carregar rifas onde é vendedor
    const { data: vendedorEm, error: erroVendedor } = await supabase
      .from('rifa_vendedores')
      .select('rifa_id')
      .eq('user_id', user.id)
    
    
    let parceiras = []
    if (vendedorEm && vendedorEm.length > 0) {
      const ids = vendedorEm.map(v => v.rifa_id)
      const { data } = await supabase
        .from('rifas')
        .select('*')
        .in('id', ids)
        .order('created_at', { ascending: false })
      parceiras = data || []
    }
    
    setMinhasRifas(minhas || [])
    setRifasParceiras(parceiras)
    
    // ... restante da lógica de contagem ...
    const todasRifas = [...(minhas || []), ...parceiras]
    const counts = {}
    for (const rifa of todasRifas) {
      const { count } = await supabase
        .from('bilhetes')
        .select('*', { count: 'exact', head: true })
        .eq('rifa_id', rifa.id)
      counts[rifa.id] = count || 0
    }
    setVendidos(counts)
    setLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    
    if (!currentPassword || !newPassword) {
      toast.error('Preencha todos os campos')
      return
    }

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres')
      return
    }

    setUpdatingPassword(true)

    try {
      // Passo 1: Validar senha atual fazendo login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

      if (signInError) {
        toast.error('Senha atual incorreta')
        setUpdatingPassword(false)
        return
      }

      // Passo 2: Se o login foi bem-sucedido, atualizar a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        throw updateError
      }

      // Sucesso
      toast.success('Senha atualizada com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setSettingsOpen(false)
    } catch (error) {
      console.error('Erro ao atualizar senha:', error)
      toast.error('Erro ao atualizar senha. Tente novamente.')
    } finally {
      setUpdatingPassword(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-50">RifaOrganizer</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:block">{user?.email}</span>
            <Link to="/nova" className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Rifa</span>
            </Link>
            <button 
              onClick={() => setSettingsOpen(true)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Configurações"
            >
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Gerencie suas rifas de forma simples</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-4">
          Dashboard
        </h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Crie, gerencie e acompanhe todas as suas rifas em um só lugar
        </p>
      </section>

      {/* Meus Convites Pendentes */}
      <MeusConvites  onUpdate={carregarRifas} />

      {/* Minhas Rifas */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-emerald-400" />
          Minhas Rifas
        </h3>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : minhasRifas.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-slate-300 mb-2">Nenhuma rifa criada</h4>
            <p className="text-slate-500 mb-4 text-sm">Crie sua primeira rifa para começar!</p>
            <Link to="/nova" className="btn-primary inline-flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Criar Rifa
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {minhasRifas.map(rifa => (
              <RifaCard key={rifa.id} rifa={rifa} vendidos={vendidos[rifa.id] || 0} />
            ))}
          </div>
        )}
      </section>

      {/* Rifas Parceiras */}
      {rifasParceiras.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Rifas Parceiras
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Vendedor</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rifasParceiras.map(rifa => (
              <RifaCard key={rifa.id} rifa={rifa} vendidos={vendidos[rifa.id] || 0} />
            ))}
          </div>
        </section>
      )}

      {/* Modal de Configurações */}
      {settingsOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => !updatingPassword && setSettingsOpen(false)}
        >
          <div 
            className="glass-card p-6 w-full max-w-md animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-50">Configurações</h2>
              </div>
              <button
                onClick={() => !updatingPassword && setSettingsOpen(false)}
                disabled={updatingPassword}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Formulário de Troca de Senha */}
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                  Senha Atual
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-field pl-11"
                    placeholder="Digite sua senha atual"
                    required
                    disabled={updatingPassword}
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                  Nova Senha
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pl-11"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    disabled={updatingPassword}
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="btn-primary w-full justify-center py-2.5 relative overflow-hidden group"
              >
                <span className={`flex items-center gap-2 ${updatingPassword ? 'opacity-0' : 'opacity-100'}`}>
                  <Lock className="w-4 h-4" />
                  Atualizar Senha
                </span>
                {updatingPassword && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/nova" element={<ProtectedRoute><NovaRifa /></ProtectedRoute>} />
            <Route path="/rifa/:id" element={<ProtectedRoute><RifaDetalhe /></ProtectedRoute>} />
            <Route path="/rifa/:id/admin" element={<ProtectedRoute><RifaAdmin /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}