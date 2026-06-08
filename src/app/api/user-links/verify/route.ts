import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, createSupabaseServerClient } from '@/lib/supabase';
import { type LinkPlatform, PLATFORM_CONFIG } from '@/lib/user-links';

// In-memory store for verification codes (use Redis in production)
const verificationCodes = new Map<string, { code: string; expires: number; attempts: number }>();

// Generate a 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Get cache key for verification
function getCacheKey(userId: string, platform: string): string {
  return `${userId}:${platform}`;
}

// POST /api/user-links/verify - Send or verify code
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { userId, platform, action, code } = body;

    if (!userId || !platform || !action) {
      return NextResponse.json(
        { error: 'userId, platform, and action are required' },
        { status: 400 }
      );
    }

    // Validate platform
    if (!PLATFORM_CONFIG[platform as LinkPlatform]) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey(userId, platform);

    switch (action) {
      case 'send_code': {
        // Generate and store verification code
        const verificationCode = generateCode();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        verificationCodes.set(cacheKey, {
          code: verificationCode,
          expires: expiresAt,
          attempts: 0,
        });

        // Get the user's link to find their contact info
        const supabase = createSupabaseServerClient();
        if (!supabase) {
          throw new Error('Failed to create database client');
        }

        const { data: link } = await supabase
          .from('user_links')
          .select('raw_input, formatted_url')
          .eq('user_id', userId)
          .eq('platform', platform)
          .single();

        if (!link) {
          return NextResponse.json(
            { error: 'Link not found' },
            { status: 404 }
          );
        }

        // In production, send actual SMS/email/WhatsApp message
        // For now, we'll simulate it
        console.log(`[VERIFICATION] Sending code ${verificationCode} to ${platform}: ${link.raw_input}`);

        // Simulate sending based on platform
        switch (platform) {
          case 'email':
            // In production: Use SendGrid, Resend, or similar
            console.log(`[EMAIL] To: ${link.raw_input}, Code: ${verificationCode}`);
            break;

          case 'phone':
            // In production: Use Twilio SMS
            console.log(`[SMS] To: ${link.raw_input}, Code: ${verificationCode}`);
            break;

          case 'whatsapp':
            // In production: Use Twilio WhatsApp or WhatsApp Business API
            console.log(`[WHATSAPP] To: ${link.raw_input}, Code: ${verificationCode}`);
            break;

          default:
            return NextResponse.json(
              { error: 'Verification not supported for this platform' },
              { status: 400 }
            );
        }

        // For development, include code in response (REMOVE IN PRODUCTION)
        return NextResponse.json({
          success: true,
          message: `Verification code sent to your ${PLATFORM_CONFIG[platform as LinkPlatform].label}`,
          // DEVELOPMENT ONLY - Remove in production
          debug_code: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
        });
      }

      case 'verify_code': {
        if (!code) {
          return NextResponse.json(
            { error: 'Verification code is required' },
            { status: 400 }
          );
        }

        const stored = verificationCodes.get(cacheKey);

        if (!stored) {
          return NextResponse.json(
            { error: 'No verification code found. Please request a new one.' },
            { status: 400 }
          );
        }

        // Check expiration
        if (Date.now() > stored.expires) {
          verificationCodes.delete(cacheKey);
          return NextResponse.json(
            { error: 'Verification code expired. Please request a new one.' },
            { status: 400 }
          );
        }

        // Check attempts (max 5)
        if (stored.attempts >= 5) {
          verificationCodes.delete(cacheKey);
          return NextResponse.json(
            { error: 'Too many attempts. Please request a new code.' },
            { status: 429 }
          );
        }

        // Increment attempts
        stored.attempts++;

        // Verify code
        if (stored.code !== code) {
          return NextResponse.json(
            { error: 'Invalid verification code', attemptsRemaining: 5 - stored.attempts },
            { status: 400 }
          );
        }

        // Code is valid - update the link as verified
        const supabase = createSupabaseServerClient();
        if (!supabase) {
          throw new Error('Failed to create database client');
        }

        const { error: updateError } = await supabase
          .from('user_links')
          .update({ is_verified: true })
          .eq('user_id', userId)
          .eq('platform', platform);

        if (updateError) {
          throw updateError;
        }

        // Clean up
        verificationCodes.delete(cacheKey);

        return NextResponse.json({
          success: true,
          message: 'Link verified successfully',
        });
      }

      case 'check_status': {
        // Check if a verification is in progress
        const stored = verificationCodes.get(cacheKey);

        if (!stored || Date.now() > stored.expires) {
          return NextResponse.json({
            inProgress: false,
          });
        }

        return NextResponse.json({
          inProgress: true,
          expiresIn: Math.floor((stored.expires - Date.now()) / 1000),
          attemptsRemaining: 5 - stored.attempts,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in verification:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
