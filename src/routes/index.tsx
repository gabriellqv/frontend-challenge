import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

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

export const Route = createFileRoute('/')({
  validateSearch: (search) => nftListQuerySchema.parse(search),
  component: HomePage,
})

function HomePage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

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
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[96px]">
      <Hero />

      <section id="catalogo-section" aria-labelledby="catalogo" className="relative">
        <h2 id="catalogo" className="sr-only">
          Catálogo
        </h2>

        <div className="absolute -top-14 left-0 z-10 h-8 w-64 opacity-[0.01] transition-opacity focus-within:opacity-100">
          <SearchInput value={search.q ?? ''} onChange={(q) => updateSearch({ q })} />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <FilterSidebar
            value={{
              collection: search.collection,
              network: search.network,
              priceMin: search.priceMin,
              priceMax: search.priceMax,
            }}
            onChange={(patch) => updateSearch(patch)}
          />

          {/* Product Grid: 842px wide, gap: 88px to Pagination */}
          <div className="flex w-full min-w-0 flex-1 flex-col items-end gap-12 lg:w-[842px] lg:shrink-0 lg:gap-[88px]">
            {/* Frame 233: 842px wide, gap: 32px */}
            <div className="flex w-full flex-col items-start gap-8">
              {/* Toolbar: 842px x 18px */}
              <div className="flex w-full items-center justify-between gap-4">
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
                    <span className="absolute left-0 -bottom-[10px] h-[2px] w-[101px] bg-primary" />
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

      <Promos />
      <Blog />
    </div>
  )
}
