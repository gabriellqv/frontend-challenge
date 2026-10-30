import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { nftQueryOptions } from '@/features/catalog/api'
import { NftDetailSkeleton } from '@/shared/components/skeletons/NftDetailSkeleton'
import { DEFAULT_NFT_LIST_QUERY } from '@/shared/contracts'
import { formatEth } from '@/shared/lib/money'

export const Route = createFileRoute('/nft/$nftId')({
  component: NftDetailPage,
})

function NftDetailPage() {
  const { nftId } = Route.useParams()
  const { data: nft, isLoading, isError } = useQuery(nftQueryOptions(nftId))

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 xl:px-0">
        <NftDetailSkeleton />
      </div>
    )
  }

  if (isError || !nft) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16 text-center sm:px-6 xl:px-0">
        <h1 className="font-mono text-2xl font-bold text-ink">NFT não encontrado</h1>
        <p className="mt-2 text-sm text-text-secondary">
          O NFT que você procura não existe ou foi removido.
        </p>
        <Link
          to="/"
          search={DEFAULT_NFT_LIST_QUERY}
          className="mt-6 inline-flex rounded-[5px] bg-primary px-4 py-2 text-sm font-bold text-ink"
        >
          Voltar ao catálogo
        </Link>
      </div>
    )
  }

  const available = nft.editions.reduce((sum, edition) => sum + edition.available, 0)

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 xl:px-0">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <img
            src={nft.imageUrl}
            alt={`Arte do NFT ${nft.name}`}
            className="aspect-square w-full rounded-[16px] border border-surface-dark object-cover"
          />
        </div>

        <div className="flex flex-col">
          <p className="text-sm text-text-secondary">
            {nft.collection} · {nft.network}
          </p>
          <h1 className="mt-2 font-mono text-3xl font-bold text-ink">{nft.name}</h1>
          <p className="mt-1 text-sm text-text-secondary">por {nft.creator.name}</p>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">{nft.description}</p>

          <div className="mt-6 rounded-[16px] border border-surface-dark bg-surface-card p-4 text-canvas">
            <p className="text-xs text-text-secondary">Preço</p>
            <p className="text-2xl font-bold text-primary">{formatEth(nft.priceEth)} ETH</p>
            <p className="mt-1 text-xs text-text-secondary">
              {available > 0 ? `${available} disponíveis` : 'Esgotado'}
            </p>

            <Link
              to="/carrinho"
              className="mt-4 inline-flex w-full justify-center rounded-[5px] bg-primary px-4 py-2.5 text-sm font-bold text-ink disabled:opacity-50"
            >
              Comprar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
