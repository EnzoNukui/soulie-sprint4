import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import avatar from '../../assets/avatar/expressoes/avatar_sorridente.png'
import type { TutorialSoulie } from './TutorialSoulieContext'

interface Props {
  tutorial: TutorialSoulie
  indice: number
  mudarEtapa: (deslocamento: number) => void
  encerrar: () => void
}

interface Area { top: number; left: number; width: number; height: number }

function obterJanela() {
  const janela = window.visualViewport
  return { largura: janela?.width ?? window.innerWidth, altura: janela?.height ?? window.innerHeight, topo: janela?.offsetTop ?? 0 }
}

export default function TutorialSoulieOverlay({ tutorial, indice, mudarEtapa, encerrar }: Props) {
  const etapa = tutorial.etapas[indice]
  const [alvo, setAlvo] = useState<Area | null>(null)
  const [janela, setJanela] = useState(obterJanela)
  const [alturaCartao, setAlturaCartao] = useState(230)
  const [demorando, setDemorando] = useState(false)
  const cartaoRef = useRef<HTMLElement>(null)
  const tituloRef = useRef<HTMLHeadingElement>(null)

  useLayoutEffect(() => {
    etapa.preparar?.()
    let elemento: HTMLElement | null = null
    let removerClique: (() => void) | undefined
    const redimensionamento = new ResizeObserver(atualizar)

    function atualizar() {
      setJanela(obterJanela())
      if (!elemento?.isConnected) return
      const area = elemento.getBoundingClientRect()
      setAlvo({ top: area.top, left: area.left, width: area.width, height: area.height })
    }

    function localizar() {
      if (elemento && !elemento.isConnected) { encerrar(); return }
      if (elemento) { atualizar(); return }
      const encontrado = document.getElementById(etapa.alvo)
      if (!encontrado) return
      elemento = encontrado
      elemento.scrollIntoView({ behavior: 'instant', block: window.innerWidth < 640 ? 'start' : 'center', inline: 'nearest' })
      redimensionamento.observe(elemento)
      if (etapa.avancarAoClicar || etapa.encerrarAoClicar) {
        const avancar = () => queueMicrotask(() => etapa.encerrarAoClicar ? encerrar() : mudarEtapa(1))
        elemento.addEventListener('click', avancar)
        removerClique = () => elemento?.removeEventListener('click', avancar)
      }
      atualizar()
      tituloRef.current?.focus({ preventScroll: true })
    }

    const mudancas = new MutationObserver(localizar)
    mudancas.observe(document.body, { childList: true, subtree: true })
    const quadro = requestAnimationFrame(localizar)
    const espera = window.setTimeout(() => setDemorando(true), 8000)
    window.addEventListener('resize', atualizar)
    window.addEventListener('scroll', atualizar, true)
    window.visualViewport?.addEventListener('resize', atualizar)
    window.visualViewport?.addEventListener('scroll', atualizar)
    return () => {
      cancelAnimationFrame(quadro)
      window.clearTimeout(espera)
      mudancas.disconnect()
      redimensionamento.disconnect()
      removerClique?.()
      window.removeEventListener('resize', atualizar)
      window.removeEventListener('scroll', atualizar, true)
      window.visualViewport?.removeEventListener('resize', atualizar)
      window.visualViewport?.removeEventListener('scroll', atualizar)
    }
  }, [etapa, encerrar, mudarEtapa])

  useLayoutEffect(() => {
    const cartao = cartaoRef.current
    if (!cartao) return
    const observador = new ResizeObserver(() => setAlturaCartao(cartao.getBoundingClientRect().height))
    observador.observe(cartao)
    return () => observador.disconnect()
  }, [])

  useEffect(() => {
    function aoTeclar(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      encerrar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [encerrar])

  const largura = Math.min(320, janela.largura - 32)
  const margemInferior = janela.largura < 1024 ? 88 : 16
  const limiteInferior = Math.max(janela.topo + 16, janela.topo + janela.altura - alturaCartao - margemInferior)
  let esquerda = janela.largura - largura - 16
  let topo = limiteInferior
  if (alvo) {
    const direita = alvo.left + alvo.width + 18
    const esquerdaDoAlvo = alvo.left - largura - 18
    if (direita + largura <= janela.largura - 16 || esquerdaDoAlvo >= 16) {
      esquerda = direita + largura <= janela.largura - 16 ? direita : esquerdaDoAlvo
      topo = alvo.top + (alvo.height - alturaCartao) / 2
    } else {
      esquerda = alvo.left + (alvo.width - largura) / 2
      const abaixo = alvo.top + alvo.height + 18
      topo = abaixo + alturaCartao <= janela.topo + janela.altura - margemInferior ? abaixo : alvo.top - alturaCartao - 18
    }
  }
  esquerda = Math.max(16, Math.min(esquerda, janela.largura - largura - 16))
  topo = Math.max(janela.topo + 16, Math.min(topo, limiteInferior))
  const ultimo = indice === tutorial.etapas.length - 1

  return createPortal(
    <>
      {alvo && <div aria-hidden="true" data-soulie-spotlight className="pointer-events-none fixed z-[70] rounded-xl border-2 border-violet-400 shadow-[0_0_0_9999px_rgba(24,24,27,0.18)]" style={{ top: alvo.top - 5, left: alvo.left - 5, width: alvo.width + 10, height: alvo.height + 10 }} />}
      <section
        ref={cartaoRef}
        role="dialog"
        aria-label={'Tutorial: ' + tutorial.titulo}
        aria-describedby="soulie-tutorial-descricao"
        data-soulie-tutorial
        className="soulie-guia-trilha fixed z-[80] max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_16px_50px_-18px_rgba(46,16,101,0.3)]"
        style={{ width: largura, top: topo, left: esquerda, maxHeight: Math.max(120, janela.altura - margemInferior - 32) }}
      >
        <header className="flex items-start gap-2.5">
          <img src={tutorial.imagem ?? avatar} alt="" className="h-11 w-11 shrink-0 object-contain" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-violet-600">{tutorial.titulo} · {indice + 1}/{tutorial.etapas.length}</p>
            <h2 ref={tituloRef} tabIndex={-1} className="mt-1 text-sm font-semibold leading-5 text-zinc-900 outline-none">{alvo ? etapa.titulo : 'Preparando este passo'}</h2>
          </div>
          <button type="button" onClick={encerrar} aria-label="Sair do tutorial" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-violet-600"><X aria-hidden="true" className="h-4 w-4" /></button>
        </header>
        <p id="soulie-tutorial-descricao" aria-live="polite" className="mt-3 text-xs leading-5 text-zinc-600">{alvo ? etapa.descricao : demorando ? 'A tela ainda está carregando. Aguarde ou volte para tentar de novo.' : 'Aguarde um instante enquanto encontro o campo na tela.'}</p>
        {alvo && etapa.exemplo && <p className="mt-2 rounded-lg bg-violet-50 px-3 py-2 text-xs leading-5 text-violet-800">{etapa.exemplo}</p>}
        <div aria-hidden="true" className="mt-4 flex gap-1">{tutorial.etapas.map((_, posicao) => <span key={posicao} className={'h-1 flex-1 rounded-full ' + (posicao <= indice ? 'bg-violet-500' : 'bg-zinc-100')} />)}</div>
        <footer className="mt-3 flex items-center justify-between gap-2">
          <button type="button" onClick={() => mudarEtapa(-1)} disabled={indice === 0} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:invisible focus-visible:outline-2 focus-visible:outline-violet-600"><ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Voltar</button>
          <button type="button" disabled={!alvo} onClick={() => ultimo ? encerrar() : mudarEtapa(1)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-violet-600 px-3.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">{ultimo ? 'Entendi' : etapa.rotuloProximo ?? 'Próximo'}{ultimo ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />}</button>
        </footer>
      </section>
    </>, document.body,
  )
}
