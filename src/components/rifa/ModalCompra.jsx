import { useState } from 'react'
import { X, Upload, User, Phone } from 'lucide-react'
import { Spinner } from '../ui/Spinner'

export function ModalCompra({ numero, onConfirm, onClose, isLoading }) {
  const [comprador, setComprador] = useState('')
  const [contato, setContato] = useState('')
  const [arquivo, setArquivo] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm({ comprador, contato, arquivo })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass-card p-6 w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-50">
            Comprar Número <span className="text-emerald-400">#{String(numero).padStart(2, '0')}</span>
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              placeholder="Nome do Comprador" 
              className="input-field pl-11" 
              value={comprador}
              onChange={e => setComprador(e.target.value)} 
              required 
              disabled={isLoading}
            />
          </div>
          
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              placeholder="WhatsApp / Contato" 
              className="input-field pl-11" 
              value={contato}
              onChange={e => setContato(e.target.value)} 
              required 
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className={`
              flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed 
              border-slate-600 rounded-xl cursor-pointer hover:border-emerald-500 
              hover:bg-slate-800/50 transition-colors
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-400">
                {arquivo ? arquivo.name : 'Anexar comprovante (opcional)'}
              </span>
              <input 
                type="file" 
                className="hidden" 
                onChange={e => setArquivo(e.target.files[0])} 
                accept="image/*"
                disabled={isLoading}
              />
            </label>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="submit" 
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Processando...
                </>
              ) : (
                'Confirmar Compra'
              )}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
