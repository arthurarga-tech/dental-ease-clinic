import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const table = url.searchParams.get('table');
    const format = url.searchParams.get('format') || 'json'; // json or csv

    console.log(`Exporting ${table || 'all tables'} in ${format} format`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Define tables to export
    const tablesToExport = table ? [table] : [
      'patients',
      'dentists',
      'appointments',
      'medical_records',
      'budgets',
      'financial_transactions'
    ];

    const exportData: Record<string, any[]> = {};

    // Fetch data from each table
    for (const tableName of tablesToExport) {
      const { data, error } = await supabase.from(tableName).select('*');
      
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
      }

      exportData[tableName] = data || [];
      console.log(`Exported ${data?.length || 0} records from ${tableName}`);
    }

    // Generate export based on format
    let responseBody: string;
    let contentType: string;
    let filename: string;

    if (format === 'csv' && table) {
      // CSV export for single table
      const data = exportData[table];
      if (!data || data.length === 0) {
        throw new Error(`No data found for table: ${table}`);
      }

      // Generate CSV
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle values that might contain commas
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
          }).join(',')
        )
      ];
      
      responseBody = csvRows.join('\n');
      contentType = 'text/csv';
      filename = `${table}-export-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      // JSON export
      responseBody = JSON.stringify({
        exported_at: new Date().toISOString(),
        tables: exportData,
        summary: {
          total_tables: Object.keys(exportData).length,
          total_records: Object.values(exportData).reduce((sum, arr) => sum + arr.length, 0)
        }
      }, null, 2);
      contentType = 'application/json';
      filename = `database-export-${new Date().toISOString().split('T')[0]}.json`;
    }

    console.log(`Export completed. Total size: ${responseBody.length} bytes`);

    return new Response(responseBody, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      },
      status: 200
    });

  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
