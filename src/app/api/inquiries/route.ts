import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';
import { headers } from 'next/headers';

// Rate limiting (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // 5 inquiries per hour per IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Validate email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sanitize input to prevent XSS
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 5000); // Max 5000 chars for message
}

// POST /api/inquiries - Submit a property inquiry
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0] || 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many inquiries. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      propertyId,
      name,
      email,
      phone,
      message,
      inquiryType = 'general',
      preferredContact = 'email',
      preferredTime,
      userId,
    } = body;

    // Validate required fields
    if (!propertyId || !name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: propertyId, name, email, message' },
        { status: 400 }
      );
    }

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be less than 5000 characters' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      throw new Error('Failed to create database client');
    }

    // Verify property exists and get agent ID
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, agent_id, title, status')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    if (property.status !== 'active') {
      return NextResponse.json(
        { error: 'This property is no longer accepting inquiries' },
        { status: 400 }
      );
    }

    if (!property.agent_id) {
      return NextResponse.json(
        { error: 'No agent assigned to this property' },
        { status: 400 }
      );
    }

    // Create inquiry
    const { data: inquiry, error: insertError } = await supabase
      .from('property_inquiries')
      .insert({
        property_id: propertyId,
        agent_id: property.agent_id,
        user_id: userId || null,
        name: sanitizeInput(name),
        email: email.toLowerCase().trim(),
        phone: phone ? sanitizeInput(phone) : null,
        message: sanitizeInput(message),
        inquiry_type: inquiryType,
        preferred_contact: preferredContact,
        preferred_time: preferredTime ? sanitizeInput(preferredTime) : null,
        source: 'website',
        ip_address: ip,
        user_agent: headersList.get('user-agent') || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating inquiry:', insertError);
      throw insertError;
    }

    // Trigger email sending via Edge Function (fire and forget)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batchSize: 1 }),
      }).catch(err => console.error('Failed to trigger email:', err));
    }

    // Update property inquiry count
    await supabase.rpc('increment_property_inquiries', { property_id: propertyId }).catch(() => {
      // Ignore if RPC doesn't exist
    });

    return NextResponse.json({
      success: true,
      inquiryId: inquiry.id,
      message: 'Your inquiry has been sent. The agent will respond soon!',
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/inquiries - Get inquiries for authenticated agent
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const propertyId = searchParams.get('propertyId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createSupabaseServerClient();
    if (!supabase) {
      throw new Error('Failed to create database client');
    }

    // Build query
    let query = supabase
      .from('property_inquiries')
      .select(`
        *,
        properties:property_id (
          id,
          title,
          price,
          city,
          island,
          images
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      inquiries: data || [],
      total: count || 0,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

// PATCH /api/inquiries - Update inquiry status
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { inquiryId, status, priority } = body;

    if (!inquiryId) {
      return NextResponse.json(
        { error: 'inquiryId is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    if (!supabase) {
      throw new Error('Failed to create database client');
    }

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;

    const { data, error } = await supabase
      .from('property_inquiries')
      .update(updates)
      .eq('id', inquiryId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      inquiry: data,
    });

  } catch (error) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}
