'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqItem {
  question: string
  answer: string
}

interface Feature {
  icon: string
  title: string
  description: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────


const FEATURES: Feature[] = [
  {
    icon: '🗓',
    title: 'Agenda antes de você lembrar',
    description: 'Pilates, yoga, spinning. Chiara reserva seu lugar antes das vagas acabarem.',
  },
  {
    icon: '🌙',
    title: 'Entende seu ciclo',
    description: 'Ajusta sua rotina, alimentação e treino baseada na sua fase hormonal.',
  },
  {
    icon: '🧬',
    title: 'Interpreta seus exames',
    description: 'Transforma resultados de lab em ações concretas do dia a dia.',
  },
  {
    icon: '⚡',
    title: 'Monitora sua energia',
    description: 'HRV, sono, passos. Chiara sabe quando você precisa descansar antes de você saber.',
  },
]

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Para quem é a Chiara?',
    answer:
      'Para a mulher que já tentou de tudo — app de meditação, planilha de treino, lembrete de suplemento — e mesmo assim sente que saúde é mais uma coisa na lista. Chiara é pra quem se importa com o próprio corpo mas não tem energia sobrando pra gerenciar tudo sozinha.',
  },
  {
    question: 'Quais apps ela integra?',
    answer:
      'Chiara se conecta com Apple Health, WHOOP, Oura, ClassPass, WellHub e Strava — e estamos sempre adicionando novas integrações. A ideia é simples: você já usa esses apps, a Chiara só une tudo num lugar e faz o que precisa ser feito. Se tem algum app que você quer ver aqui, nos conta.',
  },
  {
    question: 'Ela substitui minha médica?',
    answer:
      'Não — e nunca vai querer. Chiara é sua assistente pessoal de saúde, não sua médica. Ela te ajuda a entender seus dados, identificar padrões, agir no dia a dia e chegar nas consultas com mais contexto. O diagnóstico é sempre da sua médica. A Chiara cuida do resto.',
  },
  {
    question: 'Quando lança?',
    answer:
      'Em breve. Estamos construindo a Chiara junto com um grupo seleto de co-criadoras — mulheres que vão moldar o produto desde o início. Se você quer estar entre as primeiras a usar, entra na lista de espera. A gente avisa assim que abrir.',
  },
]

const INTEGRATIONS = [
  {
    name: 'Apple Health',
    logo: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF2D55" />
      </svg>
    ),
  },
  {
    name: 'WHOOP',
    logo: (
      <span style={{ fontWeight: 900, fontSize: '13px', letterSpacing: '0.1em', color: '#FFFFFF', fontFamily: 'var(--font-dm-sans)' }}>
        WHOOP
      </span>
    ),
  },
  {
    name: 'Oura',
    logo: (
      <span style={{ fontWeight: 300, fontSize: '13px', letterSpacing: '0.18em', color: '#FFFFFF', fontFamily: 'var(--font-dm-sans)' }}>
        ŌURA
      </span>
    ),
  },
  {
    name: 'ClassPass',
    logo: (
      <span style={{ fontWeight: 700, fontSize: '11px', color: '#2962FF', fontFamily: 'var(--font-dm-sans)' }}>
        classpass
      </span>
    ),
  },
  {
    name: 'WellHub',
    logo: (
      <span style={{ fontWeight: 700, fontSize: '11px', color: '#FF4A6B', fontFamily: 'var(--font-dm-sans)' }}>
        wellhub
      </span>
    ),
  },
  {
    name: 'Strava',
    logo: (
      <span style={{ fontWeight: 900, fontSize: '13px', letterSpacing: '-0.02em', color: '#FC4C02', fontFamily: 'var(--font-dm-sans)' }}>
        STRAVA
      </span>
    ),
  },
  {
    name: 'Clue',
    logo: (
      <span style={{ fontWeight: 600, fontSize: '13px', color: '#E84040', fontFamily: 'var(--font-dm-sans)' }}>
        Clue
      </span>
    ),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeCard, setActiveCard] = useState(0)
  const [displayedCard, setDisplayedCard] = useState(0)
  const [chatOpacity, setChatOpacity] = useState(1)

  const sectionRef = useRef<HTMLDivElement>(null)
  const animatedSet = useRef<Set<Element>>(new Set())

  // Nav scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Demo: scroll → activeCard
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const scrolled = -rect.top
      if (scrolled < 0) { setActiveCard(0); return }
      const progress = scrolled / sectionRef.current.offsetHeight
      // 400vh total: 100vh para mostrar, 300vh para 3 conversas (~100vh cada)
      if (progress < 0.33) setActiveCard(0)
      else if (progress < 0.66) setActiveCard(1)
      else setActiveCard(2)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Demo: fade out → troca conversa → fade in
  useEffect(() => {
    if (activeCard === displayedCard) return
    setChatOpacity(0)
    const t = setTimeout(() => {
      setDisplayedCard(activeCard)
      setChatOpacity(1)
    }, 200)
    return () => clearTimeout(t)
  }, [activeCard, displayedCard])

  // Global fade-in — inline styles para garantir prioridade no cascade
  useEffect(() => {
    const animate = (el: Element) => {
      if (animatedSet.current.has(el)) return
      animatedSet.current.add(el)
      const htmlEl = el as HTMLElement
      const delay = Number(htmlEl.dataset.delay ?? 0)
      // Duplo RAF garante que o browser pintou opacity:0 antes de iniciar a transição
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          htmlEl.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
          htmlEl.style.opacity = '1'
          htmlEl.style.transform = 'translateY(0)'
        })
      })
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) animate(entry.target)
      }),
      { threshold: 0.05 },
    )

    const els = document.querySelectorAll('[data-animate]')
    els.forEach((el) => observer.observe(el))

    // Elementos já visíveis na viewport ao carregar
    els.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight) animate(el)
    })

    return () => observer.disconnect()
  }, [])


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome || !email) return
    setLoading(true)
    const { error } = await supabase
      .from('waitlist')
      .insert([{ nome, email }])
    setLoading(false)
    if (error) {
      if (error.code === '23505') {
        alert('Esse email já está na lista!')
      } else {
        alert('Erro ao cadastrar. Tenta de novo.')
      }
    } else {
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0D0B0E', color: '#F5F0EC' }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(13, 11, 14, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(196, 122, 138, 0.15)' : 'none',
        }}
      >
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-5">
          <span
            className="text-2xl italic tracking-wide"
            style={{ fontFamily: 'var(--font-playfair)', color: '#F5F0EC' }}
          >
            chiara
          </span>
          <a
            href="#co-criadora"
            className="rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #C47A8A 0%, #8B3A52 100%)',
              color: '#F5F0EC',
            }}
          >
            Entrar na lista de espera
          </a>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20"
        style={{ background: '#0D0B0E' }}
      >
        {/* Background video */}
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Gradient overlay sobre o vídeo */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(196,122,138,0.6) 0%, rgba(139,58,82,0.55) 40%, rgba(45,20,32,0.7) 75%, rgba(13,11,14,0.92) 100%)',
          }}
        />
        {/* Noise texture overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
            opacity: 0.6,
          }}
        />

        {/* Glow orbs */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #C47A8A 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #E8C4B0 0%, transparent 70%)', filter: 'blur(80px)' }}
        />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div
            data-animate
            className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ color: '#E8C4B0' }}>✦</span>
            <span style={{ color: '#F5F0EC' }}>Assistente de saúde com IA</span>
          </div>

          {/* Headline */}
          <h1
            data-animate
            data-delay="150"
            className="shimmer-hero mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ fontFamily: 'var(--font-playfair)', lineHeight: '1.15' }}
          >
            Cuidar da sua saúde não deveria ser um segundo emprego.
          </h1>

          {/* Subheadline */}
          <p
            data-animate
            data-delay="300"
            className="mx-auto mb-10 max-w-xl text-lg leading-relaxed sm:text-xl"
            style={{ color: 'rgba(245, 240, 236, 0.8)' }}
          >
            Chiara conecta seus wearables, agenda suas aulas e te entrega os insights que você
            realmente precisa — tudo pelo chat.
          </p>

          {/* CTA */}
          <div data-animate data-delay="450">
            <a
              href="#co-criadora"
              className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                background: 'rgba(245, 240, 236, 0.95)',
                color: '#2D1420',
                boxShadow: '0 0 40px rgba(196, 122, 138, 0.3)',
              }}
            >
              <span style={{ color: '#8B3A52' }}>✦</span>
              Entrar na lista de espera
            </a>
          </div>

          {/* Scroll hint */}
          <div className="scroll-hint mt-16 flex flex-col items-center gap-2">
            <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(245, 240, 236, 0.4)' }}>
              scroll
            </span>
            <div
              className="h-8 w-px"
              style={{ background: 'linear-gradient(to bottom, rgba(245, 240, 236, 0.4), transparent)' }}
            />
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ────────────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ background: '#0D0B0E' }}>
        <div className="mx-auto max-w-screen-xl">
          <p
            data-animate
            className="mb-10 text-center text-sm font-medium uppercase tracking-widest"
            style={{ color: '#8A8A9A' }}
          >
            Chiara se conecta com o que você já usa
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {INTEGRATIONS.map((integration, i) => (
              <div
                key={integration.name}
                data-animate
                data-delay={`${i * 60}`}
                className="cursor-default transition-all duration-300"
                style={{
                  padding: '8px 20px',
                  borderRadius: '50px',
                  background: 'rgba(196, 122, 138, 0.08)',
                  border: '1px solid rgba(196, 122, 138, 0.3)',
                  fontSize: '14px',
                  color: '#F5F0EC',
                  fontFamily: 'var(--font-dm-sans)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(196, 122, 138, 0.18)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(196, 122, 138, 0.08)'
                }}
              >
                {integration.name}
              </div>
            ))}
            <div
              data-animate
              data-delay={`${INTEGRATIONS.length * 60}`}
              className="cursor-default transition-all duration-300"
              style={{
                padding: '8px 20px',
                borderRadius: '50px',
                background: 'transparent',
                border: '1px dashed rgba(196, 122, 138, 0.4)',
                fontSize: '14px',
                color: 'rgba(196, 122, 138, 0.7)',
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              e mais +
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO ────────────────────────────────────────────────────────── */}
      {(() => {
        const CONVOS = [
          {
            user: 'agenda meu pilates toda terça antes das vagas acabarem',
            chiara: 'feito! agendei pra amanhã e vou repetir toda semana 💪 quer que eu adicione ao seu calendário também?',
          },
          {
            user: 'to na fase lútea, to com vontade de comer tudo',
            chiara: 'faz sentido. progesterona alta aumenta o apetite. que tal um lanche rico em magnésio? vou te mandar 3 opções próximas de você.',
          },
          {
            user: 'cancela minha aula de amanhã, to me sentindo péssima',
            chiara: 'cancelado. baseado no seu HRV de hoje (38ms), faz total sentido descansar. reagendo pra sexta?',
          },
        ]
        const conv = CONVOS[displayedCard]

        return (
          <section
            ref={sectionRef}
            style={{
              height: '400vh',
              position: 'relative',
              background: 'linear-gradient(180deg, #0D0B0E 0%, #120D16 50%, #0D0B0E 100%)',
            }}
          >
            {/* Sticky wrapper — título + mockup + dots juntos na viewport */}
            <div
              style={{
                position: 'sticky',
                top: '0',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '32px',
              }}
            >
              {/* Título dentro do sticky */}
              <div style={{ textAlign: 'center' }}>
                <span className="text-sm font-medium uppercase tracking-widest" style={{ color: '#C47A8A' }}>
                  ✦ como funciona
                </span>
                <h2
                  className="mt-2 text-2xl font-semibold sm:text-3xl"
                  style={{ fontFamily: 'var(--font-playfair)', color: '#F5F0EC' }}
                >
                  Só manda mensagem.
                </h2>
              </div>
              {/* Glow */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                  className="h-96 w-96 rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle, #C47A8A 0%, transparent 70%)', filter: 'blur(100px)' }}
                />
              </div>

              {/* iPhone mockup */}
              <div
                className="relative z-10 overflow-hidden"
                style={{
                  width: 'min(420px, calc(100vw - 48px))',
                  height: '680px',
                  borderRadius: '44px',
                  background: '#0A0810',
                  border: '2px solid rgba(196, 122, 138, 0.35)',
                  boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Status bar */}
                <div className="flex shrink-0 items-center justify-between px-6 pt-4 pb-1" style={{ fontSize: '10px', color: '#F5F0EC' }}>
                  <span>9:41</span>
                  <div className="h-2 w-4 rounded-sm" style={{ background: '#F5F0EC', opacity: 0.8 }} />
                </div>

                {/* Dynamic island */}
                <div className="flex shrink-0 justify-center pb-1">
                  <div className="h-6 w-20 rounded-full" style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>

                {/* Chat header */}
                <div
                  className="flex shrink-0 items-center gap-3 px-4 py-2"
                  style={{ borderBottom: '1px solid rgba(196, 122, 138, 0.15)' }}
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ background: 'linear-gradient(135deg, #C47A8A, #8B3A52)', color: '#F5F0EC', fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}
                  >
                    c
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#F5F0EC', fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}>chiara</p>
                    <p className="text-[9px]" style={{ color: '#C47A8A' }}>online agora</p>
                  </div>
                </div>

                {/* Mensagens — fade entre conversas */}
                <div
                  className="flex flex-1 flex-col gap-2.5 overflow-hidden px-3 pt-3 pb-2"
                  style={{
                    opacity: chatOpacity,
                    transition: chatOpacity === 0 ? 'opacity 0.2s ease' : 'opacity 0.3s ease',
                  }}
                >
                  {/* Msg usuária */}
                  <div className="flex justify-end">
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '9px 13px',
                        borderRadius: '18px 18px 4px 18px',
                        background: 'rgba(196, 122, 138, 0.25)',
                        color: '#F5F0EC',
                        fontSize: '11px',
                        lineHeight: '1.55',
                        border: '1px solid rgba(196, 122, 138, 0.2)',
                      }}
                    >
                      {conv.user}
                    </div>
                  </div>

                  {/* Msg Chiara */}
                  <div className="flex items-end gap-1.5">
                    <div
                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[8px]"
                      style={{ background: 'linear-gradient(135deg, #C47A8A, #8B3A52)', color: '#F5F0EC', fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}
                    >
                      c
                    </div>
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '9px 13px',
                        borderRadius: '18px 18px 18px 4px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#F5F0EC',
                        fontSize: '11px',
                        lineHeight: '1.55',
                        border: '1px solid rgba(196, 122, 138, 0.18)',
                      }}
                    >
                      {conv.chiara}
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div
                  className="mx-3 mb-3 mt-1 flex shrink-0 items-center gap-2 rounded-full px-4 py-2"
                  style={{ background: '#1A1720', border: '1px solid rgba(196, 122, 138, 0.2)' }}
                >
                  <span className="flex-1 text-[10px]" style={{ color: '#8A8A9A' }}>Manda uma mensagem...</span>
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ background: 'linear-gradient(135deg, #C47A8A, #8B3A52)' }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M4 1L7 4L4 7M7 4H1" stroke="#F5F0EC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div className="relative z-10 flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: activeCard === i ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background: activeCard === i ? '#C47A8A' : 'rgba(196, 122, 138, 0.3)',
                      transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        )
      })()}

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ background: '#0D0B0E' }}>
        <div className="mx-auto max-w-screen-xl">
          <div data-animate className="mb-4 text-center">
            <span className="text-sm font-medium uppercase tracking-widest" style={{ color: '#C47A8A' }}>
              ✦ o que a chiara faz
            </span>
          </div>
          <h2
            data-animate
            data-delay="100"
            className="mb-16 text-center text-3xl font-semibold sm:text-4xl"
            style={{ fontFamily: 'var(--font-playfair)', color: '#F5F0EC' }}
          >
            Tudo que você precisava,
            <br />
            <em>sem precisar pedir.</em>
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                data-animate
                data-delay={`${i * 100}`}
                className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-default"
                style={{
                  background: '#1A1720',
                  border: '1px solid rgba(196, 122, 138, 0.2)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(196, 122, 138, 0.12)' }}
                >
                  {feature.icon}
                </div>
                <h3
                  className="mb-2 text-base font-semibold leading-snug"
                  style={{ color: '#F5F0EC', fontFamily: 'var(--font-playfair)' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8A8A9A' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-24" style={{ background: '#100E14' }}>
        <div className="mx-auto max-w-2xl">
          <div data-animate className="mb-4 text-center">
            <span className="text-sm font-medium uppercase tracking-widest" style={{ color: '#C47A8A' }}>
              ✦ dúvidas frequentes
            </span>
          </div>
          <h2
            data-animate
            data-delay="100"
            className="mb-12 text-center text-3xl font-semibold sm:text-4xl"
            style={{ fontFamily: 'var(--font-playfair)', color: '#F5F0EC' }}
          >
            Perguntas
          </h2>

          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={item.question}
                data-animate
                data-delay={`${i * 80}`}
                className="overflow-hidden rounded-2xl transition-all duration-300"
                style={{
                  background: '#1A1720',
                  border: `1px solid ${openFaq === i ? 'rgba(196, 122, 138, 0.45)' : 'rgba(196, 122, 138, 0.15)'}`,
                }}
              >
                <button
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-all duration-200 hover:opacity-90"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="pr-4 text-sm font-medium sm:text-base" style={{ color: '#F5F0EC' }}>
                    {item.question}
                  </span>
                  <span
                    className="flex-shrink-0 text-lg transition-transform duration-300"
                    style={{
                      color: '#C47A8A',
                      transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-500"
                  style={{ maxHeight: openFaq === i ? '200px' : '0px' }}
                >
                  <p className="px-6 pb-6" style={{ color: '#A89898', fontSize: '15px', lineHeight: '1.8' }}>
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CO-CRIADORA FORM ─────────────────────────────────────────────── */}
      <section
        id="co-criadora"
        className="relative overflow-hidden px-6 py-28"
        style={{
          background: 'linear-gradient(160deg, #E8C4B0 0%, #C47A8A 45%, #8B3A52 80%, #2D1420 100%)',
        }}
      >
        {/* Texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 80px)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-xl text-center">
          <div data-animate>
            <span
              className="mb-4 inline-block text-sm font-medium uppercase tracking-widest"
              style={{ color: 'rgba(45, 20, 32, 0.7)' }}
            >
              ✦ lista de co-criadoras
            </span>
          </div>
          <h2
            data-animate
            data-delay="100"
            className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-playfair)', color: '#2D1420' }}
          >
            A gente quer construir isso com você
          </h2>
          <p
            data-animate
            data-delay="200"
            className="mb-10 text-base leading-relaxed sm:text-lg"
            style={{ color: 'rgba(45, 20, 32, 0.75)' }}
          >
            Entre para a lista de co-criadoras e seja das primeiras a usar a Chiara.
          </p>

          {submitted ? (
            <div className="bubble-in text-center">
              <p
                className="mb-3 text-2xl italic"
                style={{ color: '#2D1420', fontFamily: 'var(--font-playfair)' }}
              >
                ✦ Você está na lista!
              </p>
              <p className="text-base leading-relaxed" style={{ color: 'rgba(45, 20, 32, 0.75)' }}>
                A gente te avisa assim que abrir. Obrigada por acreditar na Chiara.
              </p>
            </div>
          ) : (
            <form
              data-animate
              data-delay="300"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                placeholder="Seu nome"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl px-5 py-4 text-sm outline-none transition-all duration-300 focus:ring-2"
                style={{
                  background: 'rgba(45, 20, 32, 0.12)',
                  border: '1px solid rgba(45, 20, 32, 0.25)',
                  color: '#2D1420',
                  caretColor: '#8B3A52',
                }}
              />
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-5 py-4 text-sm outline-none transition-all duration-300 focus:ring-2"
                style={{
                  background: 'rgba(45, 20, 32, 0.12)',
                  border: '1px solid rgba(45, 20, 32, 0.25)',
                  color: '#2D1420',
                  caretColor: '#8B3A52',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
                style={{
                  background: '#FFFFFF',
                  color: '#2D1420',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'
                }}
              >
                {loading ? 'Entrando...' : 'Quero ser co-criadora'}
              </button>
              <p className="text-xs" style={{ color: 'rgba(45, 20, 32, 0.55)' }}>
                Ao se inscrever, você concorda com nossa Política de Privacidade.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-6 py-28"
        style={{ background: '#0D0B0E' }}
      >
        {/* Decorative phone */}
        <div
          className="pointer-events-none absolute -left-12 top-1/2 -translate-y-1/2 opacity-15 sm:opacity-20 hidden sm:block"
          aria-hidden
        >
          <div
            style={{
              width: '200px',
              height: '400px',
              borderRadius: '40px',
              background: 'linear-gradient(135deg, #1A1720, #0D0B0E)',
              border: '2px solid rgba(196, 122, 138, 0.3)',
              transform: 'rotate(-12deg)',
            }}
          />
        </div>

        {/* Glow */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div
            className="h-96 w-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(196,122,138,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <div data-animate>
            <span className="text-sm font-medium uppercase tracking-widest" style={{ color: '#C47A8A' }}>
              ✦ em breve
            </span>
          </div>
          <h2
            data-animate
            data-delay="100"
            className="my-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
            style={{ fontFamily: 'var(--font-playfair)', color: '#F5F0EC' }}
          >
            Pronta quando você estiver.
          </h2>
          <p
            data-animate
            data-delay="200"
            className="mb-10 text-lg leading-relaxed"
            style={{ color: '#8A8A9A' }}
          >
            A primeira assistente de saúde com IA que realmente age.
            <br />
            Deixa a Chiara cuidar da sua saúde.
          </p>
          <div data-animate data-delay="300">
            <a
              href="#co-criadora"
              className="inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #C47A8A 0%, #8B3A52 100%)',
                color: '#F5F0EC',
                boxShadow: '0 0 40px rgba(196, 122, 138, 0.25)',
              }}
            >
              <span>✦</span>
              Entrar na lista de espera
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-12"
        style={{
          background: '#0A0810',
          borderTop: '1px solid rgba(196, 122, 138, 0.12)',
        }}
      >
        <div className="mx-auto max-w-screen-xl">
          <div className="mb-10 flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
            <span
              className="text-2xl italic tracking-wide"
              style={{ fontFamily: 'var(--font-playfair)', color: '#F5F0EC' }}
            >
              chiara
            </span>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 sm:justify-end">
              {['O que esperar', 'Por que existimos', 'Sobre', 'Contato', 'FAQ'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm transition-colors duration-200 hover:opacity-90"
                  style={{ color: '#8A8A9A' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#C47A8A')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#8A8A9A')}
                >
                  {link}
                </a>
              ))}
            </nav>
          </div>

          <div
            className="flex flex-col items-center gap-3 pt-8 sm:flex-row sm:justify-between"
            style={{ borderTop: '1px solid rgba(196, 122, 138, 0.1)' }}
          >
            <p className="text-xs" style={{ color: '#8A8A9A' }}>
              © 2025 Chiara. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              {['Termos', 'Privacidade'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs transition-colors duration-200"
                  style={{ color: '#8A8A9A' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#C47A8A')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#8A8A9A')}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
