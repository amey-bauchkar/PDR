import { Helmet } from 'react-helmet-async';

type SeoProps = {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  /** Override OG title independently — defaults to page title */
  ogTitle?: string;
  /** Override OG description independently — defaults to page description */
  ogDescription?: string;
  /** Override OG URL independently — defaults to canonical */
  ogUrl?: string;
  /** Set og:type — defaults to 'website', use 'product' for product pages */
  ogType?: string;
};

const SITE = 'https://pdr-sable.vercel.app';

export default function Seo({
  title,
  description,
  canonical,
  ogImage = `${SITE}/og-card.png`,
  ogTitle,
  ogDescription,
  ogUrl,
  ogType = 'website',
}: SeoProps) {
  const url = canonical ?? SITE;
  const resolvedOgTitle = ogTitle ?? title;
  const resolvedOgDesc = ogDescription ?? description;
  const resolvedOgUrl = ogUrl ?? url;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="PDR World" />
      <meta property="og:title" content={resolvedOgTitle} />
      <meta property="og:description" content={resolvedOgDesc} />
      <meta property="og:url" content={resolvedOgUrl} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedOgTitle} />
      <meta name="twitter:description" content={resolvedOgDesc} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
