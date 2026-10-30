import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { nftsQueryOptions } from '@/features/catalog/api'
import { FilterSidebar } from '@/features/catalog/components/FilterSidebar'
import { NftGrid } from '@/features/catalog/components/NftGrid'
import { Pagination } from '@/features/catalog/components/Pagination'
import { SearchInput } from '@/features/catalog/components/SearchInput'
import { SortSelect } from '@/features/catalog/components/SortSelect'
import { favoritesQueryOptions, useToggleFavorite } from '@/features/favorites/api'
import { CatalogSkeleton } from '@/shared/components/skeletons/CatalogSkeleton'
import { type Network, type NftListQuery, nftListQuerySchema } from '@/shared/contracts'

const COLLECTIONS = ['Kurio Apes', 'Kurio Editions', 'Genesis Drops', 'Curated Art'] as const
const NETWORKS: Network[] = ['Ethereum', 'Polygon']

export const Route = createFileRoute('/')({
  validateSearch: (search) => nftListQuerySchema.parse(search),
  component: HomePage,
})

function HomePage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const catalog = useQuery(nftsQueryOptions(search))
  const featured = useQuery(nftsQueryOptions({ page: 1, pageSize: 3, sort: 'price_desc' }))
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
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 xl:px-0">
      <header className="mb-8">
        <h1 className="font-mono text-2xl font-bold text-ink sm:text-3xl">Explorar NFTs</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Descubra, colecione e negocie arte digital verificada na Ethereum.
        </p>
      </header>

      <section aria-labelledby="destaques" className="mb-10">
        <h2 id="destaques" className="mb-4 font-mono text-lg font-bold text-ink">
          Destaques
        </h2>
        {featured.data ? (
          <NftGrid
            nfts={featured.data.items}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          <CatalogSkeleton itemCount={3} />
        )}
      </section>

      <section aria-labelledby="catalogo">
        <h2 id="catalogo" className="mb-4 font-mono text-lg font-bold text-ink">
          Catálogo
        </h2>

        <div className="mb-4">
          <SearchInput value={search.q ?? ''} onChange={(q) => updateSearch({ q })} />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <FilterSidebar
            collections={COLLECTIONS}
            networks={NETWORKS}
            value={{
              collection: search.collection,
              network: search.network,
              priceMin: search.priceMin,
              priceMax: search.priceMax,
            }}
            onChange={(patch) => updateSearch(patch)}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm text-text-secondary" aria-live="polite">
                {catalog.data ? `${catalog.data.pagination.total} NFTs` : '\u00a0'}
              </p>
              <SortSelect value={search.sort} onChange={(sort) => updateSearch({ sort })} />
            </div>

            {catalog.isLoading ? (
              <CatalogSkeleton />
            ) : catalog.isError ? (
              <div
                role="alert"
                className="rounded-[16px] border border-error/40 bg-error/10 p-6 text-sm"
              >
                Não foi possível carregar o catálogo. Tente novamente.
              </div>
            ) : catalog.data && catalog.data.items.length === 0 ? (
              <div
                role="status"
                className="rounded-[16px] border border-surface-dark bg-surface-card p-6 text-sm text-text-secondary"
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

            {catalog.data && catalog.data.pagination.totalPages > 1 ? (
              <Pagination
                pagination={catalog.data.pagination}
                onChange={(page) => updateSearch({ page })}
              />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
