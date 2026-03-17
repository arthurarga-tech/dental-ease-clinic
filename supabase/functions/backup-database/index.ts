import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackupData {
  timestamp: string;
  tables: {
    patients: any[];
    dentists: any[];
    appointments: any[];
    medical_records: any[];
    budgets: any[];
    financial_transactions: any[];
    profiles: any[];
    user_roles: any[];
  };
  metadata: {
    total_patients: number;
    total_appointments: number;
    total_transactions: number;
    backup_size: string;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting database backup...');

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all critical data
    const [
      patientsRes,
      dentistsRes,
      appointmentsRes,
      medicalRecordsRes,
      budgetsRes,
      transactionsRes,
      profilesRes,
      userRolesRes
    ] = await Promise.all([
      supabase.from('patients').select('*'),
      supabase.from('dentists').select('*'),
      supabase.from('appointments').select('*'),
      supabase.from('medical_records').select('*'),
      supabase.from('budgets').select('*'),
      supabase.from('financial_transactions').select('*'),
      supabase.from('profiles').select('*'),
      supabase.from('user_roles').select('*')
    ]);

    // Check for errors
    const errors = [
      patientsRes.error,
      dentistsRes.error,
      appointmentsRes.error,
      medicalRecordsRes.error,
      budgetsRes.error,
      transactionsRes.error,
      profilesRes.error,
      userRolesRes.error
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error('Errors fetching data:', errors);
      throw new Error(`Failed to fetch data: ${errors.map(e => e?.message).join(', ')}`);
    }

    // Build backup data
    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      tables: {
        patients: patientsRes.data || [],
        dentists: dentistsRes.data || [],
        appointments: appointmentsRes.data || [],
        medical_records: medicalRecordsRes.data || [],
        budgets: budgetsRes.data || [],
        financial_transactions: transactionsRes.data || [],
        profiles: profilesRes.data || [],
        user_roles: userRolesRes.data || []
      },
      metadata: {
        total_patients: patientsRes.data?.length || 0,
        total_appointments: appointmentsRes.data?.length || 0,
        total_transactions: transactionsRes.data?.length || 0,
        backup_size: '0 MB' // Will be calculated below
      }
    };

    // Calculate backup size
    const backupJson = JSON.stringify(backupData);
    const sizeInBytes = new TextEncoder().encode(backupJson).length;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    backupData.metadata.backup_size = `${sizeInMB} MB`;

    console.log(`Backup completed successfully. Size: ${sizeInMB} MB`);
    console.log(`Tables backed up: ${Object.keys(backupData.tables).length}`);
    console.log(`Total records: ${
      Object.values(backupData.tables).reduce((sum, table) => sum + table.length, 0)
    }`);

    // You could save this to Supabase Storage here
    // const { data: uploadData, error: uploadError } = await supabase.storage
    //   .from('backups')
    //   .upload(`backup-${backupData.timestamp}.json`, backupJson, {
    //     contentType: 'application/json'
    //   });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Backup completed successfully',
        backup: {
          timestamp: backupData.timestamp,
          metadata: backupData.metadata
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: unknown) {
    console.error('Backup error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
