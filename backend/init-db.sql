-- PostgreSQL initialization script for Anant Automobiles

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create app-specific database user with all permissions (if not using POSTGRES_USER)
-- This user will handle application connections
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'anant_app') THEN
    CREATE USER anant_app WITH PASSWORD 'AppPassword456!@#';
  END IF;
END $$;

-- Grant permissions to app user on the database
GRANT CONNECT ON DATABASE anantautomobiles TO anant_app;
GRANT USAGE ON SCHEMA public TO anant_app;

-- Grant all privileges on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anant_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anant_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anant_app;

-- Grant current tables/sequences (if any exist)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anant_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anant_app;

-- Create readonly user for reports (optional)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'anant_readonly') THEN
    CREATE USER anant_readonly WITH PASSWORD 'ReadOnly789!@#';
  END IF;
END $$;

-- Grant readonly permissions
GRANT CONNECT ON DATABASE anantautomobiles TO anant_readonly;
GRANT USAGE ON SCHEMA public TO anant_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anant_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anant_readonly;

-- Log initialization
SELECT 'PostgreSQL initialization completed successfully' as status;
