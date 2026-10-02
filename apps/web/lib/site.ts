export const siteConfig = {
  description:
    "A source-led, evidence-first library for examining Biblical and Quranic claims.",
  name: "Apolog",
  url:
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
};
