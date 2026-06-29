import { Resend } from 'resend';
import { Property, agentDatabase } from '@/data/cape-verde-properties';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface LeadData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId: string;
  agentId: string;
  inquiryType: 'viewing' | 'information' | 'offer' | 'financing';
  urgency: 'low' | 'medium' | 'high';
  budget?: number;
  timeframe: string;
  source: 'contact_form' | 'chat' | 'phone' | 'direct';
  leadScore?: number;
}

export interface ViewingRequest {
  propertyId: string;
  agentId: string;
  userName: string;
  userEmail: string;
  requestedDate: string;
  requestedTime: string;
  message?: string;
  phone?: string;
}

/**
 * Calculate lead score based on various factors
 */
export function calculateLeadScore(leadData: Partial<LeadData>, property: Property): number {
  let score = 50; // Base score

  // Budget factor (40% weight)
  if (leadData.budget && property.price) {
    const budgetRatio = leadData.budget / property.price;
    if (budgetRatio >= 1.2) score += 25;
    else if (budgetRatio >= 1.0) score += 20;
    else if (budgetRatio >= 0.8) score += 15;
    else if (budgetRatio >= 0.6) score += 10;
  }

  // Urgency factor (20% weight)
  if (leadData.urgency === 'high') score += 20;
  else if (leadData.urgency === 'medium') score += 10;

  // Timeframe factor (20% weight)
  switch (leadData.timeframe) {
    case 'immediate': score += 20; break;
    case 'this_month': score += 15; break;
    case 'next_3_months': score += 10; break;
    case 'next_6_months': score += 5; break;
  }

  // Inquiry type factor (15% weight)
  if (leadData.inquiryType === 'offer') score += 15;
  else if (leadData.inquiryType === 'viewing') score += 10;
  else if (leadData.inquiryType === 'financing') score += 8;

  // Contact completeness (5% weight)
  if (leadData.name && leadData.email && leadData.phone) score += 5;

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Generate lead notification email for agents
 */
export function generateLeadNotificationEmail(leadData: LeadData, property: Property): EmailTemplate {
  const agent = agentDatabase[leadData.agentId];
  const urgencyColor = leadData.urgency === 'high' ? '#ef4444' : leadData.urgency === 'medium' ? '#f59e0b' : '#10b981';
  const scoreColor = (leadData.leadScore || 0) >= 80 ? '#10b981' : (leadData.leadScore || 0) >= 60 ? '#f59e0b' : '#ef4444';

  const subject = `🔥 New ${leadData.urgency.toUpperCase()} Priority Lead - ${property.title}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
            .header { background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .property-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; background: #f9fafb; }
            .lead-score { background: ${scoreColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; }
            .urgency-badge { background: ${urgencyColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
            .btn { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
            .info-item { background: #f3f4f6; padding: 12px; border-radius: 6px; }
            .info-label { font-weight: bold; color: #374151; font-size: 14px; }
            .info-value { color: #111827; margin-top: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 New Lead Alert!</h1>
                <span class="lead-score">Lead Score: ${leadData.leadScore || 'N/A'}/100</span>
            </div>

            <div class="content">
                <div style="text-align: center; margin-bottom: 25px;">
                    <span class="urgency-badge">${leadData.urgency.toUpperCase()} PRIORITY</span>
                </div>

                <div class="property-card">
                    <h3>🏠 Property Details</h3>
                    <strong>${property.title}</strong><br>
                    📍 ${property.location}, ${property.island}<br>
                    💰 €${property.price.toLocaleString()}<br>
                    🛏️ ${property.bedrooms} bed • 🛁 ${property.bathrooms} bath • 📐 ${property.totalArea}m²
                </div>

                <h3>👤 Lead Information</h3>
                <div class="grid">
                    <div class="info-item">
                        <div class="info-label">Name</div>
                        <div class="info-value">${leadData.name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${leadData.email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${leadData.phone || 'Not provided'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Inquiry Type</div>
                        <div class="info-value">${leadData.inquiryType.charAt(0).toUpperCase() + leadData.inquiryType.slice(1)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Budget</div>
                        <div class="info-value">${leadData.budget ? `€${leadData.budget.toLocaleString()}` : 'Not specified'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Timeframe</div>
                        <div class="info-value">${leadData.timeframe.replace('_', ' ')}</div>
                    </div>
                </div>

                <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h4>💬 Message:</h4>
                    <p style="margin: 0; font-style: italic;">"${leadData.message}"</p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="mailto:${leadData.email}" class="btn">📧 Reply to Lead</a>
                    <a href="tel:${leadData.phone}" class="btn">📞 Call Now</a>
                </div>

                <hr style="margin: 30px 0; border: none; height: 1px; background: #e5e7eb;">

                <p style="font-size: 14px; color: #6b7280;">
                    📊 <strong>Lead Score Breakdown:</strong><br>
                    • Budget compatibility: ${leadData.budget ? Math.round((leadData.budget / property.price) * 100) : 'N/A'}%<br>
                    • Urgency level: ${leadData.urgency}<br>
                    • Timeframe: ${leadData.timeframe}<br>
                    • Source: ${leadData.source}
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
🎯 NEW LEAD ALERT - Lead Score: ${leadData.leadScore}/100

🏠 PROPERTY: ${property.title}
📍 Location: ${property.location}, ${property.island}
💰 Price: €${property.price.toLocaleString()}

👤 LEAD DETAILS:
Name: ${leadData.name}
Email: ${leadData.email}
Phone: ${leadData.phone || 'Not provided'}
Inquiry: ${leadData.inquiryType}
Urgency: ${leadData.urgency}
Budget: ${leadData.budget ? `€${leadData.budget.toLocaleString()}` : 'Not specified'}
Timeframe: ${leadData.timeframe}

💬 MESSAGE:
"${leadData.message}"

📞 ACTIONS:
Reply: ${leadData.email}
Call: ${leadData.phone || 'No phone provided'}

Generated by ProCV Lead Management System
  `;

  return { subject, html, text };
}

/**
 * Send email using Resend
 */
export async function sendEmail(
  to: string,
  template: EmailTemplate,
  templateData: Record<string, unknown> = {}
): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Pro.CV <onboarding@resend.dev>',
      to,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Process property inquiry and send notifications
 */
export async function processPropertyInquiry(
  leadData: LeadData,
  property: Property
): Promise<{ success: boolean; leadScore: number }> {
  try {
    // Calculate lead score
    const leadScore = calculateLeadScore(leadData, property);
    leadData.leadScore = leadScore;

    // Generate emails
    const agentEmail = generateLeadNotificationEmail(leadData, property);

    // Send agent notification
    const agent = agentDatabase[leadData.agentId];
    if (agent?.email) {
      await sendEmail(agent.email, agentEmail, {
        agent_name: agent.name,
        property_title: property.title,
        lead_name: leadData.name,
        lead_score: leadScore,
      });
    }

    // Log lead for analytics
    console.log('📊 Lead processed:', {
      propertyId: leadData.propertyId,
      agentId: leadData.agentId,
      leadScore,
      urgency: leadData.urgency,
      source: leadData.source,
    });

    return { success: true, leadScore };
  } catch (error) {
    console.error('❌ Failed to process property inquiry:', error);
    return { success: false, leadScore: 0 };
  }
}

export async function sendEmailNotification(toEmail: string, subject: string, htmlContent: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Pro.CV <onboarding@resend.dev>',
      to: toEmail,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Email dispatch failed:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email dispatch failed:', error);
    return { success: false, error };
  }
}

// Export email service functions
export const EmailService = {
  calculateLeadScore,
  generateLeadNotificationEmail,
  sendEmail,
  sendEmailNotification,
  processPropertyInquiry,
};
