"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function setFavicon(href: string) {
  const existing = document.querySelectorAll<HTMLLinkElement>(
    "link[rel='icon'], link[rel='shortcut icon']"
  );
  existing.forEach((el) => el.parentElement?.removeChild(el));

  const link = document.createElement("link");
  link.rel = "icon";
  link.href = href;
  document.head.appendChild(link);

  const shortcut = document.createElement("link");
  shortcut.rel = "shortcut icon";
  shortcut.href = href;
  document.head.appendChild(shortcut);
}

export default function DynamicHead() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    let title = "Biomed Solution";
    let favicon = "/favicon.ico";

    if (pathname === "/") {
      title = "Biomed Solution";
      favicon = "/favicon.ico";
    } else if (pathname.startsWith("/products/")) {
      title = "Product Details | Biomed Solution";
      favicon = "/assets/images/logo.png";
    } else if (pathname === "/products") {
      title = "Products | Biomed Solution";
      favicon = "/assets/images/logo.png";
    } else if (pathname === "/about") {
      title = "About | Biomed Solution";
      favicon = "/assets/images/logo.png";
    } else if (pathname === "/contact") {
      title = "Contact | Biomed Solution";
      favicon = "/assets/images/logo.png";
    } else if (pathname.startsWith("/admin")) {
      title = "Admin | Biomed Solution";
      favicon = "/assets/images/logo.png";
    } else if (pathname.startsWith("/auth")) {
      title = "Sign In | Biomed Solution";
      favicon = "/assets/images/logo.png";
    } else {
      // Generic fallback
      const segment = pathname.split("/").filter(Boolean)[0] || "Home";
      title = `${segment.charAt(0).toUpperCase()}${segment.slice(
        1
      )} | Biomed Solution`;
      favicon = "/assets/images/logo.png";
    }

    document.title = title;
    setFavicon(favicon);
  }, [pathname]);

  return null;
}
