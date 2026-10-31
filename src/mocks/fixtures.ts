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
    nft(
      'nft-1',
      'Emerald Ape #042',
      'Kurio Apes',
      'Polygon',
      '1.19',
      limited(1, 50, 18),
      '/images/Frame-136.png',
    ),
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
    nft(
      'nft-17',
      'Sage Nomad #009',
      'Kurio Apes',
      'Polygon',
      '1.69',
      limited(17, 50, 12),
      '/images/NFT-Artwork-09.png',
    ),
    nft(
      'nft-18',
      'Neon Vessel #552',
      'Curated Art',
      'Ethereum',
      '1.99',
      limited(18, 50, 25),
      '/images/NFT-Artwork-18.png',
    ),
    nft(
      'nft-19',
      'Cosmic Bloom #118',
      'Kurio Editions',
      'Polygon',
      '1.29',
      limited(19, 50, 30),
      '/images/NFT-Artwork-18.png',
    ),
    nft(
      'nft-20',
      'Violet Nomad #314',
      'Kurio Apes',
      'Ethereum',
      '1.39',
      limited(20, 50, 45),
      '/images/NFT-Artwork-18.png',
    ),
    nft(
      'nft-21',
      'Ivory Baron #088',
      'Curated Art',
      'Polygon',
      '1.79',
      limited(21, 50, 8),
      '/images/NFT-Artwork-05.png',
    ),
    nft(
      'nft-22',
      'Golden Beat #207',
      'Kurio Editions',
      'Ethereum',
      '0.99',
      limited(22, 50, 19),
      '/images/NFT-Artwork-09.png',
    ),
    nft(
      'nft-23',
      'Golden Signal #160',
      'Kurio Apes',
      'Polygon',
      '0.39',
      limited(23, 50, 22),
      '/images/NFT-Artwork-09.png',
    ),
    nft('nft-24', 'Cyber Relic #004', 'Genesis Drops', 'Ethereum', '3.8', limited(24, 10, 2)),
    nft('nft-25', 'Astral Mirage #077', 'Kurio Apes', 'Polygon', '1.15', limited(25, 50, 14)),
    nft('nft-26', 'Quantum Echo', 'Curated Art', 'Ethereum', '2.45', open(26)),
    nft('nft-27', 'Solaris Flux #012', 'Kurio Editions', 'Polygon', '0.88', limited(27, 100, 72)),
    nft('nft-28', 'Prism Monarch #033', 'Kurio Apes', 'Ethereum', '4.10', limited(28, 50, 5)),
    nft('nft-29', 'Ethereal Drift', 'Genesis Drops', 'Polygon', '1.55', limited(29, 10, 4)),
    nft('nft-30', 'Glitch Horizon #101', 'Curated Art', 'Ethereum', '0.62', open(30)),
    nft('nft-31', 'Nexus Core #055', 'Kurio Editions', 'Polygon', '1.80', limited(31, 50, 31)),
    nft('nft-32', 'Phantom Bloom #220', 'Kurio Apes', 'Ethereum', '2.90', limited(32, 50, 9)),
    nft('nft-33', 'Vapor Wave #018', 'Curated Art', 'Polygon', '0.45', open(33)),
    nft('nft-34', 'Apex Nomad #040', 'Kurio Apes', 'Ethereum', '3.25', limited(34, 50, 16)),
    nft('nft-35', 'Aura Pulse #080', 'Kurio Editions', 'Polygon', '1.05', limited(35, 100, 85)),
    nft('nft-36', 'Genesis Relic #009', 'Genesis Drops', 'Ethereum', '6.0', limited(36, 10, 1)),
    nft('nft-37', 'Zero Gravity #002', 'Curated Art', 'Polygon', '0.78', open(37)),
    nft('nft-38', 'Cyber Nomad #144', 'Kurio Apes', 'Ethereum', '2.10', limited(38, 50, 21)),
    nft('nft-39', 'Nova Bloom #303', 'Kurio Editions', 'Polygon', '1.35', limited(39, 50, 40)),
    nft('nft-40', 'Obsidian Core #062', 'Genesis Drops', 'Ethereum', '4.8', limited(40, 10, 3)),
    nft('nft-41', 'Pulse Matrix #015', 'Curated Art', 'Polygon', '0.52', open(41)),
    nft('nft-42', 'Hyper Ape #099', 'Kurio Apes', 'Ethereum', '3.75', limited(42, 50, 7)),
    nft('nft-43', 'Mirage Drift #024', 'Kurio Editions', 'Polygon', '0.95', limited(43, 100, 60)),
    nft('nft-44', 'Genesis Artifact #011', 'Genesis Drops', 'Ethereum', '5.2', limited(44, 10, 2)),
    nft('nft-45', 'Echo Horizon #008', 'Curated Art', 'Polygon', '0.38', open(45)),
    nft('nft-46', 'Titan Ape #070', 'Kurio Apes', 'Ethereum', '2.65', limited(46, 50, 18)),
    nft('nft-47', 'Zenith Pulse #110', 'Kurio Editions', 'Polygon', '1.50', limited(47, 50, 33)),
    nft('nft-48', 'Genesis Void #025', 'Genesis Drops', 'Ethereum', '7.2', limited(48, 10, 1)),
  ]
}
