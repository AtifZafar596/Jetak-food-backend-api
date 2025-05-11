-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;

-- Create new policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Allow user creation"
    ON users FOR INSERT
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role; 