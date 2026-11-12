/*
# Add sole_material and upper_material columns to user_profiles

1. Modified Tables
- `user_profiles`: add `sole_material` (text, nullable) — material for the shoe sole.
- `user_profiles`: add `upper_material` (text, nullable) — material for the shoe upper.
  Both are selected by the user in the settings and are important for print configuration.
  The existing `material` column is kept for backwards compatibility but no longer used by the app.

2. Security
- No changes to RLS or grants. Existing grants cover all columns.
*/

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS sole_material text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS upper_material text;
