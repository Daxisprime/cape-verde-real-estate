// Supabase Edge Function: send-email
// Processes the email queue and sends notifications via Resend
//
// Deploy: supabase functions deploy send-email
// Set secret: supabase secrets set RESEND_API_KEY=re_xxxxx
//
// Can be called:
// 1. Via cron job (scheduled)
// 2. Via webhook after inquiry insert
// 3. Manually via API

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailQueueItem {
  id: string;
  to_email: string;
  to_name: string | null;
  from_email: string;
  from_name: string;
  subject: string;
  html_body: string;
  text_body: string | null;
  reference_type: string | null;
  reference_id: string | null;
}

interface ResendResponse {
  id?: string;
  error?: {
    message: string;
    name: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY. Set it with: supabase secrets set RESEND_API_KEY=re_xxxxx');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Parse request body for optional parameters
    let emailId: string | null = null;
    let batchSize = 10;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        emailId = body.emailId || null;
        batchSize = body.batchSize || 10;
      } catch {
        // No body or invalid JSON, use defaults
      }
    }

    // Fetch pending emails
    let query = supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempts', 3)
      .order('created_at', { ascending: true });

    if (emailId) {
      query = query.eq('id', emailId);
    } else {
      query = query.limit(batchSize);
    }

    const { data: emails, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending emails to send', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${emails.length} emails...`);

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each email
    for (const email of emails as EmailQueueItem[]) {
      results.processed++;

      try {
        // Update attempts count
        await supabase
          .from('email_queue')
          .update({ attempts: (email as any).attempts + 1 })
          .eq('id', email.id);

        // Send via Resend
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${email.from_name} <${email.from_email}>`,
            to: email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email,
            subject: email.subject,
            html: email.html_body,
            text: email.text_body || undefined,
            tags: email.reference_type ? [
              { name: 'type', value: email.reference_type },
              { name: 'reference_id', value: email.reference_id || 'none' },
            ] : undefined,
          }),
        });

        const resendData: ResendResponse = await resendResponse.json();

        if (!resendResponse.ok || resendData.error) {
          throw new Error(resendData.error?.message || 'Failed to send email');
        }

        // Mark as sent
        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            processed_at: new Date().toISOString(),
            provider_id: resendData.id,
            error_message: null,
          })
          .eq('id', email.id);

        // Update inquiry email_sent_at if this is an inquiry notification
        if (email.reference_type === 'inquiry' && email.reference_id) {
          await supabase
            .from('property_inquiries')
            .update({ email_sent_at: new Date().toISOString() })
            .eq('id', email.reference_id);
        }

        results.sent++;
        console.log(`✓ Sent email ${email.id} to ${email.to_email}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.failed++;
        results.errors.push(`${email.id}: ${errorMessage}`);

        // Mark as failed if max attempts reached
        const newStatus = (email as any).attempts >= 2 ? 'failed' : 'pending';

        await supabase
          .from('email_queue')
          .update({
            status: newStatus,
            error_message: errorMessage,
            processed_at: new Date().toISOString(),
          })
          .eq('id', email.id);

        // Update inquiry with error
        if (email.reference_type === 'inquiry' && email.reference_id) {
          await supabase
            .from('property_inquiries')
            .update({ email_error: errorMessage })
            .eq('id', email.reference_id);
        }

        console.error(`✗ Failed to send email ${email.id}:`, errorMessage);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${results.processed} emails`,
        ...results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to process emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
