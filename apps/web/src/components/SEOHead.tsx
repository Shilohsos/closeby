import { useEffect } from 'react';

type Props = {
  title: string;
  description?: string;
  image?: string;
  url?: string;
};

export function SEOHead({ title, description, image, url }: Props) {
  useEffect(() => {
    const fullTitle = `Close By — ${title}`;
    const tags: [string, string][] = [
      ['og:title', fullTitle],
      ['og:description', description ?? "Nigeria's campus marketplace"],
      ['og:image', image ?? '/og-default.png'],
      ['og:url', url ?? window.location.href],
      ['og:type', 'website'],
      ['twitter:card', 'summary_large_image'],
      ['twitter:title', fullTitle],
      ['twitter:description', description ?? "Nigeria's campus marketplace"],
      ['twitter:image', image ?? '/og-default.png'],
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
