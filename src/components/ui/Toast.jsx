import { CheckCircle, XCircle, Info } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

const styles = {
  success: 'bg-emerald-500/90 border-emerald-400',
  error: 'bg-rose-500/90 border-rose-400',
  info: 'bg-blue-500/90 border-blue-400',
}

export function Toast({ message, type = 'success' }) {
  const Icon = icons[type]
  
  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm
      shadow-lg animate-slide-up min-w-[280px] max-w-[400px]
      ${styles[type]}
    `}>
      <Icon className="w-5 h-5 text-white shrink-0" />
      <span className="text-white font-medium text-sm">{message}</span>
    </div>
  )
}
