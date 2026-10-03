import type { NextConfig } from "next";

const supabaseStoragePattern = (() => {
  const value = process.env.SUPABASE_URL;
  if (!value) return null;

  const storageUrl = new URL(value);
  if (storageUrl.protocol !== "http:" && storageUrl.protocol !== "https:") {
    return null;
  }

  return {
    protocol: storageUrl.protocol.slice(0, -1) as "http" | "https",
    hostname: storageUrl.hostname,
    ...(storageUrl.port ? { port: storageUrl.port } : {}),
    pathname: "/storage/v1/object/public/catalog-images/**",
  };
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...(supabaseStoragePattern ? [supabaseStoragePattern] : []),
    ],
  },
};

export default nextConfig;
