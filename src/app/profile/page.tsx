'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { UserRole, Profile } from '@/types';
import { getRoleLabel } from '@/lib/roleContent';
import toast from 'react-hot-toast';

interface RoleOption {
  value: UserRole;
  emoji: string;
  label: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  { value: 'food_delivery',      emoji: '🛵', label: 'Food Delivery Worker' },
  { value: 'parcel_agent',       emoji: '📦', label: 'Parcel / Courier Agent' },
  { value: 'ecommerce_employee', emoji: '🏭', label: 'E-commerce Employee' },
  { value: 'traveller',          emoji: '✈️', label: 'Traveller / Tour Planner' },
  { value: 'other',              emoji: '👤', label: 'Other' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, refetch } = useProfile();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [editingRole, setEditingRole] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return; }
      setEmail(user.email ?? '');
    });
  }, [router]);

  useEffect(() => {
    if (profile) setName(profile.full_name ?? '');
  }, [profile]);

  const handleSaveName = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: name.trim() || null, updated_at: new Date().toISOString() });
      if (error) throw error;
      setEditingName(false);
      await refetch();
      toast.success('Name updated');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRole = async (role: UserRole) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, role, updated_at: new Date().toISOString() });
      if (error) throw error;
      setEditingRole(false);
      await refetch();
      toast.success('Role updated');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    toast.success('Signed out');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-24 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="route-card animate-pulse">
              <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
              <div className="h-11 bg-gray-100 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="text-sm text-muted mt-1">Manage your account settings</p>
      </div>

      <div className="space-y-3">

        {/* ── Name ── */}
        <div className="route-card">
          <div className="flex items-center justify-between mb-3">
            <p className="section-label mb-0">Full Name</p>
            {!editingName && (
              <button
                onClick={() => setEditingName(true)}
                className="text-sm font-semibold text-primary hover:underline"
                id="edit-name-btn"
              >
                Edit
              </button>
            )}
          </div>
          {editingName ? (
            <div className="space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="input-field"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                id="profile-name-input"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="btn-primary flex-1 text-sm py-2"
                  id="profile-name-save"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingName(false); setName(profile?.full_name ?? ''); }}
                  className="btn-ghost flex-1 text-sm py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className={`text-base font-medium ${profile?.full_name ? 'text-gray-900 dark:text-slate-100' : 'text-gray-400 dark:text-slate-500 italic'}`}>
              {profile?.full_name ?? 'Not set — tap Edit to add your name'}
            </p>
          )}
        </div>

        {/* ── Role ── */}
        <div className="route-card">
          <div className="flex items-center justify-between mb-3">
            <p className="section-label mb-0">Your Role</p>
            {!editingRole && (
              <button
                onClick={() => setEditingRole(true)}
                className="text-sm font-semibold text-primary hover:underline"
                id="edit-role-btn"
              >
                Change
              </button>
            )}
          </div>

          {editingRole ? (
            <div className="space-y-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSaveRole(opt.value)}
                  disabled={saving}
                  id={`profile-role-${opt.value}`}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all min-h-[56px]
                    ${(profile as Profile | null)?.role === opt.value
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-slate-700 hover:border-primary/40 hover:bg-blue-50 dark:hover:bg-slate-700/50'
                    }
                    ${saving ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="font-semibold text-sm">{opt.label}</span>
                  {(profile as Profile | null)?.role === opt.value && (
                    <svg className="w-4 h-4 ml-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
              <button
                onClick={() => setEditingRole(false)}
                className="btn-ghost w-full text-sm mt-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {ROLE_OPTIONS.find((o) => o.value === profile?.role)?.emoji ?? '👤'}
              </span>
              <p className={`text-base font-medium ${profile?.role ? 'text-gray-900 dark:text-slate-100' : 'text-gray-400 dark:text-slate-500 italic'}`}>
                {getRoleLabel(profile?.role)}
              </p>
            </div>
          )}
        </div>

        {/* ── Email ── */}
        <div className="route-card">
          <p className="section-label mb-3">Email</p>
          <p className="text-base font-medium text-gray-700 dark:text-slate-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 dark:text-slate-450">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            {email || 'Loading…'}
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Email cannot be changed</p>
        </div>

        {/* ── Sign Out ── */}
        <div className="pt-2">
          <button
            onClick={handleSignOut}
            className="btn-danger w-full gap-2"
            id="signout-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
