export function GridNumeros({ numeros, vendidos, onSelectNumero }) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
      {numeros.map(num => {
        const isVendido = vendidos.includes(num)
        return (
          <button
            key={num}
            disabled={isVendido}
            onClick={() => onSelectNumero(num)}
            className={`
              aspect-square flex items-center justify-center text-sm sm:text-base font-bold
              ${isVendido ? 'number-sold' : 'number-available'}
            `}
          >
            {String(num).padStart(2, '0')}
          </button>
        )
      })}
    </div>
  )
}
