/*
# Create user_profiles table

1. New Tables
- `user_profiles`
  - `id` (uuid, primary key, generated automatically)
  - `first_name` (text, required)
  - `last_name` (text, required)
  - `email` (text, required)
  - `shoe_size` (numeric, required, e.g. 42 or 42.5)
  - `printer` (text, required, name of the 3D printer)
  - `material` (text, required, printing material)
  - `created_at` (timestamp, set automatically)

2. Security
- Row level security is enabled on `user_profiles`.
- The app has no sign-in, so `anon` and `authenticated` roles get the grants and policies.
- Each CRUD verb has its own policy.

3. Notes
- Every saved form creates a new row; no existing rows are changed or removed.
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  shoe_size numeric NOT NULL,
  printer text NOT NULL,
  material text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_user_profiles" ON user_profiles;
CREATE POLICY "anon_select_user_profiles" ON user_profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_user_profiles" ON user_profiles;
CREATE POLICY "anon_insert_user_profiles" ON user_profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_user_profiles" ON user_profiles;
CREATE POLICY "anon_update_user_profiles" ON user_profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_user_profiles" ON user_profiles;
CREATE POLICY "anon_delete_user_profiles" ON user_profiles FOR DELETE
  TO anon, authenticated USING (true);
