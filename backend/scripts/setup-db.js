require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Create Supabase client with service_role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcmtzZm94YXZ4Z2RvZWRnemt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ3MDQxMSwiZXhwIjoyMDc4MDQ2NDExfQ.KvOIgFNIpkRIQK4zlGxrGHgYIyFdFSk7CkIgCfjocQk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSchema() {
  console.log('🚀 Checking database setup...\n');

  try {
    console.log('⚠️  Supabase SDK cannot execute raw SQL directly.');
    console.log('📋 You need to run the SQL manually in Supabase Dashboard:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/werksfoxavxgdoedgzkt/sql/new');
    console.log('2. Open file: supabase-schema-updated.sql');
    console.log('3. Copy the ENTIRE SQL content');
    console.log('4. Paste in Supabase SQL Editor');
    console.log('5. Click "Run" button\n');
    
    // Test if tables exist
    console.log('🔍 Checking if tables already exist...\n');
    
    const tables = ['users', 'doctors', 'patients', 'pharmacists', 'prescriptions', 'medicines', 'reminders', 'inventory', 'reports'];
    let allExist = true;
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count').limit(0);
      if (error) {
        console.log(`❌ ${table}: Not found`);
        allExist = false;
      } else {
        console.log(`✅ ${table}: Exists`);
      }
    }

    if (allExist) {
      console.log('\n✅ All database tables exist!');
      console.log('\n📋 Next steps:');
      console.log('1. Start backend: npm run dev');
      console.log('2. Test registration at: http://localhost:3000/register');
    } else {
      console.log('\n❌ Some tables are missing!');
      console.log('👉 Please run the SQL in Supabase Dashboard as shown above.');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

runSchema();
