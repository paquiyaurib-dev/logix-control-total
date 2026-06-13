import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pokbocttpciehafsxsam.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBva2JvY3R0cGNpZWhhZnN4c2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzM2ODcsImV4cCI6MjA5Njk0OTY4N30.8p9yVNRIObSDPOBQtXTKdCvXPez9a_z5Mt3ORGuTq4o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});