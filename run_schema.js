const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://bbzcwxllbvgjfwxpuxkz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiemN3eGxsYnZnamZ3eHB1eGt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU3MjI2NCwiZXhwIjoyMDk2MTQ4MjY0fQ.hIQVhArjp3mwlQ88oiXrCnF4ABhY_m9I3SO5_-dGqYY';

const supabase = createClient(supabaseUrl, serviceKey);

async function runSchema() {
  console.log('Testing connection to Supabase...');
  
  // Test connection by listing tables
  const { data, error } = await supabase.from('properties').select('count').limit(1);
  
  if (error && error.code === '42P01') {
    console.log('Tables do not exist yet. Please run the schema in SQL Editor.');
    console.log('Schema file: supabase/schema.sql');
  } else if (error) {
    console.log('Connection error:', error.message);
  } else {
    console.log('Connected! Properties table exists.');
    
    // Check how many properties
    const { count } = await supabase.from('properties').select('*', { count: 'exact', head: true });
    console.log('Properties in database:', count);
  }
}

runSchema();
