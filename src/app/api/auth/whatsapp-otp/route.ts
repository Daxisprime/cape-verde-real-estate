import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomInt } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

function normalizePhone(phone: string, countryCode: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  const prefix = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  if (phone.startsWith('+')) return phone.replace(/[^\d+]/g, '');
  return `${prefix}${digits}`;
}

const SUPPORTED_COUNTRY_CODES = ['+238', '+1', '+351', '+44', '+55', '+34', '+33', '+49', '+31'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, countryCode = '+238', otpCode } = body as {
      phoneNumber?: string;
      countryCode?: string;
      otpCode?: string;
    };

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { error: 'phoneNumber is required' },
        { status: 400 }
      );
    }

    const cleanCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    if (!SUPPORTED_COUNTRY_CODES.includes(cleanCountryCode)) {
      return NextResponse.json(
        { error: 'Unsupported country code' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phoneNumber, cleanCountryCode);

    if (normalizedPhone.replace(/[^\d]/g, '').length < 7) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    // LOGIC B: Verify existing code
    if (otpCode && typeof otpCode === 'string') {
      if (!/^\d{6}$/.test(otpCode)) {
        return NextResponse.json(
          { error: 'OTP code must be exactly 6 digits' },
          { status: 400 }
        );
      }

      const { data: otpRecord, error: fetchError } = await admin
        .from('whatsapp_otp_codes')
        .select('*')
        .eq('phone', normalizedPhone)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError || !otpRecord) {
        return NextResponse.json(
          { error: 'Codigo expirado ou invalido. Peca um novo codigo.' },
          { status: 401 }
        );
      }

      if (otpRecord.attempts >= 3) {
        await admin
          .from('whatsapp_otp_codes')
          .update({ verified: true })
          .eq('id', otpRecord.id);
        return NextResponse.json(
          { error: 'Demasiadas tentativas. Peca um novo codigo.' },
          { status: 429 }
        );
      }

      const codeMatches = hashCode(otpCode) === otpRecord.code_hash;

      if (!codeMatches) {
        await admin
          .from('whatsapp_otp_codes')
          .update({ attempts: otpRecord.attempts + 1 })
          .eq('id', otpRecord.id);
        return NextResponse.json(
          { error: 'Codigo incorreto. Tente novamente.' },
          { status: 401 }
        );
      }

      // Mark code as used
      await admin
        .from('whatsapp_otp_codes')
        .update({ verified: true })
        .eq('id', otpRecord.id);

      // Find or create user by phone number
      const { data: existingUsers } = await admin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u) => u.phone === normalizedPhone
      );

      let userId: string;
      let isNewUser = false;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const { data: newUser, error: createError } = await admin.auth.admin.createUser({
          phone: normalizedPhone,
          phone_confirm: true,
          user_metadata: { login_method: 'whatsapp_otp' },
        });
        if (createError || !newUser?.user) {
          return NextResponse.json(
            { error: 'Falha ao criar conta. Tente novamente.' },
            { status: 500 }
          );
        }
        userId = newUser.user.id;
        isNewUser = true;

        // Create profile for new user
        await admin.from('profiles').upsert({
          id: userId,
          email: '',
          name: '',
          phone: normalizedPhone,
          whatsapp_number: normalizedPhone,
          role: 'buyer',
          verified: true,
        } as never, { onConflict: 'id' });
      }

      // Generate a session link for the user
      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email: existingUser?.email || `whatsapp_${normalizedPhone.replace(/\+/g, '')}@procv.local`,
        options: { redirectTo: `${request.nextUrl.origin}/auth/callback` },
      });

      if (linkError || !linkData) {
        // Fallback: return user ID so frontend can do a custom session
        return NextResponse.json({
          success: true,
          verified: true,
          userId,
          isNewUser,
          message: 'Verificacao concluida com sucesso.',
          sessionMethod: 'manual',
        });
      }

      // Extract the token from the magic link for client-side verification
      const linkUrl = new URL(linkData.properties?.action_link || '');
      const token = linkUrl.searchParams.get('token') || linkUrl.hash;

      return NextResponse.json({
        success: true,
        verified: true,
        userId,
        isNewUser,
        message: 'Verificacao concluida com sucesso.',
        sessionMethod: 'magic_link',
        actionLink: linkData.properties?.action_link,
        tokenHash: linkData.properties?.hashed_token,
        emailRedirect: existingUser?.email || `whatsapp_${normalizedPhone.replace(/\+/g, '')}@procv.local`,
      });
    }

    // LOGIC A: Generate and store new OTP code
    // Rate-limit: max 3 codes per phone in 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: recentCodes } = await admin
      .from('whatsapp_otp_codes')
      .select('*', { count: 'exact', head: true })
      .eq('phone', normalizedPhone)
      .gt('created_at', tenMinutesAgo);

    if (recentCodes && recentCodes >= 3) {
      return NextResponse.json(
        { error: 'Demasiados codigos enviados. Aguarde 10 minutos.' },
        { status: 429 }
      );
    }

    // Generate secure 6-digit code
    const code = String(randomInt(100000, 999999));
    const codeHashed = hashCode(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Store in database
    const { error: insertError } = await admin
      .from('whatsapp_otp_codes')
      .insert({
        phone: normalizedPhone,
        code_hash: codeHashed,
        expires_at: expiresAt,
      });

    if (insertError) {
      return NextResponse.json(
        { error: 'Falha ao gerar codigo. Tente novamente.' },
        { status: 500 }
      );
    }

    // In production, this would call the WhatsApp Business API to send the code.
    // For now, return a mock success mirroring the WhatsApp API dispatch handshake.
    return NextResponse.json({
      success: true,
      message: 'Codigo enviado via WhatsApp.',
      phone: normalizedPhone,
      expiresIn: 300,
      whatsappDispatch: {
        status: 'queued',
        messageId: `wa_${Date.now()}_${normalizedPhone.replace(/\+/g, '')}`,
        provider: 'whatsapp_business_api',
        template: 'otp_verification',
      },
      // DEV ONLY - remove in production
      ...(process.env.NODE_ENV === 'development' ? { _devCode: code } : {}),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
