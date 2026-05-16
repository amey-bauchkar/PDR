import { Helmet } from 'react-helmet-async';

/* ------------------------------------------------------------------ */
/*  Reusable JSON-LD schema component for structured data injection   */
/* ------------------------------------------------------------------ */

type JsonLdProps = { data: Record<string, unknown> };

/** Renders a <script type="application/ld+json"> block via Helmet */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

/* ------------------------------------------------------------------ */
/*  Pre-built schema generators                                       */
/* ------------------------------------------------------------------ */

const SITE = 'https://pdrworld.com';
const LOGO = `${SITE}/favicon.png`;

/** Organization schema — use once in Layout or Home */
export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'PDR World',
        legalName: 'PDR Videotronics India Pvt. Ltd.',
        url: SITE,
        logo: LOGO,
        foundingDate: '1985',
        description:
          'ISO 9001:2015 certified manufacturer of active and passive fiber optic components, test equipment, and enterprise infrastructure solutions since 1985.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '99, Old Prabhadevi Road',
          addressLocality: 'Mumbai',
          postalCode: '400025',
          addressCountry: 'IN',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+91-22-24306494',
            contactType: 'sales',
            areaServed: 'IN',
            availableLanguage: ['English', 'Hindi'],
          },
          {
            '@type': 'ContactPoint',
            telephone: '+91-22-24309536',
            contactType: 'technical support',
            areaServed: 'IN',
            availableLanguage: ['English', 'Hindi'],
          },
        ],
        sameAs: [
          'https://www.facebook.com/PDRVideo',
          'https://www.instagram.com/pdr.mumbai/',
          'https://www.youtube.com/channel/UCTOAYCstGJNZulaOF0TXGlg',
          'https://www.linkedin.com/company/pdr-world-mumbai/',
        ],
      }}
    />
  );
}

/** LocalBusiness schema — use on Contact page */
export function LocalBusinessSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${SITE}/#business`,
        name: 'PDR Videotronics India Pvt. Ltd.',
        image: `${SITE}/images/factory-modern.webp`,
        url: SITE,
        telephone: '+91-22-24306494',
        email: 'info@pdrworld.com',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '99, Old Prabhadevi Road',
          addressLocality: 'Mumbai',
          addressRegion: 'Maharashtra',
          postalCode: '400025',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 19.0144,
          longitude: 72.8295,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '10:00',
            closes: '18:30',
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Saturday',
            opens: '10:00',
            closes: '17:00',
          },
        ],
        taxID: '27AAACP2446G1ZL',
      }}
    />
  );
}

/** Product schema — use on each ProductDetail page */
export function ProductSchema({
  name,
  description,
  slug,
  category,
  specs,
  image,
}: {
  name: string;
  description: string;
  slug: string;
  category: string;
  specs: { label: string; value: string }[];
  image?: string;
}) {
  const specsText = specs.map((s) => `${s.label}: ${s.value}`).join('; ');
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description: `${description}. Specifications: ${specsText}`,
        url: `${SITE}/products/${slug}`,
        image: image ?? `${SITE}/images/fiber-patchcord.webp`,
        brand: {
          '@type': 'Brand',
          name: 'PDR World',
        },
        manufacturer: {
          '@type': 'Organization',
          name: 'PDR Videotronics India Pvt. Ltd.',
        },
        category,
        offers: {
          '@type': 'Offer',
          url: `${SITE}/products/${slug}`,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'PDR World',
          },
        },
      }}
    />
  );
}

/** BreadcrumbList schema — reusable for any breadcrumb trail */
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

/** WebSite schema with search — use on homepage */
export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'PDR World',
        url: SITE,
        description: 'Industrial fiber optic solutions manufacturer since 1985.',
        publisher: {
          '@type': 'Organization',
          name: 'PDR Videotronics India Pvt. Ltd.',
        },
      }}
    />
  );
}

/** Software Application schema — for configurator tools */
export function SoftwareApplicationSchema({ name, description, applicationCategory }: { name: string; description: string; applicationCategory: string }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name,
        description,
        applicationCategory,
        operatingSystem: 'Any',
        url: typeof window !== 'undefined' ? window.location.href : '',
        publisher: {
          '@type': 'Organization',
          name: 'PDR World',
        },
      }}
    />
  );
}

/** Service schema — for solutions page */
export function ServiceSchema({ name, description, serviceType }: { name: string; description: string; serviceType: string }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        serviceType,
        provider: {
          '@type': 'Organization',
          name: 'PDR World',
          url: SITE,
        },
      }}
    />
  );
}
