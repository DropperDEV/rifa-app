import { Link } from 'react-router-dom'
import { Ticket, Calendar, Gift } from 'lucide-react'

export function RifaCard({ rifa, vendidos = 0 }) {
  const progresso = rifa.qtd_numeros > 0 ? (vendidos / rifa.qtd_numeros) * 100 : 0
  
  return (
    <Link to={`/rifa/${rifa.id}`} className="block">
      <div className="glass-card p-5 hover:bg-slate-700/50 transition-all duration-300 hover:scale-[1.02] group">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-50 group-hover:text-emerald-400 transition-colors">
            {rifa.titulo}
          </h3>
          <Ticket className="w-5 h-5 text-emerald-500 shrink-0" />
        </div>
        
        {rifa.premio && (
          <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
            <Gift className="w-4 h-4 text-yellow-500" />
            <span>{rifa.premio}</span>
          </div>
        )}
        
        {rifa.data_sorteio && (
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Calendar className="w-4 h-4" />
            <span>{new Date(rifa.data_sorteio).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Vendidos</span>
            <span className="text-emerald-400 font-medium">{vendidos}/{rifa.qtd_numeros}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <span className="text-slate-400 text-sm">Por número</span>
          <span className="text-xl font-bold text-emerald-400">
            R$ {Number(rifa.valor_numero).toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  )
}
