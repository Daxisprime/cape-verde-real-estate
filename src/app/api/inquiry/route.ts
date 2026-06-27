import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_id, property_title, seller_id, buyer_name, buyer_email, buyer_phone, message } = body;

    if (!property_id || !buyer_name || !buyer_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch seller email from profiles
    let sellerEmail: string | null = null;
    let sellerName: string | null = null;

    if (seller_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', seller_id)
        .maybeSingle();

      sellerEmail = profile?.email || null;
      sellerName = profile?.name || null;
    }

    if (!sellerEmail) {
      return NextResponse.json({ success: true, emailSent: false, reason: 'No seller email found' });
    }

    // Build the HTML email
    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f8fafc;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#2563eb;padding:24px 24px 20px;">
      <h1 style="color:white;margin:0;font-size:18px;font-weight:700;">New Property Inquiry</h1>
      <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px;">Someone is interested in your listing</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;font-size:14px;color:#334155;">
        <strong>${buyer_name}</strong> sent an inquiry about:
      </p>
      <div style="background:#f1f5f9;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">${property_title || 'Your Property'}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#64748b;">ID: ${property_id}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#475569;">
        <tr><td style="padding:6px 0;font-weight:600;width:80px;">Name:</td><td style="padding:6px 0;">${buyer_name}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;">Email:</td><td style="padding:6px 0;"><a href="mailto:${buyer_email}" style="color:#2563eb;">${buyer_email}</a></td></tr>
        ${buyer_phone ? `<tr><td style="padding:6px 0;font-weight:600;">Phone:</td><td style="padding:6px 0;"><a href="tel:${buyer_phone}" style="color:#2563eb;">${buyer_phone}</a></td></tr>` : ''}
      </table>
      ${message ? `
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Message:</p>
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;white-space:pre-wrap;">${message}</p>
      </div>` : ''}
      <div style="margin-top:24px;">
        <a href="mailto:${buyer_email}?subject=Re: ${encodeURIComponent(property_title || 'Your Property Inquiry')}" style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">Reply to Buyer</a>
      </div>
    </div>
    <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">Sent via Pro.CV Real Estate Platform</p>
    </div>
  </div>
</div>
</body>
</html>`;

    const textBody = `New inquiry for "${property_title}" from ${buyer_name} (${buyer_email}${buyer_phone ? ', ' + buyer_phone : ''}).\n\nMessage: ${message || 'No message provided.'}`;

    // Insert into email queue
    const { error: queueError } = await supabase.from('email_queue').insert({
      to_email: sellerEmail,
      to_name: sellerName,
      subject: `New Inquiry: ${property_title || 'Your Property'}`,
      html_body: htmlBody,
      text_body: textBody,
      reference_type: 'inquiry',
      reference_id: property_id,
    });

    if (queueError) {
      console.error('Email queue error:', queueError);
      return NextResponse.json({ success: true, emailSent: false, reason: 'Queue insert failed' });
    }

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    console.error('Inquiry API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
