-- ============================================
-- ProCV Property Inquiries Migration
-- Stores property inquiries from potential buyers
-- Triggers email notifications to agents
-- ============================================

-- ============================================
-- 1. INQUIRY STATUS ENUM
-- ============================================
DROP TYPE IF EXISTS inquiry_status CASCADE;

CREATE TYPE inquiry_status AS ENUM (
  'new',           -- Just submitted
  'read',          -- Agent has viewed
  'replied',       -- Agent has responded
  'scheduled',     -- Viewing scheduled
  'closed',        -- Inquiry resolved
  'spam'           -- Marked as spam
);

-- ============================================
-- 2. INQUIRY PRIORITY ENUM
-- ============================================
DROP TYPE IF EXISTS inquiry_priority CASCADE;

CREATE TYPE inquiry_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- ============================================
-- 3. PROPERTY INQUIRIES TABLE
-- ============================================
DROP TABLE IF EXISTS property_inquiries CASCADE;

CREATE TABLE property_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Property reference
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  -- Agent who owns the listing
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Inquirer (can be anonymous or authenticated)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Contact information (for anonymous users)
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  -- Inquiry details
  message TEXT NOT NULL,
  inquiry_type VARCHAR(50) DEFAULT 'general', -- general, viewing, offer, question

  -- Preferred contact method
  preferred_contact VARCHAR(20) DEFAULT 'email', -- email, phone, whatsapp
  preferred_time VARCHAR(100), -- e.g., "Weekday mornings", "Anytime"

  -- Status tracking
  status inquiry_status DEFAULT 'new' NOT NULL,
  priority inquiry_priority DEFAULT 'medium' NOT NULL,

  -- Agent response tracking
  first_response_at TIMESTAMPTZ,
  response_time_minutes INTEGER,

  -- Email notification tracking
  email_sent_at TIMESTAMPTZ,
  email_error TEXT,

  -- Metadata
  source VARCHAR(50) DEFAULT 'website', -- website, mobile, api
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ
);

-- ============================================
-- 4. INDEXES
-- ============================================
CREATE INDEX idx_inquiries_property ON property_inquiries(property_id);
CREATE INDEX idx_inquiries_agent ON property_inquiries(agent_id);
CREATE INDEX idx_inquiries_status ON property_inquiries(status);
CREATE INDEX idx_inquiries_created ON property_inquiries(created_at DESC);
CREATE INDEX idx_inquiries_agent_new ON property_inquiries(agent_id, status)
  WHERE status = 'new';

-- ============================================
-- 5. AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_inquiry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Track status changes
  IF OLD.status = 'new' AND NEW.status = 'read' THEN
    NEW.read_at = NOW();
  END IF;

  IF OLD.status != 'replied' AND NEW.status = 'replied' THEN
    NEW.replied_at = NOW();
    NEW.first_response_at = COALESCE(NEW.first_response_at, NOW());
    NEW.response_time_minutes = EXTRACT(EPOCH FROM (NOW() - OLD.created_at)) / 60;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_inquiry_timestamp ON property_inquiries;
CREATE TRIGGER trigger_inquiry_timestamp
  BEFORE UPDATE ON property_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiry_timestamp();

-- ============================================
-- 6. EMAIL NOTIFICATION QUEUE TABLE
-- ============================================
DROP TABLE IF EXISTS email_queue CASCADE;

CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Email details
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(100),
  from_email VARCHAR(255) DEFAULT 'notifications@procv.cv',
  from_name VARCHAR(100) DEFAULT 'PropertyCV',

  subject VARCHAR(500) NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,

  -- Template info
  template_id VARCHAR(100),
  template_data JSONB,

  -- Reference
  reference_type VARCHAR(50), -- inquiry, verification, welcome, etc.
  reference_id UUID,

  -- Processing status
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed, cancelled
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Results
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  provider_id VARCHAR(255), -- ID from email provider

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_email_queue_status ON email_queue(status, scheduled_for)
  WHERE status = 'pending';

-- ============================================
-- 7. FUNCTION TO QUEUE INQUIRY EMAIL
-- ============================================
CREATE OR REPLACE FUNCTION queue_inquiry_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_agent RECORD;
  v_property RECORD;
  v_html TEXT;
  v_subject TEXT;
BEGIN
  -- Get agent details
  SELECT full_name, email INTO v_agent
  FROM profiles
  WHERE id = NEW.agent_id;

  -- Get property details
  SELECT title, price, city, island INTO v_property
  FROM properties
  WHERE id = NEW.property_id;

  -- Build email subject
  v_subject := 'New Inquiry: ' || v_property.title;

  -- Build HTML email body
  v_html := '
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .property-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .inquiry-details { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .message-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; }
        .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .label { color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
        .value { font-weight: 600; color: #111827; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">New Property Inquiry</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Someone is interested in your listing!</p>
        </div>

        <div class="content">
          <div class="property-card">
            <p class="label">Property</p>
            <p class="value" style="font-size: 18px;">' || v_property.title || '</p>
            <p style="color: #2563eb; font-size: 20px; font-weight: bold; margin: 10px 0;">
              €' || TO_CHAR(v_property.price, 'FM999,999,999') || '
            </p>
            <p style="color: #6b7280;">' || v_property.city || ', ' || v_property.island || '</p>
          </div>

          <div class="inquiry-details">
            <h3 style="margin-top: 0;">Contact Information</h3>

            <div style="display: grid; gap: 15px;">
              <div>
                <p class="label">Name</p>
                <p class="value">' || NEW.name || '</p>
              </div>
              <div>
                <p class="label">Email</p>
                <p class="value"><a href="mailto:' || NEW.email || '">' || NEW.email || '</a></p>
              </div>
              ' || CASE WHEN NEW.phone IS NOT NULL THEN '
              <div>
                <p class="label">Phone</p>
                <p class="value"><a href="tel:' || NEW.phone || '">' || NEW.phone || '</a></p>
              </div>
              ' ELSE '' END || '
              <div>
                <p class="label">Preferred Contact</p>
                <p class="value">' || INITCAP(NEW.preferred_contact) || '</p>
              </div>
            </div>
          </div>

          <div class="message-box">
            <p class="label">Message</p>
            <p style="margin: 0; white-space: pre-wrap;">' || NEW.message || '</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://procv.cv/agent-profile?tab=leads" class="cta-button">
              View in Dashboard
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            <strong>Tip:</strong> Responding quickly to inquiries increases your chances of closing deals.
            The average response time for top agents is under 2 hours.
          </p>
        </div>

        <div class="footer">
          <p>PropertyCV - Cape Verde Real Estate Platform</p>
          <p style="font-size: 12px;">
            <a href="https://procv.cv/settings/notifications" style="color: #6b7280;">
              Manage notification preferences
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  ';

  -- Insert into email queue
  INSERT INTO email_queue (
    to_email,
    to_name,
    subject,
    html_body,
    text_body,
    reference_type,
    reference_id,
    template_data
  ) VALUES (
    v_agent.email,
    v_agent.full_name,
    v_subject,
    v_html,
    'New inquiry for ' || v_property.title || ' from ' || NEW.name || '. Message: ' || NEW.message,
    'inquiry',
    NEW.id,
    jsonb_build_object(
      'agent_name', v_agent.full_name,
      'property_title', v_property.title,
      'inquirer_name', NEW.name,
      'inquirer_email', NEW.email
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new inquiries
DROP TRIGGER IF EXISTS trigger_inquiry_notification ON property_inquiries;
CREATE TRIGGER trigger_inquiry_notification
  AFTER INSERT ON property_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION queue_inquiry_notification();

-- ============================================
-- 8. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can create an inquiry
CREATE POLICY "Anyone can create inquiry"
  ON property_inquiries FOR INSERT
  WITH CHECK (true);

-- Agents can view inquiries for their properties
CREATE POLICY "Agents can view their inquiries"
  ON property_inquiries FOR SELECT
  TO authenticated
  USING (agent_id = auth.uid());

-- Inquirers can view their own inquiries
CREATE POLICY "Users can view own inquiries"
  ON property_inquiries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Agents can update inquiries for their properties
CREATE POLICY "Agents can update their inquiries"
  ON property_inquiries FOR UPDATE
  TO authenticated
  USING (agent_id = auth.uid());

-- RLS for email_queue (admin only in production)
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Get inquiry statistics for an agent
CREATE OR REPLACE FUNCTION get_agent_inquiry_stats(p_agent_id UUID)
RETURNS TABLE (
  total_inquiries BIGINT,
  new_inquiries BIGINT,
  replied_inquiries BIGINT,
  avg_response_minutes NUMERIC,
  response_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_inquiries,
    COUNT(*) FILTER (WHERE status = 'new')::BIGINT as new_inquiries,
    COUNT(*) FILTER (WHERE status = 'replied')::BIGINT as replied_inquiries,
    ROUND(AVG(response_time_minutes)::NUMERIC, 1) as avg_response_minutes,
    ROUND((COUNT(*) FILTER (WHERE status = 'replied')::NUMERIC / NULLIF(COUNT(*), 0) * 100), 1) as response_rate
  FROM property_inquiries
  WHERE agent_id = p_agent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark inquiry as read
CREATE OR REPLACE FUNCTION mark_inquiry_read(p_inquiry_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE property_inquiries
  SET status = 'read'
  WHERE id = p_inquiry_id
    AND status = 'new'
    AND agent_id = auth.uid();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. VERIFICATION
-- ============================================
SELECT
  'INQUIRIES TABLE CREATED' as status,
  (SELECT COUNT(*) FROM pg_type WHERE typname = 'inquiry_status') as status_enum,
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'property_inquiries') as table_created,
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'email_queue') as queue_created;
