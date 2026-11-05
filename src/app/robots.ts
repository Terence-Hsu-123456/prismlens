import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/api/'] },
      { userAgent: 'Bingbot', allow: '/', disallow: ['/api/'] },
      { userAgent: 'Baiduspider', allow: '/', disallow: ['/api/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
