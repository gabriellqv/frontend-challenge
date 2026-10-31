/**
 * Bloco de Destaques e Newsletter com os pilares W, C, D e formulário "Antecipe-se ao próximo lançamento".
 * Conforme extraído do Figma.
 */
/**
 * Bloco Frame 122: Medalhões W, C, D e formulário "Antecipe-se ao próximo lançamento".
 * Conforme extraído do Figma.
 */
export function Newsletter() {
  return (
    <section
      aria-label="Segurança e Novidades"
      className="flex w-full max-w-[1200px] flex-col items-start bg-card p-6 sm:p-8 lg:h-[250px] lg:w-[1200px] lg:p-[32px]"
    >
      {/* Frame 100: 1154px x 202px */}
      <div className="mx-auto flex w-full flex-col justify-between gap-6 lg:h-[202px] lg:w-[1154px] lg:flex-row lg:items-start lg:gap-0">
        {/* Coluna W (Frame 22: 264.67px x 202px, px: 16px) */}
        <div className="flex flex-col items-start gap-[10px] lg:h-[202px] lg:w-[264.67px] lg:px-[16px]">
          <div className="flex flex-col items-start gap-[12px] lg:h-[202px] lg:w-[232.67px]">
            {/* Frame 91: Círculo 74x74 com W */}
            <div className="flex size-[74px] shrink-0 items-center justify-center rounded-[37px] bg-primary font-mono text-[24px] leading-[32px] font-bold text-ink">
              W
            </div>
            <h3 className="h-[16px] font-mono text-[17px] leading-[16px] font-bold text-foreground">
              Segurança da carteira
            </h3>
            <p className="w-[204px] font-mono text-[14px] leading-[22px] font-normal text-text-secondary">
              Proteja sua carteira e colecione arte digital verificada com confiança.
            </p>
          </div>
        </div>

        {/* Rectangle 36: Divisória vertical 1 (1px x 202px, #D28A4C) */}
        <div aria-hidden="true" className="hidden h-[202px] w-[1px] shrink-0 bg-primary lg:block" />

        {/* Coluna C (Frame 21: 264.67px x 202px, px: 16px) */}
        <div className="flex flex-col items-start gap-[10px] lg:h-[202px] lg:w-[264.67px] lg:px-[16px]">
          <div className="flex flex-col items-start gap-[12px] lg:h-[202px] lg:w-[232.67px]">
            {/* Frame 93: Círculo 74x74 com C */}
            <div className="flex size-[74px] shrink-0 items-center justify-center rounded-[37px] bg-primary font-mono text-[24px] leading-[32px] font-bold text-ink">
              C
            </div>
            <h3 className="h-[16px] font-mono text-[17px] leading-[16px] font-bold text-foreground">
              Criadores em destaque
            </h3>
            <p className="w-[204px] font-mono text-[14px] leading-[22px] font-normal text-text-secondary">
              Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
            </p>
          </div>
        </div>

        {/* Rectangle 38: Divisória vertical 2 (1px x 202px, #D28A4C) */}
        <div aria-hidden="true" className="hidden h-[202px] w-[1px] shrink-0 bg-primary lg:block" />

        {/* Coluna D (Frame 20: 264.67px x 202px, px: 16px) */}
        <div className="flex flex-col items-start gap-[10px] lg:h-[202px] lg:w-[264.67px] lg:px-[16px]">
          <div className="flex flex-col items-start gap-[12px] lg:h-[202px] lg:w-[232.67px]">
            {/* Frame 95: Círculo 74x74 com D */}
            <div className="flex size-[74px] shrink-0 items-center justify-center rounded-[37px] bg-primary font-mono text-[24px] leading-[32px] font-bold text-ink">
              D
            </div>
            <h3 className="h-[16px] font-mono text-[17px] leading-[16px] font-bold text-foreground">
              Alertas de lançamentos
            </h3>
            <p className="w-[204px] font-mono text-[14px] leading-[22px] font-normal text-text-secondary">
              Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.
            </p>
          </div>
        </div>

        {/* Rectangle 39: Divisória vertical 3 (1px x 202px, #D28A4C) */}
        <div aria-hidden="true" className="hidden h-[202px] w-[1px] shrink-0 bg-primary lg:block" />

        {/* Coluna Newsletter (Frame 99: 357px x 202px, px: 16px) */}
        <div className="flex flex-col items-start gap-[12px] lg:h-[202px] lg:w-[357px] lg:px-[16px]">
          {/* Frame 102: 325px x 88px, gap: 16px */}
          <div className="flex flex-col items-start gap-[16px] lg:h-[88px] lg:w-[325px]">
            <h3 className="whitespace-pre-line font-mono text-[18px] leading-[16px] font-bold text-foreground">
              Antecipe-se ao próximo{'\n'}lançamento
            </h3>
            {/* Frame 101 / Frame 98: 325px x 40px */}
            <form
              className="flex h-[40px] w-full max-w-[325px] flex-row items-center justify-between rounded-[6px] bg-surface-dark pl-[12px] shadow-[0px_0px_20px_rgba(10,6,4,0.45)]"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                placeholder="digite seu e-mail..."
                aria-label="Assinar newsletter"
                className="min-w-0 flex-1 bg-transparent font-mono text-[14px] leading-[16px] font-normal text-foreground placeholder:text-sand focus:outline-none"
              />
              {/* Frame 97: Botão Enviar (85px x 40px) */}
              <button
                type="submit"
                className="flex h-[40px] w-[85px] shrink-0 cursor-pointer flex-row items-center justify-center gap-[10px] rounded-r-[6px] bg-primary px-[4px] font-mono text-[18px] leading-[16px] font-bold text-ink transition-colors hover:bg-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Enviar
              </button>
            </form>
          </div>
          <p className="w-[325px] font-mono text-[13px] leading-[22px] font-normal text-text-secondary">
            Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
          </p>
        </div>
      </div>
    </section>
  )
}
