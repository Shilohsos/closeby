import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

export function SEOHead({ title, description, image, url }: SEOHeadProps) {
  useEffect(() => {
    const fullTitle = `Close By — ${title}`;
    document.title = fullTitle;

    const tags: [string, string][] = [
      ['og:title', fullTitle],
      ['og:description', description ?? "Nigeria's campus marketplace — buy, sell, and connect with students."],
      ['og:image', image ?? '/og-default.png'],
      ['og:url', url ?? window.location.href],
      ['og:type', 'website'],
      ['twitter:card', 'summary_large_image'],
      ['twitter:title', fullTitle],
      ['twitter:description', description ?? "Nigeria's campus marketplace"],
    ];

    tags.forEach(([property, content]) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    });
  }, [title, description, image, url]);

  return null;
}
