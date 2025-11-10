import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers() {
    // Required by FHEVM (COEP). COOP must NOT be set for Base Account SDK.
    return Promise.resolve([
      {
        source: '/',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]);
  }
};

export default nextConfig;
