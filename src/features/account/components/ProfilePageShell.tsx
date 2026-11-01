import type { ReactNode } from 'react'

import { AccountSidebar } from './AccountSidebar'

/** Layout da área de perfil: sidebar da conta + conteúdo. */
export function ProfilePageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1248px] flex-col px-4 py-8 pb-24 sm:px-6">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-[28px] lg:flex-row">
        <AccountSidebar active="profile" />
        <div className="min-w-0 flex-1">
          <h1 className="mb-6 font-mono text-2xl font-bold text-ink">Perfil do colecionador</h1>
          {children}
        </div>
      </div>
    </div>
  )
}
