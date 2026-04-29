import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Скрываем встроенный индикатор Next.js dev tools (та кружочная иконка
  // в углу). На продакшене всё равно не показывается, но локально мешает.
  devIndicators: false,
};

export default nextConfig;
