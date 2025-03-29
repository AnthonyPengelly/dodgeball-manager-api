interface Config {
  port: number;
  supabase: {
    url: string;
    serviceRoleKey: string;
    anonKey: string;
  };
  environment: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  environment: process.env.NODE_ENV || 'development',
};

export default config;
