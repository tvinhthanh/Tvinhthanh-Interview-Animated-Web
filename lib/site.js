const fallbackUrl = "http://localhost:4173";

export const siteConfig = {
  name: "Sark",
  url: new URL(process.env.NEXT_PUBLIC_SITE_URL || fallbackUrl),
  title: "Sark | SEO strategy for sustainable growth",
  description:
    "Technical SEO, content strategy, and continuous experimentation for brands that want durable organic growth.",
};
