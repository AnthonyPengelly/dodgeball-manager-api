/**
 * Validates that all required environment variables are set
 * @returns {boolean} True if all required variables are set, false otherwise
 */
export const validateEnv = (): boolean => {
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY'
  ];

  let missingVars = false;
  const missingEnvVars: string[] = [];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missingVars = true;
      missingEnvVars.push(envVar);
    }
  });

  if (missingVars) {
    console.error('❌ Missing required environment variables:');
    missingEnvVars.forEach(envVar => {
      console.error(`   - ${envVar}`);
    });
    console.error('Please check your .env file and make sure all required variables are set.');
    return false;
  }

  return true;
};
