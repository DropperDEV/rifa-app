import { useEffect } from 'react'

/**
 * Hook para atualizar o título da página dinamicamente
 * @param {string} title - Título da página
 * @param {string} suffix - Sufixo opcional (padrão: "RifaOrganizer")
 */
export function usePageTitle(title, suffix = 'RifaOrganizer') {
  useEffect(() => {
    const fullTitle = title ? `${title} - ${suffix}` : suffix
    document.title = fullTitle

    // Cleanup: restaurar título padrão quando o componente desmontar
    return () => {
      document.title = suffix
    }
  }, [title, suffix])
}
