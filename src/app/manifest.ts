import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wezu Technologies",
    short_name: "Wezu",
    description: "Engineering systems for intelligent vehicles and mobility platforms.",
    start_url: "/",
    display: "browser",
    background_color: "#02071c",
    theme_color: "#02071c",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
