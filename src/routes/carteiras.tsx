import { useEffect, useRef, useState } from 'react'

import { Link, createFileRoute, redirect } from '@tanstack/react-router'

import { useCreateWallet, useUpdateWallet } from '@/features/account/api'
import { useLogout } from '@/features/auth/api'
import { cn } from '@/shared/lib/cn'
import { getToken } from '@/shared/session'

export const Route = createFileRoute('/carteiras')({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: '/login', search: { redirect: '/carteiras' } })
  },
  component: CarteirasPage,
})

const NETWORKS = [
  { value: 'Polygon', label: 'Polygon' },
  { value: 'Ethereum', label: 'Ethereum' },
  { value: 'Solana', label: 'Solana' },
  { value: 'Arbitrum', label: 'Arbitrum' },
  { value: 'Optimism', label: 'Optimism' },
] as const

const WALLET_TYPES = [
  { value: 'Coinbase Wallet', label: 'Coinbase Wallet' },
  { value: 'MetaMask', label: 'MetaMask' },
  { value: 'WalletConnect', label: 'WalletConnect' },
  { value: 'Phantom', label: 'Phantom' },
] as const

const ENS_DOMAINS = [
  { value: '.eth', label: '.eth' },
  { value: '.xyz', label: '.xyz' },
  { value: '.id', label: '.id' },
  { value: '.sol', label: '.sol' },
  { value: '.crypto', label: '.crypto' },
] as const

interface CustomSelectProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: readonly { value: string; label: string }[]
  placeholder: string
  className?: string
}

function CustomSelect({ id, value, onChange, options, placeholder, className }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'box-border flex h-[40px] w-full cursor-pointer items-center justify-between rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] outline-none transition-colors hover:border-[#D28A4C]/60 focus:border-[#D28A4C]',
          isOpen && 'border-[#D28A4C]',
          value ? 'text-[#F5F1EB]' : 'text-[#B39463]',
        )}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          className={cn(
            'shrink-0 text-[#B39463] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
          aria-hidden="true"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-[44px] z-50 w-full overflow-hidden rounded-[3px] border border-[#3F2319] bg-[#241612] py-1 shadow-[0_12px_28px_rgba(0,0,0,0.85)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left font-mono text-[14px] transition-colors',
                  isSelected
                    ? 'bg-[#38220F] font-bold text-[#E89B55]'
                    : 'text-[#F5F1EB] hover:bg-[#38220F] hover:text-[#E89B55]',
                )}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5 text-[#D28A4C]"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface EnsSelectProps {
  value: string
  onChange: (value: string) => void
}

function EnsSelect({ value, onChange }: EnsSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'box-border flex h-[40px] w-[78px] cursor-pointer items-center justify-between rounded-[3px] border border-[#3F2319] bg-transparent px-2.5 font-mono text-[15px] text-[#F5F1EB] outline-none transition-colors hover:border-[#D28A4C]/60 focus:border-[#D28A4C]',
          isOpen && 'border-[#D28A4C]',
        )}
      >
        <span>{value}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={cn('text-[#F5F1EB] transition-transform duration-200', isOpen && 'rotate-180')}
          aria-hidden="true"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-[44px] z-50 w-[84px] overflow-hidden rounded-[3px] border border-[#3F2319] bg-[#241612] py-1 shadow-[0_12px_28px_rgba(0,0,0,0.85)]"
        >
          {ENS_DOMAINS.map((domain) => {
            const isSelected = domain.value === value
            return (
              <button
                key={domain.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(domain.value)
                  setIsOpen(false)
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between px-2.5 py-1.5 text-left font-mono text-[14px] transition-colors',
                  isSelected
                    ? 'bg-[#38220F] font-bold text-[#E89B55]'
                    : 'text-[#F5F1EB] hover:bg-[#38220F] hover:text-[#E89B55]',
                )}
              >
                <span>{domain.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CarteirasPage() {
  const createWallet = useCreateWallet()
  const updateWallet = useUpdateWallet()
  const logout = useLogout()

  // Form states matching the exact Figma fields
  const [displayName, setDisplayName] = useState('')
  const [walletAlias, setWalletAlias] = useState('')
  const [network, setNetwork] = useState('')
  const [profileName, setProfileName] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [secondaryAddress, setSecondaryAddress] = useState('')
  const [walletType, setWalletType] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [email, setEmail] = useState('')
  const [ensName, setEnsName] = useState('')
  const [ensDomain, setEnsDomain] = useState('.eth')

  // Secondary wallet checkbox/radio
  const [isSameAsPrimary, setIsSameAsPrimary] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleReset = () => {
    setDisplayName('')
    setWalletAlias('')
    setNetwork('')
    setProfileName('')
    setWalletAddress('')
    setSecondaryAddress('')
    setWalletType('')
    setReferralCode('')
    setEmail('')
    setEnsName('')
    setEnsDomain('.eth')
    setIsSameAsPrimary(false)
    setFeedbackMessage(null)
  }

  const handleToggleSameAsPrimary = () => {
    setIsSameAsPrimary((prev) => {
      const next = !prev
      if (next && walletAddress) {
        setSecondaryAddress(walletAddress)
      }
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedbackMessage(null)

    if (!walletAddress.trim()) {
      setFeedbackMessage({
        type: 'error',
        text: 'Por favor, informe o endereço da carteira.',
      })
      return
    }

    createWallet.mutate(
      {
        address: walletAddress.trim(),
        network: network || 'Polygon',
        label: walletAlias.trim() || displayName.trim() || null,
      },
      {
        onSuccess: () => {
          setFeedbackMessage({
            type: 'success',
            text: 'Carteira salva com sucesso!',
          })
        },
        onError: () => {
          setFeedbackMessage({
            type: 'error',
            text: 'Não foi possível cadastrar a carteira.',
          })
        },
      },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col px-4 py-8 pb-24 sm:px-6 lg:px-[120px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-[28px] lg:flex-row">
        {/* Account Sidebar: 310px */}
        <aside
          aria-label="Menu da conta"
          className="flex w-full shrink-0 flex-col bg-[#241612] py-2 lg:w-[310px]"
        >
          {/* Frame 457: Meu perfil */}
          <div className="flex h-[36px] w-full items-center px-[10px]">
            <h2 className="font-mono text-[18px] font-bold leading-[16px] text-[#F5F1EB]">
              Meu perfil
            </h2>
          </div>

          <nav className="flex w-full flex-col">
            {/* 1. Dados do perfil */}
            <Link
              to="/perfil"
              className="flex h-[45px] w-full items-center gap-4 px-4 transition-colors hover:bg-white/5"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-[#CFB28C]"
                aria-hidden="true"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="font-mono text-[15px] leading-[45px] text-[#E89B55]">
                Dados do perfil
              </span>
            </Link>

            {/* 2. Carteiras (Active) */}
            <div className="box-border flex h-[45px] w-full items-center gap-3 border-l-[6px] border-[#D28A4C] px-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-[#E89B55]"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="font-mono text-[15px] leading-[45px] text-[#E89B55]">Carteiras</span>
            </div>

            {/* 3. Atividade */}
            <button
              type="button"
              className="flex h-[45px] w-full items-center gap-3 px-4 text-left transition-colors hover:bg-white/5"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-[#B39463]"
                aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="font-mono text-[15px] leading-[45px] text-[#E89B55]">Atividade</span>
            </button>

            {/* 4. Lista de interesse */}
            <button
              type="button"
              className="flex h-[45px] w-full items-center gap-3 px-4 text-left transition-colors hover:bg-white/5"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-[#B39463]"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="font-mono text-[15px] leading-[45px] text-[#E89B55]">
                Lista de interesse
              </span>
            </button>

            {/* 5. Ofertas */}
            <button
              type="button"
              className="flex h-[45px] w-full items-center gap-3 px-4 text-left transition-colors hover:bg-white/5"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-[#B39463]"
                aria-hidden="true"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span className="font-mono text-[15px] leading-[45px] text-[#E89B55]">Ofertas</span>
            </button>

            {/* 6. Arquivos baixados */}
            <button
              type="button"
              className="flex h-[45px] w-full items-center gap-3 px-4 text-left transition-colors hover:bg-white/5"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-[#B39463]"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="font-mono text-[15px] leading-[45px] text-[#E89B55]">
                Arquivos baixados
              </span>
            </button>

            {/* 7. Suporte */}
            <button
              type="button"
              className="flex h-[45px] w-full items-center gap-3 px-4 text-left transition-colors hover:bg-white/5"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-[#B39463]"
                aria-hidden="true"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="font-mono text-[15px] leading-[45px] text-[#E89B55]">Suporte</span>
            </button>

            {/* Line 2: Divider */}
            <div className="my-1 h-[1px] w-full border-b border-[#D28A4C]/30" />

            {/* Frame 38: Sair */}
            <button
              type="button"
              onClick={() => logout.mutate()}
              className="flex h-[40px] w-full items-center gap-2 px-4 transition-colors hover:bg-white/5"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-[#D28A4C]"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="font-mono text-[15px] font-bold leading-[15px] text-[#E89B55]">
                Sair
              </span>
            </button>
          </nav>
        </aside>

        {/* Wallets Form: 862px */}
        <section
          aria-label="Carteiras do colecionador"
          className="flex w-full flex-col gap-8 lg:w-[862px]"
        >
          {/* Section Heading: Carteira principal */}
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full items-start justify-between">
              <h1 className="font-mono text-[17px] font-bold leading-[16px] text-[#F5F1EB]">
                Carteira principal
              </h1>
              <button
                type="button"
                onClick={handleReset}
                className="font-mono text-[16px] font-medium leading-[16px] text-[#E89B55] transition-colors hover:underline"
              >
                Adicionar
              </button>
            </div>
            <p className="font-mono text-[14px] font-normal leading-[15px] text-[#CFB28C]">
              Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-6">
            {/* Field Row 1 */}
            <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:gap-[28px]">
              {/* Main Wallet Name */}
              <div className="flex w-full flex-col gap-1 sm:w-[417px]">
                <label
                  htmlFor="displayName"
                  className="flex items-center font-mono text-[15px] leading-[15px] text-[#F5F1EB]"
                >
                  <span>Nome de exibição</span>
                  <span className="ml-0.5 font-mono text-[22px] leading-[15px] text-[#F0805F]">
                    *
                  </span>
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="box-border h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] outline-none transition-colors focus:border-[#D28A4C]"
                />
              </div>

              {/* Wallet Alias */}
              <div className="flex w-full flex-col gap-1 sm:w-[417px]">
                <label
                  htmlFor="walletAlias"
                  className="flex items-center font-mono text-[15px] leading-[15px] text-[#F5F1EB]"
                >
                  <span>Apelido da carteira</span>
                  <span className="ml-0.5 font-mono text-[22px] leading-[15px] text-[#F0805F]">
                    *
                  </span>
                </label>
                <input
                  id="walletAlias"
                  type="text"
                  value={walletAlias}
                  onChange={(e) => setWalletAlias(e.target.value)}
                  className="box-border h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] outline-none transition-colors focus:border-[#D28A4C]"
                />
              </div>
            </div>

            {/* Field Row 2 */}
            <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:gap-[28px]">
              {/* Network Select */}
              <div className="flex w-full flex-col gap-1 sm:w-[417px]">
                <label
                  htmlFor="networkSelect"
                  className="flex items-center font-mono text-[15px] leading-[15px] text-[#F5F1EB]"
                >
                  <span>Rede</span>
                  <span className="ml-0.5 font-mono text-[22px] leading-[15px] text-[#F0805F]">
                    *
                  </span>
                </label>
                <CustomSelect
                  id="networkSelect"
                  value={network}
                  onChange={setNetwork}
                  options={NETWORKS}
                  placeholder="Selecione uma rede"
                />
              </div>

              {/* Profile Name */}
              <div className="flex w-full flex-col gap-1 sm:w-[417px]">
                <label
                  htmlFor="profileName"
                  className="flex items-center font-mono text-[15px] leading-[15px] text-[#F5F1EB]"
                >
                  <span>Nome do perfil</span>
                  <span className="ml-0.5 font-mono text-[22px] leading-[15px] text-[#F0805F]">
                    *
                  </span>
                </label>
                <input
                  id="profileName"
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="box-border h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] outline-none transition-colors focus:border-[#D28A4C]"
                />
              </div>
            </div>

            {/* Field Row 3 */}
            <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-end sm:gap-[28px]">
              {/* Wallet Address */}
              <div className="flex w-full flex-col gap-1 sm:w-[417px]">
                <label
                  htmlFor="walletAddress"
                  className="flex items-center font-mono text-[15px] leading-[15px] text-[#F5F1EB]"
                >
                  <span>Endereço da carteira</span>
                  <span className="ml-0.5 font-mono text-[22px] leading-[15px] text-[#F0805F]">
                    *
                  </span>
                </label>
                <input
                  id="walletAddress"
                  type="text"
                  placeholder="Endereço 0x da carteira"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="box-border h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] placeholder:text-[#B39463] outline-none transition-colors focus:border-[#D28A4C]"
                />
              </div>

              {/* Secondary Address Input (Aligned at bottom) */}
              <div className="flex h-[40px] w-full flex-col justify-end sm:w-[417px]">
                <input
                  id="secondaryAddress"
                  type="text"
                  aria-label="ENS ou carteira secundária (opcional)"
                  placeholder="ENS ou carteira secundária (opcional)"
                  value={secondaryAddress}
                  onChange={(e) => setSecondaryAddress(e.target.value)}
                  className="box-border h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] placeholder:text-[#B39463] outline-none transition-colors focus:border-[#D28A4C]"
                />
              </div>
            </div>

            {/* Field Row 4 */}
            <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:gap-[28px]">
              {/* Wallet Select */}
              <div className="flex w-full flex-col gap-1 sm:w-[417px]">
                <label
                  htmlFor="walletTypeSelect"
                  className="flex items-center font-mono text-[15px] leading-[15px] text-[#F5F1EB]"
                >
                  <span>Tipo de carteira</span>
                  <span className="ml-0.5 font-mono text-[22px] leading-[15px] text-[#F0805F]">
                    *
                  </span>
                </label>
                <CustomSelect
                  id="walletTypeSelect"
                  value={walletType}
                  onChange={setWalletType}
                  options={WALLET_TYPES}
                  placeholder="Selecione uma carteira"
                />
              </div>

              {/* Referral Code */}
              <div className="flex w-full flex-col gap-1 sm:w-[417px]">
                <label
                  htmlFor="referralCode"
                  className="flex items-center font-mono text-[15px] leading-[15px] text-[#F5F1EB]"
                >
                  <span>Código de indicação</span>
                  <span className="ml-0.5 font-mono text-[22px] leading-[15px] text-[#F0805F]">
                    *
                  </span>
                </label>
                <input
                  id="referralCode"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="box-border h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] outline-none transition-colors focus:border-[#D28A4C]"
                />
              </div>
            </div>

            {/* Field Row 5 */}
            <div className="flex w-full flex-col justify-between gap-4 sm:flex-row sm:gap-[28px]">
              {/* Email */}
              <div className="flex w-full flex-col gap-1 sm:w-[417px]">
                <label
                  htmlFor="email"
                  className="flex items-center font-mono text-[15px] leading-[15px] text-[#F5F1EB]"
                >
                  <span>E-mail</span>
                  <span className="ml-0.5 font-mono text-[22px] leading-[15px] text-[#F0805F]">
                    *
                  </span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="box-border h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] outline-none transition-colors focus:border-[#D28A4C]"
                />
              </div>

              {/* ENS Field */}
              <div className="flex w-full flex-col gap-1 sm:w-[417px]">
                <label
                  htmlFor="ensName"
                  className="flex items-center font-mono text-[15px] leading-[15px] text-[#F5F1EB]"
                >
                  <span>Nome ENS</span>
                  <span className="ml-0.5 font-mono text-[22px] leading-[15px] text-[#F0805F]">
                    *
                  </span>
                </label>
                <div className="flex w-full items-center gap-[10px]">
                  <EnsSelect value={ensDomain} onChange={setEnsDomain} />
                  <input
                    id="ensName"
                    type="text"
                    value={ensName}
                    onChange={(e) => setEnsName(e.target.value)}
                    className="box-border h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] outline-none transition-colors focus:border-[#D28A4C] sm:w-[329px]"
                  />
                </div>
              </div>
            </div>

            {/* Feedback alert */}
            {feedbackMessage && (
              <div
                role={feedbackMessage.type === 'error' ? 'alert' : 'status'}
                className={cn(
                  'rounded-[3px] border px-4 py-2.5 font-mono text-sm',
                  feedbackMessage.type === 'success'
                    ? 'border-[#D28A4C] bg-[#241612] text-[#F5F1EB]'
                    : 'border-red-500 bg-[#241612] text-red-400',
                )}
              >
                {feedbackMessage.text}
              </div>
            )}

            {/* Save Wallet Button */}
            <button
              type="submit"
              disabled={createWallet.isPending || updateWallet.isPending}
              className="flex h-[40px] w-[131px] cursor-pointer items-center justify-center rounded-[3px] bg-[#D28A4C] font-mono text-[14px] font-bold leading-[16px] text-[#140D0A] transition-colors hover:bg-[#E89B55] disabled:opacity-50"
            >
              {createWallet.isPending ? 'Salvando…' : 'Salvar carteira'}
            </button>
          </form>

          {/* Section 2: Carteira secundária */}
          <div className="flex w-full flex-col gap-3 pt-2">
            <div className="flex w-full items-start justify-between">
              <h2 className="font-mono text-[17px] font-bold leading-[16px] text-[#F5F1EB]">
                Carteira secundária
              </h2>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleToggleSameAsPrimary}
                  className="group flex cursor-pointer items-center gap-2"
                >
                  <span
                    className={cn(
                      'flex size-4 items-center justify-center rounded-full border-[1.5px] border-[#D28A4C] transition-colors',
                      isSameAsPrimary && 'bg-[#D28A4C]',
                    )}
                  >
                    {isSameAsPrimary && <span className="size-1.5 rounded-full bg-[#140D0A]" />}
                  </span>
                  <span className="font-mono text-[14px] leading-[16px] text-[#F5F1EB]">
                    Igual à carteira principal
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (walletAddress) {
                      setSecondaryAddress(walletAddress)
                      setIsSameAsPrimary(true)
                    }
                  }}
                  className="font-mono text-[16px] font-medium leading-[16px] text-[#E89B55] transition-colors hover:underline"
                >
                  Adicionar
                </button>
              </div>
            </div>
            <p className="font-mono text-[14px] font-normal leading-[15px] text-[#CFB28C]">
              Você ainda não adicionou uma carteira secundária.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
