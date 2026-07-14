import type { MetadataRoute } from "next";

// robots.txt — impedir indexação da área de administração.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admin",
      },
    ],
  };
}
