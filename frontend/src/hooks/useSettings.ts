import { useQuery } from '@tanstack/react-query';

interface SiteSettings {
  general?: {
    siteName: string;
    tagline?: string;
    description?: string;
  };
  homepage?: {
    heroTitle: string;
    heroSubtitle?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

const fetchSettings = async (): Promise<SiteSettings> => {
  const res = await fetch('/api/public/settings');
  if (!res.ok) {
    throw new Error('Failed to fetch settings');
  }
  const json = await res.json();
  return json.data;
};

export const useSettings = () => {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
