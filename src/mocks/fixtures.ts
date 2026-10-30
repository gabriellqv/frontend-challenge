import type { Nft, Wallet } from '@/shared/contracts'

import { type UserRecord, hashPassword } from './db'

/**
 * Fixtures determinísticas: 2 usuários e um catálogo variado (coleções, redes,
 * faixas de preço e edições) para exercitar filtros e paginação.
 */

export function createUserRecords(): UserRecord[] {
  const pass = hashPassword('kurio123')
  return [
    {
      id: 'u-nova',
      name: 'Nova Sato',
      email: 'nova@kurio.test',
      passwordHash: pass,
      avatarUrl: null,
    },
    {
      id: 'u-bruno',
      name: 'Bruno Lima',
      email: 'bruno@kurio.test',
      passwordHash: pass,
      avatarUrl: null,
    },
  ]
}

export function seedWallets(): Record<string, Wallet[]> {
  return {
    'u-nova': [
      {
        id: 'w-1',
        address: '0x7aB8…9f3D',
        network: 'Polygon',
        label: 'Principal',
        isPrimary: true,
      },
      { id: 'w-2', address: '0x3cA1…0eB4', network: 'Ethereum', label: null, isPrimary: false },
    ],
    'u-bruno': [],
  }
}

function nft(
  id: string,
  name: string,
  collection: string,
  network: Nft['network'],
  priceEth: string,
  editions: Nft['editions'],
  imageUrl = '/images/NFT-Artwork-05.png',
): Nft {
  return {
    id,
    name,
    description: `Um colecionável digital finalizado à mão da coleção ${collection}, verificado na ${network}.`,
    collection,
    network,
    priceEth,
    imageUrl,
    creator: { name: 'Nova Sato', address: 'nova.kurio.eth' },
    editions,
    version: 1,
  }
}

export function createNfts(): Nft[] {
  const open = (n: number, name = 'ABERTA'): Nft['editions'] => [
    { id: `${n}-open`, name, totalSupply: null, available: 999 },
  ]
  const limited = (n: number, supply: number, available?: number): Nft['editions'] => [
    { id: `${n}-1`, name: `1/${supply}`, totalSupply: supply, available: available ?? supply },
  ]

  return [
    nft('nft-1', 'Emerald Ape #042', 'Kurio Apes', 'Polygon', '1.19', limited(1, 50, 18)),
    nft('nft-2', 'Genesis Drop #001', 'Genesis Drops', 'Ethereum', '4.2', limited(2, 10, 3)),
    nft('nft-3', 'Crimson Ape #007', 'Kurio Apes', 'Polygon', '0.85', limited(3, 50, 50)),
    nft(
      'nft-4',
      'Solace in Motion',
      'Kurio Editions',
      'Ethereum',
      '2.75',
      limited(4, 1, 1),
      '/images/NFT-Artwork-09.png',
    ),
    nft('nft-5', 'Neon Drift #12', 'Curated Art', 'Polygon', '0.49', open(5)),
    nft(
      'nft-6',
      'Aurora Fragment',
      'Kurio Editions',
      'Ethereum',
      '6.5',
      limited(6, 1, 0),
      '/images/NFT-Artwork-18.png',
    ),
    nft('nft-7', 'Golden Ape #003', 'Kurio Apes', 'Ethereum', '3.1', limited(7, 50, 27)),
    nft('nft-8', 'Genesis Drop #008', 'Genesis Drops', 'Polygon', '1.9', limited(8, 10, 8)),
    nft('nft-9', 'Static Bloom', 'Curated Art', 'Ethereum', '0.99', open(9)),
    nft('nft-10', 'Iron Ape #019', 'Kurio Apes', 'Polygon', '1.45', limited(10, 50, 41)),
    nft('nft-11', 'Void Garden', 'Kurio Editions', 'Polygon', '0.68', limited(11, 100, 100)),
    nft('nft-12', 'Genesis Drop #013', 'Genesis Drops', 'Ethereum', '5.0', limited(12, 10, 1)),
    nft('nft-13', 'Chromatic Wave', 'Curated Art', 'Polygon', '0.27', open(13)),
    nft('nft-14', 'Obsidian Ape #051', 'Kurio Apes', 'Ethereum', '2.25', limited(14, 50, 6)),
    nft(
      'nft-15',
      'Lumen Codex',
      'Kurio Editions',
      'Ethereum',
      '8.0',
      limited(15, 1, 1),
      '/images/NFT-Artwork-09.png',
    ),
    nft('nft-16', 'Genesis Drop #021', 'Genesis Drops', 'Polygon', '0.75', limited(16, 10, 10)),
  ]
}
