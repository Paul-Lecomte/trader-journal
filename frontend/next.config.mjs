/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export", // Static export configuration
    images: {
        unoptimized: true, // Disable image optimization for static export
    },
    distDir: "frontend_build", // Output to frontend_build directory
    reactStrictMode: true, // Enable React Strict Mode to avoid inline scripts
    webpack(config) {
        // Modify webpack configuration to prevent inline scripts
        config.output = {
            ...config.output,
            chunkFilename: 'static/chunks/[name].[contenthash].js', // Ensure chunks are not inline
        };
        return config;
    },
};

export default nextConfig;