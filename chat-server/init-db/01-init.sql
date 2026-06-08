-- ProCV Chat System Database Initialization
-- This script sets up all necessary tables for the real-time chat system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'buyer',
    avatar_url TEXT,
    phone VARCHAR(50),
    is_verified BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL DEFAULT 'property_inquiry',
    title VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Conversation Participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'participant',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    is_typing BOOLEAN DEFAULT false,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, user_id)
);

-- Create Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text',
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Message Reads table
CREATE TABLE IF NOT EXISTS message_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

-- Create File Attachments table
CREATE TABLE IF NOT EXISTS file_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    upload_status VARCHAR(50) DEFAULT 'completed',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create User Presence table
CREATE TABLE IF NOT EXISTS user_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'offline',
    status_message TEXT,
    socket_id VARCHAR(255),
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, socket_id)
);

-- Create Property Inquiries table (for property-specific chat context)
CREATE TABLE IF NOT EXISTS property_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    property_id VARCHAR(255) NOT NULL,
    property_title VARCHAR(255),
    property_image TEXT,
    inquiry_type VARCHAR(50) DEFAULT 'general',
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Analytics Events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online);

CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_last_activity ON conversations(last_activity DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON messages(reply_to_id);

CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user_id ON message_reads(user_id);

CREATE INDEX IF NOT EXISTS idx_file_attachments_message_id ON file_attachments(message_id);

CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_ping ON user_presence(last_ping);

CREATE INDEX IF NOT EXISTS idx_property_inquiries_conversation_id ON property_inquiries(conversation_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_property_id ON property_inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_agent_id ON property_inquiries(agent_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_buyer_id ON property_inquiries(buyer_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Create trigger to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_inquiries_updated_at BEFORE UPDATE ON property_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_presence_updated_at BEFORE UPDATE ON user_presence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update conversation last_activity when new messages are added
CREATE OR REPLACE FUNCTION update_conversation_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_activity = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_last_activity_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_activity();

-- Insert demo users for testing
INSERT INTO users (id, email, name, role, avatar_url, is_verified) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'agent@procv.cv', 'John Agent', 'agent', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', true),
    ('550e8400-e29b-41d4-a716-446655440002', 'sarah@procv.cv', 'Sarah Agent', 'agent', 'https://images.unsplash.com/photo-1494790108755-2616b768e9f1?w=150&h=150&fit=crop&crop=face', true),
    ('550e8400-e29b-41d4-a716-446655440003', 'demo@procv.cv', 'Demo User', 'buyer', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face', true),
    ('550e8400-e29b-41d4-a716-446655440004', 'admin@procv.cv', 'Admin User', 'admin', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face', true)
ON CONFLICT (email) DO NOTHING;

-- Create demo conversation
INSERT INTO conversations (id, type, title, metadata) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'property_inquiry', 'Modern Beachfront Villa Inquiry',
     '{"propertyId": "1", "propertyTitle": "Modern Beachfront Villa", "propertyImage": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/522602290.jpg", "agentId": "550e8400-e29b-41d4-a716-446655440001", "inquiryType": "viewing"}')
ON CONFLICT DO NOTHING;

-- Add participants to demo conversation
INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'agent'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'buyer')
ON CONFLICT DO NOTHING;

-- Add demo messages
INSERT INTO messages (id, conversation_id, sender_id, content, type) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001',
     'Hello! I see you''re interested in the Modern Beachfront Villa. I''d be happy to help you with any questions or schedule a viewing.', 'text'),
    ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003',
     'Hi John! Yes, I''m very interested. The property looks amazing. Could you tell me more about the neighborhood and amenities?', 'text')
ON CONFLICT DO NOTHING;

-- Create property inquiry record
INSERT INTO property_inquiries (conversation_id, property_id, property_title, property_image, inquiry_type, agent_id, buyer_id) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '1', 'Modern Beachfront Villa',
     'https://cf.bstatic.com/xdata/images/hotel/max1024x768/522602290.jpg', 'viewing',
     '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT DO NOTHING;

-- Grant permissions to the application user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO procv_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO procv_user;
