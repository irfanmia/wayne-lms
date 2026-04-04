import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://wayne-lms.example.com';

  const staticPages = [
    '', '/courses', '/tracks', '/pricing', '/login', '/signup',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const courses = ['adaptive-learning-ai', 'creative-ai', 'basic-html5-essentials', 'introduction-to-python', 'python-django-web', 'agentic-ai', 'docker-kubernetes', 'cicd-pipeline'];
  const coursePages = courses.map(slug => ({
    url: `${baseUrl}/courses/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const tracks = ['python', 'javascript', 'java', 'typescript', 'cpp', 'csharp', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin'];
  const trackPages = tracks.map(slug => ({
    url: `${baseUrl}/tracks/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...coursePages, ...trackPages];
}
