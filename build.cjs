#!/usr/bin/env node

const { execSync } = require('child_process');

const humeAccessTokenUrl = process.env.HUME_ACCESS_TOKEN_URL;

if (!humeAccessTokenUrl) {
  console.error('Error: HUME_ACCESS_TOKEN_URL environment variable is required');
  process.exit(1);
}

console.log('Building with HUME_ACCESS_TOKEN_URL:', humeAccessTokenUrl);

try {
  const command = `bun build index.html --outdir ./public --define process.env.HUME_ACCESS_TOKEN_URL='"${humeAccessTokenUrl}"'`;
  console.log('Running:', command);
  execSync(command, { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
} 