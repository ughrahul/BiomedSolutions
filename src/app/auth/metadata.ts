import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Auth",
    template: "%s | Biomed Solution",
  },
  icons: {
    icon: [
      { url: "/assets/images/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/images/logo.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};


