import { ArrowRight } from 'lucide-react'

/**
 * Hero da Início:
 * - Desktop: layout 1200px com headline expandida e Frame-136 em 450px
 * - Mobile: banner 366px x 190px com artes sobrepostas e texto compacto fiel ao Figma
 *
 * @returns Seção hero da página inicial.
 */
export function Hero() {
  function scrollToCatalog() {
    const el = document.getElementById('catalogo-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Mobile Hero Banner: 366px x 190px (Figma Mobile / Início) */}
      <section
        aria-labelledby="mobile-hero-title"
        className="relative mx-auto flex w-full max-w-[366px] flex-col justify-between overflow-hidden rounded-[30px] border border-[#D28A4C]/20 p-4 shadow-[0px_4px_24px_rgba(10,6,4,0.6)] md:hidden"
        style={{
          background:
            'linear-gradient(104.74deg, rgba(210, 138, 76, 0.22) 1.08%, rgba(210, 138, 76, 0.08) 99.23%), #18100C',
        }}
      >
        {/* Glow Ellipses */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 -left-16 size-48 rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(circle, rgba(221,154,95,0.45) 0%, rgba(210,138,76,0.05) 70%, transparent 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 left-20 size-48 rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(circle, rgba(221,154,95,0.38) 0%, rgba(210,138,76,0) 70%, transparent 100%)',
          }}
        />

        {/* Content Row: Text (left) + Stacked Artworks (right) */}
        <div className="relative z-10 flex items-start justify-between gap-2">
          {/* Frame 405 */}
          <div className="flex w-[190px] shrink-0 flex-col gap-1">
            <span className="font-mono text-[12px] leading-4 font-medium text-[#F5F1EB]">
              Bem-vindo à Kurio
            </span>
            <h1
              id="mobile-hero-title"
              className="font-mono text-[18px] leading-[22px] font-bold tracking-tight text-[#F5F1EB]"
            >
              SEJA DONO DA{'\n'}CULTURA DIGITAL
            </h1>
            <p className="mt-0.5 font-mono text-[12px] leading-[15px] font-normal text-[#CFB28C]">
              Descubra NFTs selecionados de criadores do mundo todo.
            </p>
            <button
              type="button"
              onClick={scrollToCatalog}
              className="mt-1 flex items-center gap-1 font-mono text-[12px] leading-[14px] font-bold text-[#E89B55] transition-opacity hover:opacity-85"
            >
              EXPLORAR
              <ArrowRight className="size-3.5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Group 105: Stacked Artworks */}
          <div className="relative flex size-[138px] shrink-0 items-center justify-end">
            <img
              src="/images/Frame-136.png"
              alt="Emerald Ape"
              width={128}
              height={128}
              className="size-[128px] rounded-[16px] border border-[#D28A4C]/30 object-cover shadow-md"
            />
            <img
              src="/images/NFT-Artwork-18.png"
              alt="Sage Nomad"
              width={54}
              height={54}
              className="absolute -bottom-1 -left-2 size-[54px] rounded-[14px] border-2 border-[#140D0A] object-cover shadow-xl"
            />
          </div>
        </div>

        {/* Frame 4: 3 dots */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 pt-2">
          <span className="size-[7px] rounded-full bg-[#D28A4C]" />
          <span className="size-[7px] rounded-full bg-[#D28A4C]" />
          <span className="size-[7px] rounded-full bg-[#D28A4C]" />
        </div>
      </section>

      {/* Desktop Hero: 1200px width */}
      <section
        aria-labelledby="hero-title"
        className="mt-8 hidden h-[450px] w-full items-center justify-between gap-[110px] pl-0 md:flex lg:pl-10"
      >
        {/* Frame 135: 600px width, 44px gap */}
        <div className="flex w-full max-w-[600px] flex-col gap-[44px] lg:w-[600px]">
          {/* Frame 134: 32px gap */}
          <div className="flex w-full flex-col gap-8">
            {/* Frame 133: 4px gap */}
            <div className="flex flex-col gap-1">
              {/* Frame 132: 8px gap */}
              <div className="flex flex-col gap-2">
                <p className="font-mono text-[14px] leading-4 font-medium tracking-[0.1em] text-foreground">
                  Bem-vindo à Kurio
                </p>
                <h1
                  id="hero-title"
                  className="font-mono text-[43px] leading-[70px] font-bold whitespace-pre-line text-foreground"
                >
                  {'SEJA DONO DO FUTURO\nDA ARTE DIGITAL'}
                </h1>
              </div>
              <p className="max-w-[557px] font-mono text-[14px] leading-6 font-normal text-text-secondary">
                Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte
                digital rara, apoie artistas e tenha uma parte da cultura da internet.
              </p>
            </div>

            {/* Frame 131: 140px x 40px EXPLORAR button */}
            <button
              type="button"
              onClick={scrollToCatalog}
              className="flex h-[40px] w-[140px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] bg-primary font-mono text-[16px] leading-5 font-bold text-ink transition-colors duration-150 hover:bg-highlight"
            >
              EXPLORAR
            </button>
          </div>

          {/* Group 4: 40px width, 3 dots of 8px */}
          <div className="flex w-10 gap-2 self-end" aria-hidden="true">
            <span className="size-2 rounded-full bg-primary" />
            <span className="size-2 rounded-full bg-primary/60" />
            <span className="size-2 rounded-full bg-primary/60" />
          </div>
        </div>

        {/* Frame 136: 450px x 450px, border-radius 24px */}
        <img
          src="/images/Frame-136.png"
          alt="Obra digital em destaque da coleção Kurio"
          width={450}
          height={450}
          className="hidden size-[450px] shrink-0 rounded-[24px] object-cover lg:block"
        />
      </section>
    </>
  )
}
