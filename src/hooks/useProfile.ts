'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/types';

interface UseProfileReturn {
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found — not a fatal error
        console.warn('Profile fetch error:', error.message);
      }

      setProfile(data ?? null);
    } catch {
      // Guest or offline — silently fall back
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    role: (profile?.role ?? null) as UserRole | null,
    loading,
    refetch: fetchProfile,
  };
}
