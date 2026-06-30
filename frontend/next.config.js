/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a minimal standalone server bundle (only the files actually
  // needed at runtime) so the Docker image doesn't have to ship the full
  // node_modules tree or devDependencies. Required for the multi-stage
  // frontend Dockerfile.
  output: 'standalone',
  reactStrictMode: true,
};

module.exports = nextConfig;
