/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export", // Static export configuration
    images: {
        unoptimized: true, // Disable image optimization for static export
    },
    distDir: "frontend_build", // Output to frontend_build directory
};

export default nextConfig;