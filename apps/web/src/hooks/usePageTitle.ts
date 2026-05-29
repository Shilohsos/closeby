import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `Close By — ${title}`;
    return () => { document.title = 'Close By'; };
  }, [title]);
}
