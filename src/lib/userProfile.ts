import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';

interface UserProfileRow {
  first_name: string;
  last_name: string;
  email: string;
  shoe_size: number;
  weight_kg: number | null;
  printer: string;
  sole_material: string | null;
  upper_material: string | null;
}

function fromRow(row: UserProfileRow): UserProfile {
  return {
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    shoeSize: Number(row.shoe_size),
    weightKg: row.weight_kg != null ? Number(row.weight_kg) : 0,
    printer: row.printer,
    soleMaterial: row.sole_material ?? '',
    upperMaterial: row.upper_material ?? '',
  };
}

export async function loadLatestUserProfile(): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('first_name, last_name, email, shoe_size, weight_kg, printer, sole_material, upper_material')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return fromRow(data as UserProfileRow);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const { error } = await supabase.from('user_profiles').insert({
    first_name: profile.firstName,
    last_name: profile.lastName,
    email: profile.email,
    shoe_size: profile.shoeSize,
    weight_kg: profile.weightKg,
    printer: profile.printer,
    sole_material: profile.soleMaterial,
    upper_material: profile.upperMaterial,
  });

  if (error) throw new Error(error.message);
}
