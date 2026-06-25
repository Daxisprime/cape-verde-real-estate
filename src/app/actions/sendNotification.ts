'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export async function submitInquiry(data: {
  property_id: string;
  seller_id: string;
  full_name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const supabase = getServiceClient();
  if (!supabase) return { error: 'Service unavailable' };

  const { error } = await supabase.from('property_inquiries').insert({
    property_id: data.property_id,
    seller_id: data.seller_id,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone || null,
    message: data.message,
  });

  if (error) return { error: error.message };

  // Fire notification to seller
  await sendSellerNotification(data.seller_id, data);

  return { success: true };
}

async function sendSellerNotification(
  sellerId: string,
  inquiry: { full_name: string; email: string; message: string; property_id: string }
) {
  const supabase = getServiceClient();
  if (!supabase) return;

  // Look up seller email from profiles
  const { data: seller } = await supabase
    .from('profiles')
    .select('email, name')
    .eq('id', sellerId)
    .single();

  if (!seller?.email) return;

  // Attempt to send via Resend API if key is configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Pro.CV <notifications@procv.app>',
          to: seller.email,
          subject: `New inquiry from ${inquiry.full_name}`,
          text: `You have a new inquiry on your listing.\n\nFrom: ${inquiry.full_name} (${inquiry.email})\nMessage: ${inquiry.message}\n\nView your inquiries at your Pro.CV dashboard.`,
        }),
      });
    } catch (e) {
      console.error('Email notification failed:', e);
    }
  }
}
