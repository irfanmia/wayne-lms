import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/profile'] },
    ],
    sitemap: 'https://wayne-lms.example.com/sitemap.xml',
  };
}
