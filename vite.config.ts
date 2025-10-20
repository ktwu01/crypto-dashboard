import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from "vite-plugin-source-info"

export default defineConfig(({ mode }) => {
  const isProdBuild = mode === "production" || process.env.BUILD_MODE === "prod"

  return {
    base: mode === "production" ? "/crypto-dashboard/" : "/",
    plugins: [
      react(),
      sourceIdentifierPlugin({
        enabled: !isProdBuild,
        attributePrefix: "data-matrix",
        includeProps: true,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
