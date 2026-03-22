import { Box, Text } from "@mantine/core";
import "./BrandLogo.css";

const LogoGlyph = () => (
  <svg width="32" height="32" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="projectFlowGradient" x1="2" y1="2" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#93C5FD" />
        <stop offset="0.5" stopColor="#3B82F6" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
    </defs>

    <rect x="1" y="1" width="32" height="32" rx="10" fill="url(#projectFlowGradient)" />
    <path d="M10 10H17.8C20.4 10 22.5 12.1 22.5 14.7C22.5 17.3 20.4 19.4 17.8 19.4H13.6" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M13.6 14.7H19.8" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M10 24L18 24" stroke="#E0F2FE" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M20 24L24 24" stroke="#BAE6FD" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export default function BrandLogo() {
  return (
    <Box className="brand-logo-wrap">
      <Box className="brand-logo-icon">
        <LogoGlyph />
      </Box>
      <Box className="brand-logo-copy">
        <Text className="brand-logo-title">ProjectFlow</Text>
        {/* <Text className="brand-logo-subtitle">Plan • Track • Deliver</Text> */}
      </Box>
    </Box>
  );
}
