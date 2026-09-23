import { siteConfig } from "../lib/site";

export default function sitemap() {
  return [
    {
      url: siteConfig.url.toString(),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
