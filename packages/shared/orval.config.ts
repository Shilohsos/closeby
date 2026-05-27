import { defineConfig } from 'orval';

export default defineConfig({
  closeby: {
    input: './openapi.yaml',
    output: {
      target: './src/api/',
      client: 'react-query',
      mode: 'tags',
    },
  },
});
