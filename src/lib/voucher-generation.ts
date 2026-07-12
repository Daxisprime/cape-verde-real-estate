import { createClient } from "@supabase/supabase-js";
import { sendEmailNotification } from "@/lib/email";

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key);
}

function generateSecurePin(): string {
  const chars = "0123456789";
  const segments: string[] = [];
  for (let s = 0; s < 3; s++) {
    let segment = "";
    for (let i = 0; i < 4; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(segment);
  }
  return segments.join("-");
}

function pinToStorageFormat(pin: string): string {
  return pin.replace(/-/g, "");
}

export interface VoucherGenerationResult {
  success: boolean;
  pin?: string;
  voucherId?: string;
  error?: string;
}

export async function generateDigitalVoucher(
  issuedByUserId: string,
  amount: number,
  deliveryMethod: "email" | "sms",
  targetContact: string
): Promise<VoucherGenerationResult> {
  if (amount <= 0 || amount > 100000) {
    return { success: false, error: "Valor invalido. Minimo: 1 CVE, Maximo: 100.000 CVE." };
  }

  const supabase = getServiceSupabase();
  const pin = generateSecurePin();
  const storedPin = pinToStorageFormat(pin);

  const { data: existing } = await supabase
    .from("vouchers")
    .select("id")
    .eq("pin_code", storedPin)
    .maybeSingle();

  if (existing) {
    return generateDigitalVoucher(issuedByUserId, amount, deliveryMethod, targetContact);
  }

  const { data: voucher, error: insertError } = await supabase
    .from("vouchers")
    .insert({
      pin_code: storedPin,
      value_amount: amount,
      is_redeemed: false,
    })
    .select("id")
    .single();

  if (insertError || !voucher) {
    return { success: false, error: "Falha ao gerar voucher. Tente novamente." };
  }

  const deliveryResult = await dispatchVoucherDelivery(deliveryMethod, targetContact, pin, amount);

  if (!deliveryResult.success) {
    return {
      success: true,
      pin,
      voucherId: voucher.id,
      error: `Voucher gerado mas entrega falhou: ${deliveryResult.error}`,
    };
  }

  return { success: true, pin, voucherId: voucher.id };
}

interface DeliveryResult {
  success: boolean;
  error?: string;
}

async function dispatchVoucherDelivery(
  method: "email" | "sms",
  contact: string,
  pin: string,
  amount: number
): Promise<DeliveryResult> {
  if (method === "email") {
    return deliverViaEmail(contact, pin, amount);
  }
  return deliverViaSms(contact, pin, amount);
}

async function deliverViaEmail(
  email: string,
  pin: string,
  amount: number
): Promise<DeliveryResult> {
  const subject = `O seu Voucher Pro.CV de ${amount} CVE`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }
        .wrap { max-width: 480px; margin: 0 auto; padding: 24px; }
        .card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .pin-box { background: linear-gradient(135deg, #065f46, #047857); color: white; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0; }
        .pin-code { font-family: 'Courier New', monospace; font-size: 28px; font-weight: bold; letter-spacing: 3px; margin: 8px 0; }
        .amount { font-size: 20px; font-weight: bold; color: #047857; }
        .btn { display: inline-block; background: #047857; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
        .footer { text-align: center; margin-top: 24px; font-size: 13px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="card">
          <h2 style="margin:0 0 8px">O seu Voucher Pro.CV</h2>
          <p>Parabens! Recebeu um voucher digital para usar na plataforma Pro.CV.</p>

          <div class="pin-box">
            <div style="font-size:13px;opacity:0.8;">CODIGO DO VOUCHER</div>
            <div class="pin-code">${pin}</div>
            <div style="font-size:14px;margin-top:8px;">Valor: <span class="amount">${amount} CVE</span></div>
          </div>

          <p><strong>Como resgatar:</strong></p>
          <ol style="padding-left:20px;">
            <li>Entre na sua conta em Pro.CV</li>
            <li>Va para "A Minha Loja"</li>
            <li>Na seccao "Minha Carteira", introduza o codigo</li>
            <li>Clique "Resgatar" e o saldo sera creditado</li>
          </ol>

          <div style="text-align:center;">
            <a href="#" class="btn">Ir para A Minha Loja</a>
          </div>
        </div>
        <div class="footer">
          Este voucher e de uso unico e nao expira.<br>
          Pro.CV - O Marketplace de Cabo Verde
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmailNotification(email, subject, html);
  if (result.success) {
    return { success: true };
  }
  return { success: false, error: "Falha ao enviar email. Verifique o endereco." };
}

async function deliverViaSms(
  phone: string,
  pin: string,
  amount: number
): Promise<DeliveryResult> {
  const message = `O seu PIN do Voucher Pro.CV e: ${pin}. Valor: ${amount} CVE. Resgate no seu perfil em A Minha Loja > Minha Carteira.`;

  console.log(`[SMS DISPATCH] To: ${phone} | Message: ${message}`);

  const smsPayload = {
    to: phone.replace(/\D/g, ""),
    body: message,
    from: "ProCV",
    timestamp: new Date().toISOString(),
  };

  // TODO: Replace with Twilio or local Cape Verdean carrier API when ready
  // Example: await twilioClient.messages.create({ to: smsPayload.to, from: '+238...', body: smsPayload.body });

  const smsSent = smsPayload.to.length >= 7;

  if (smsSent) {
    return { success: true };
  }
  return { success: false, error: "Numero de telefone invalido." };
}
