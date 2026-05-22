'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';
import toast from 'react-hot-toast';

interface RoleOption {
  value: UserRole;
  emoji: string;
  label: string;
  description: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'food_delivery',
    emoji: '🛵',
    label: 'Food Delivery Worker',
    description: 'Swiggy, Zomato, Dunzo, or independent delivery',
  },
  {
    value: 'parcel_agent',
    emoji: '📦',
    label: 'Parcel / Courier Agent',
    description: 'DTDC, Delhivery, BlueDart, or similar',
  },
  {
    value: 'ecommerce_employee',
    emoji: '🏭',
    label: 'E-commerce Employee',
    description: 'Flipkart, Amazon, Meesho, or warehouse delivery',
  },
  {
    value: 'traveller',
    emoji: '✈️',
    label: 'Traveller / Tour Planner',
    description: 'Planning trips, pandal tours, or sightseeing routes',
  },
  {
    value: 'other',
    emoji: '👤',
    label: 'Other',
    description: 'Something else entirely — no problem!',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [saving, setSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Please sign in to access onboarding');
          router.replace('/auth/login');
        } else {
          setAuthLoading(false);
        }
      } catch {
        router.replace('/auth/login');
      }
    };
    checkUser();
  }, [router]);

  const handleNameNext = () => {
    setStep(2);
  };

  const handleSave = async (role: UserRole) => {
    setSelectedRole(role);
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: name.trim() || null,
          role,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not save profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: name.trim() || null,
          role: 'other',
          updated_at: new Date().toISOString(),
        });
      }
    } catch {
      // silently ignore
    } finally {
      setSaving(false);
      router.push('/');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col items-center justify-center p-5">
        <svg className="w-10 h-10 animate-spin text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col items-center justify-start p-5 pt-12 pb-8">
      <div className="w-full max-w-sm">

        {/* Logo + Progress */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur mb-4 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Safar Logo" className="w-full h-full object-cover navbar-logo" />
          </div>
          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full transition-all ${step === 1 ? 'bg-white w-6' : 'bg-white/40'}`} />
            <div className={`w-2 h-2 rounded-full transition-all ${step === 2 ? 'bg-white w-6' : 'bg-white/40'}`} />
          </div>
        </div>

        {/* ── STEP 1: Name ── */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-white mb-1">Hey there! 👋</h1>
              <p className="text-blue-200 text-sm">What should we call you?</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl">
              <label htmlFor="onboard-name" className="input-label">Your name</label>
              <input
                id="onboard-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ravi Kumar"
                className="input-field text-lg mb-5"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNameNext()}
              />
              <button
                onClick={handleNameNext}
                className="btn-primary w-full text-base"
                id="onboard-name-next"
              >
                Continue →
              </button>
              <button
                onClick={handleSkip}
                disabled={saving}
                className="btn-ghost w-full text-sm mt-2 text-gray-400 dark:text-slate-400"
                id="onboard-skip-btn"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Role ── */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-white mb-1">
                {name ? `Nice, ${name.split(' ')[0]}!` : 'Almost there!'}
              </h1>
              <p className="text-blue-200 text-sm">What best describes you?</p>
            </div>

            <div className="space-y-3">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSave(opt.value)}
                  disabled={saving}
                  id={`role-card-${opt.value}`}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 text-left transition-all min-h-[72px] shadow-lg
                    ${selectedRole === opt.value
                      ? 'ring-2 ring-white scale-[0.98]'
                      : 'hover:scale-[1.01] hover:shadow-xl active:scale-[0.98]'
                    }
                    ${saving ? 'opacity-60 pointer-events-none' : ''}
                  `}
                >
                  <span className="text-3xl flex-shrink-0 w-10 text-center">{opt.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm leading-tight">{opt.label}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-snug">{opt.description}</p>
                  </div>
                  {saving && selectedRole === opt.value && (
                    <svg className="w-4 h-4 animate-spin text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={() => setStep(1)}
                className="btn-ghost text-white/70 hover:text-white text-sm"
              >
                ← Back
              </button>
              <button
                onClick={handleSkip}
                disabled={saving}
                className="btn-ghost text-white/70 hover:text-white text-sm ml-auto"
                id="onboard-role-skip"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
