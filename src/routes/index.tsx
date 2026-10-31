import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { Search, SlidersHorizontal, X } from 'lucide-react'

import { nftsQueryOptions } from '@/features/catalog/api'
import { Blog } from '@/features/catalog/components/Blog'
import { FilterSidebar } from '@/features/catalog/components/FilterSidebar'
import { Hero } from '@/features/catalog/components/Hero'
import { NftGrid } from '@/features/catalog/components/NftGrid'
import { Pagination } from '@/features/catalog/components/Pagination'
import { Promos } from '@/features/catalog/components/Promos'
import { SearchInput } from '@/features/catalog/components/SearchInput'
import { SortSelect } from '@/features/catalog/components/SortSelect'
import { favoritesQueryOptions, useToggleFavorite } from '@/features/favorites/api'
import { CatalogSkeleton } from '@/shared/components/skeletons/CatalogSkeleton'
import { DEFAULT_NFT_LIST_QUERY, type NftListQuery, nftListQuerySchema } from '@/shared/contracts'
import { cn } from '@/shared/lib/cn'
import { useBodyScrollLock } from '@/shared/lib/useBodyScrollLock'

export const Route = createFileRoute('/')({
  validateSearch: (search) => nftListQuerySchema.parse(search),
  component: HomePage,
})

function HomePage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  useBodyScrollLock(isMobileFiltersOpen)

  useEffect(() => {
    if (!isMobileFiltersOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsMobileFiltersOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileFiltersOpen])

  const catalog = useQuery(nftsQueryOptions(search))
  const favorites = useQuery(favoritesQueryOptions())
  const toggleFavorite = useToggleFavorite()

  const favoriteIds = new Set(favorites.data?.items.map((item) => item.nftId) ?? [])

  function updateSearch(patch: Partial<NftListQuery>) {
    navigate({ search: (prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }) })
  }

  function handleToggleFavorite(nftId: string, favorite: boolean) {
    toggleFavorite.mutate({ nftId, favorite })
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-6 pt-10 sm:px-6 md:gap-[96px] md:px-0 md:pt-0">
      {/* Mobile Search Bar: 366px x 45px (Figma Mobile / Início) */}
      <div className="mx-auto flex w-full max-w-[366px] items-center gap-2 md:hidden">
        {/* Frame 404: Search Input */}
        <div className="flex h-[45px] flex-1 items-center gap-2 rounded-[10px] bg-[#241612] px-3.5">
          <Search className="size-[18px] shrink-0 text-[#B39463]" strokeWidth={2.5} />
          <input
            type="search"
            value={search.q ?? ''}
            onChange={(e) => updateSearch({ q: e.target.value })}
            placeholder="Explorar coleções"
            aria-label="Explorar coleções"
            className="w-full bg-transparent font-mono text-[14px] font-bold leading-4 text-[#F5F1EB] placeholder:text-[#B39463] focus:outline-none"
          />
        </div>

        {/* Frame 402: Filter Button with Sliders Icon */}
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          aria-label="Abrir filtros"
          className="flex size-[45px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] shadow-sm transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(137.05deg, rgba(210, 138, 76, 0.45) -24.6%, #D28A4C 100%)',
          }}
        >
          <SlidersHorizontal className="size-5 text-[#140D0A]" strokeWidth={2.5} />
        </button>
      </div>

      {/* Hero Banner (Mobile & Desktop) */}
      <Hero />

      {/* Mobile Tabs: Todos os NFTs / Novos lançamentos / Em alta */}
      <div className="mx-auto flex w-full max-w-[366px] items-center gap-4 overflow-x-auto pb-1 font-mono text-[14px] leading-4 scrollbar-none md:hidden">
        <button
          type="button"
          onClick={() => updateSearch({ sort: undefined })}
          className={cn(
            'relative cursor-pointer py-1 whitespace-nowrap transition-colors',
            !search.sort ? 'font-bold text-[#E89B55]' : 'font-normal text-[#F5F1EB]',
          )}
        >
          Todos os NFTs
          {!search.sort && (
            <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#D28A4C]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => updateSearch({ sort: 'newest' })}
          className={cn(
            'cursor-pointer py-1 whitespace-nowrap transition-colors',
            search.sort === 'newest' ? 'font-bold text-[#E89B55]' : 'font-normal text-[#F5F1EB]',
          )}
        >
          Novos lançamentos
        </button>
        <button
          type="button"
          onClick={() => updateSearch({ sort: 'price_desc' })}
          className={cn(
            'cursor-pointer py-1 whitespace-nowrap transition-colors',
            search.sort === 'price_desc'
              ? 'font-bold text-[#E89B55]'
              : 'font-normal text-[#F5F1EB]',
          )}
        >
          Em alta
        </button>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileFiltersOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filtros de coleções e redes"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-[#140D0A]/95 p-6 backdrop-blur-md md:hidden"
        >
          <div className="flex items-center justify-between border-b border-[#3F2319] pb-4">
            <h3 className="font-mono text-lg font-bold text-[#F5F1EB]">Filtros</h3>
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(false)}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-[#241612] text-[#F5F1EB]"
              aria-label="Fechar filtros"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="py-4">
            <FilterSidebar
              value={{
                collection: search.collection,
                network: search.network,
                priceMin: search.priceMin,
                priceMax: search.priceMax,
              }}
              onChange={(patch) => {
                updateSearch(patch)
                setIsMobileFiltersOpen(false)
              }}
            />
          </div>
        </div>
      )}

      <section id="catalogo-section" aria-labelledby="catalogo" className="relative">
        <h2 id="catalogo" className="sr-only">
          Catálogo
        </h2>

        {/* Hidden accessible search for screen-readers / desktop shortcuts */}
        <div className="absolute -top-14 left-0 z-10 hidden h-8 w-64 opacity-[0.01] transition-opacity focus-within:opacity-100 lg:block">
          <SearchInput value={search.q ?? ''} onChange={(q) => updateSearch({ q })} />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              value={{
                collection: search.collection,
                network: search.network,
                priceMin: search.priceMin,
                priceMax: search.priceMax,
              }}
              onChange={(patch) => updateSearch(patch)}
            />
          </div>

          {/* Product Grid: 842px wide, gap: 88px to Pagination */}
          <div className="flex w-full min-w-0 flex-1 flex-col items-end gap-8 sm:gap-12 lg:w-[842px] lg:shrink-0 lg:gap-[88px]">
            {/* Frame 233: 842px wide, gap: 32px */}
            <div className="flex w-full flex-col items-start gap-8">
              {/* Desktop Toolbar: 842px x 18px */}
              <div className="hidden w-full items-center justify-between gap-4 md:flex">
                {/* Tabs: 376px x 16px, gap: 20px */}
                <nav
                  aria-label="Abas do catálogo"
                  className="relative flex items-center gap-5 font-mono text-[15px] font-medium leading-4"
                >
                  <button
                    type="button"
                    onClick={() => updateSearch({ sort: undefined })}
                    className="relative cursor-pointer py-1 text-highlight"
                  >
                    Todos os NFTs
                    <span className="absolute -bottom-[10px] left-0 h-[2px] w-[101px] bg-primary" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSearch({ sort: 'newest' })}
                    className="cursor-pointer py-1 text-foreground transition-colors duration-150 hover:text-highlight"
                  >
                    Novos lançamentos
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSearch({ sort: 'price_desc' })}
                    className="cursor-pointer py-1 text-foreground transition-colors duration-150 hover:text-highlight"
                  >
                    Em alta
                  </button>
                </nav>

                {/* Sort */}
                <SortSelect value={search.sort} onChange={(sort) => updateSearch({ sort })} />
              </div>

              {catalog.isLoading ? (
                <CatalogSkeleton />
              ) : catalog.isError ? (
                <div
                  role="alert"
                  className="w-full rounded-[16px] border border-error/40 bg-error/10 p-6 text-sm"
                >
                  <p className="font-mono text-base font-bold text-foreground">
                    Não foi possível carregar o catálogo.
                  </p>
                  <p className="mt-1 font-mono text-xs text-text-secondary">
                    Ocorreu uma falha na conexão ou os parâmetros da busca precisam ser restaurados.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.__kurio) {
                          window.__kurio.applyScenario('default')
                        }
                        updateSearch({ page: 1 })
                        void catalog.refetch()
                      }}
                      className="cursor-pointer rounded-[5px] bg-primary px-4 py-2 font-mono text-sm font-bold text-ink transition-colors hover:bg-highlight"
                    >
                      Tentar novamente
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.__kurio) {
                          window.__kurio.reset()
                          window.__kurio.applyScenario('default')
                        }
                        navigate({ to: '/', search: DEFAULT_NFT_LIST_QUERY })
                        void catalog.refetch()
                      }}
                      className="cursor-pointer rounded-[5px] border border-primary px-4 py-2 font-mono text-sm font-medium text-highlight transition-colors hover:bg-primary/10"
                    >
                      Restaurar catálogo completo
                    </button>
                  </div>
                </div>
              ) : catalog.data && catalog.data.items.length === 0 ? (
                <div
                  role="status"
                  className="w-full rounded-[16px] border border-border bg-card p-6 text-sm text-muted-foreground"
                >
                  Nenhum NFT encontrado com esses filtros.
                </div>
              ) : catalog.data ? (
                <NftGrid
                  nfts={catalog.data.items}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                />
              ) : null}
            </div>

            {catalog.data && catalog.data.pagination.totalPages > 1 ? (
              <Pagination
                pagination={catalog.data.pagination}
                onChange={(page) => updateSearch({ page })}
              />
            ) : null}
          </div>
        </div>
      </section>

      <div className="hidden md:flex md:flex-col md:gap-[96px]">
        <Promos />
        <Blog />
      </div>
    </div>
  )
}
