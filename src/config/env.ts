// Environment variables configuration
export const ENV = {
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
  FRONTEND_ADMIN_URL: process.env.NEXT_PUBLIC_FRONTEND_ADMIN_URL || 'http://localhost:3001',
  FRONTEND_CL_SIDE_URL: process.env.NEXT_PUBLIC_FRONTEND_CL_SIDE_URL || 'http://localhost:3002',
};
