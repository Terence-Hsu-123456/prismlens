import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { UNIVERSE, MARKETS, SECTORS } from '@/lib/universe'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const home: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'hourly', priority: 1 },
  ]

  const markets: MetadataRoute.Sitemap = MARKETS.map((m) => ({
    url: `${SITE_URL}/market/${m.key.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const sectors: MetadataRoute.Sitemap = SECTORS.map((s) => ({
    url: `${SITE_URL}/sector/${s.key}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const stocks: MetadataRoute.Sitemap = UNIVERSE.map((u) => ({
    url: `${SITE_URL}/stock/${u.s.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [...home, ...markets, ...sectors, ...stocks]
}
