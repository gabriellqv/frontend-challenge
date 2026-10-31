/**
 * Hero da Início: bem-vindo, headline, descrição, CTA e arte em destaque.
 * Medidas extraídas do Figma (`specs/desktop-in-cio.json`).
 *
 * @returns Seção hero da página inicial.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="mt-8 flex h-[450px] w-full items-center justify-between gap-[110px] pl-0 lg:pl-10"
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
            onClick={() => {
              const el = document.getElementById('catalogo-section')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            className="flex h-[40px] w-[140px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] bg-primary font-mono text-[16px] leading-5 font-bold text-ink transition-colors duration-150 hover:bg-highlight"
          >
            EXPLORAR
          </button>
        </div>

        {/* Group 4: 40px width, 3 dots of 8px (align-items: flex-end in Frame 135, left: 560px) */}
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
  )
}
