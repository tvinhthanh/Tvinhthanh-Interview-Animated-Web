// Explicit NEXT_PUBLIC_SITE_URL wins; on Vercel fall back to the production
// domain it injects at build time, so canonical/sitemap never point at localhost.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
const fallbackUrl = "http://localhost:3000";

export const siteConfig = {
  name: "Sark",
  url: new URL(process.env.NEXT_PUBLIC_SITE_URL || vercelUrl || fallbackUrl),
  title: "Sark | SEO strategy for sustainable growth",
  description:
    "Technical SEO, content strategy, and continuous experimentation for brands that want durable organic growth.",
};
