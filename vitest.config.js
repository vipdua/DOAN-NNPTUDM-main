import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: "verbose",
    environment: "jsdom",
    include: ["tests/routes/products.test.js"],
  },
});
