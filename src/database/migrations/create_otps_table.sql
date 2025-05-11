-- Create OTPs table
CREATE TABLE IF NOT EXISTS otps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on phone and code for faster lookups
CREATE INDEX IF NOT EXISTS idx_otps_phone_code ON otps(phone, code);

-- Create index on expires_at for faster cleanup
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_otps_updated_at
    BEFORE UPDATE ON otps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 