export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Wayne LMS',
    url: 'https://wayne-lms.example.com',
    description: 'Learn to code with hands-on exercises and earn certificates',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '704, City Gate Tower, Al Ittihad Road',
      addressLocality: 'Sharjah',
      addressCountry: 'AE',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function CourseJsonLd({ name, description }: { name: string; description: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: { '@type': 'Organization', name: 'Wayne LMS' },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online' },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
