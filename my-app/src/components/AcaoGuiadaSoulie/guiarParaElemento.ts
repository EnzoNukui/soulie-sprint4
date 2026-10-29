let limparDestaque: (() => void) | undefined

export function guiarParaElemento(id: string, idFoco = id) {
  const alvo = document.getElementById(id)
  const foco = document.getElementById(idFoco)
  if (!alvo || !foco) return

  limparDestaque?.()
  const tinhaTabIndex = foco.hasAttribute('tabindex')
  const focoNatural = foco.matches('a[href], button, input, select, textarea')
  if (!tinhaTabIndex && !focoNatural) foco.setAttribute('tabindex', '-1')

  alvo.dataset.soulieDestaque = 'true'
  alvo.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' })
  foco.focus({ preventScroll: true })

  const tempo = window.setTimeout(limpar, 4500)
  function limpar() {
    window.clearTimeout(tempo)
    delete alvo!.dataset.soulieDestaque
    if (!tinhaTabIndex && !focoNatural) foco!.removeAttribute('tabindex')
    limparDestaque = undefined
  }
  limparDestaque = limpar
}
