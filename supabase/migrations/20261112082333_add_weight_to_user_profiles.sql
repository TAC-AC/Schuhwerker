/*
# Add weight column to user_profiles

1. Modified Tables
- `user_profiles`: add `weight_kg` column (numeric, nullable) — stores the user's body weight in kilograms.
  This value is important for calculating the damping/cushioning of the shoe sole.

2. Security
- No changes to RLS or grants. The table already has anon+authenticated CRUD policies.
- The new column is automatically covered by the existing grants (all columns updatable/insertable).
*/

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS weight_kg numeric;
