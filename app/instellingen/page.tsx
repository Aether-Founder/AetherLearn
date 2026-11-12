'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Panel, Field, inputClass } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase as browserClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/useTranslation';
import { useTheme } from 'next-themes';
import { openThemePicker } from '@/components/ThemeSelectionModal';
import { useNavbarPreferences } from '@/hooks/useNavbarPreferences';
import { useUser } from '@/hooks/useAuth';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import {
  Upload,
  Check,
  X,
  Save,
  RotateCcw,
  User,
  Palette,
  Layout,
  BarChart3,
  Shield,
  Sparkles,
  Key,
  Zap,
  Accessibility,
  Loader2,
  Globe,
} from 'lucide-react';

const supabase = browserClient as any;

type SettingsSection = 'profile' | 'appearance' | 'navigation' | 'statistics' | 'account' | 'ai' | 'accessibility' | 'language';

function ActivityGraph() {
  const { user } = useUser();
  const { getYearlyActivity } = useActivityTracking(user?.id);
  const [activityData, setActivityData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const data = getYearlyActivity();
      setActivityData(data);
    }
  }, [user, getYearlyActivity]);

  const maxSeconds = Math.max(...activityData.map(d => d.totalSeconds), 1);

  // Group by weeks for the graph
  const weeks: any[][] = [];
  for (let i = 0; i < activityData.length; i += 7) {
    weeks.push(activityData.slice(i, i + 7));
  }

  const getColor = (seconds: number, emoji?: 'happy' | 'neutral' | 'sad') => {
    if (seconds === 0 && !emoji) return 'bg-secondary';

    // Base color on emoji if present
    if (emoji === 'happy') {
      const intensity = Math.min(seconds / 3600, 4);
      const colors = [
        'bg-green-100 dark:bg-green-900',
        'bg-green-200 dark:bg-green-800',
        'bg-green-300 dark:bg-green-700',
        'bg-green-400 dark:bg-green-600',
        'bg-green-500 dark:bg-green-500',
      ];
      return colors[Math.floor(intensity)];
    } else if (emoji === 'neutral') {
      const intensity = Math.min(seconds / 3600, 4);
      const colors = [
        'bg-yellow-100 dark:bg-yellow-900',
        'bg-yellow-200 dark:bg-yellow-800',
        'bg-yellow-300 dark:bg-yellow-700',
        'bg-yellow-400 dark:bg-yellow-600',
        'bg-yellow-500 dark:bg-yellow-500',
      ];
      return colors[Math.floor(intensity)];
    } else if (emoji === 'sad') {
      const intensity = Math.min(seconds / 3600, 4);
      const colors = [
        'bg-red-100 dark:bg-red-900',
        'bg-red-200 dark:bg-red-800',
        'bg-red-300 dark:bg-red-700',
        'bg-red-400 dark:bg-red-600',
        'bg-red-500 dark:bg-red-500',
      ];
      return colors[Math.floor(intensity)];
    }

    // Default green for study time without emoji
    const intensity = Math.min(seconds / 3600, 4);
    const colors = [
      'bg-green-100 dark:bg-green-900',
      'bg-green-200 dark:bg-green-800',
      'bg-green-300 dark:bg-green-700',
      'bg-green-400 dark:bg-green-600',
      'bg-green-500 dark:bg-green-500',
    ];
    return colors[Math.floor(intensity)];
  };

  const getEmojiIcon = (emoji?: 'happy' | 'neutral' | 'sad') => {
    if (emoji === 'happy') return '😊';
    if (emoji === 'neutral') return '😐';
    if (emoji === 'sad') return '😢';
    return '';
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        GitHub-achtige activiteitsgrafiek van het afgelopen jaar. Elke cel vertegenwoordigt een dag,
        gekleurd op basis van de studietijd en je emoji-reactie.
      </p>
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm ${getColor(day.totalSeconds, day.emoji)} relative`}
                  title={`${day.date}: ${Math.floor(day.totalSeconds / 60)} minuten ${day.emoji ? getEmojiIcon(day.emoji) : ''}`}
                >
                  {day.emoji && (
                    <span className="absolute inset-0 flex items-center justify-center text-[8px]">
                      {getEmojiIcon(day.emoji)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Geen activiteit</span>
          <div className="w-3 h-3 rounded-sm bg-secondary" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Blij 😊</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900" />
            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800" />
            <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700" />
            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600" />
            <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500" />
          </div>
          <span>Meer tijd</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Neutraal 😐</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-yellow-100 dark:bg-yellow-900" />
            <div className="w-3 h-3 rounded-sm bg-yellow-200 dark:bg-yellow-800" />
            <div className="w-3 h-3 rounded-sm bg-yellow-300 dark:bg-yellow-700" />
            <div className="w-3 h-3 rounded-sm bg-yellow-400 dark:bg-yellow-600" />
            <div className="w-3 h-3 rounded-sm bg-yellow-500 dark:bg-yellow-500" />
          </div>
          <span>Meer tijd</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Tevreden 😢</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-100 dark:bg-red-900" />
            <div className="w-3 h-3 rounded-sm bg-red-200 dark:bg-red-800" />
            <div className="w-3 h-3 rounded-sm bg-red-300 dark:bg-red-700" />
            <div className="w-3 h-3 rounded-sm bg-red-400 dark:bg-red-600" />
            <div className="w-3 h-3 rounded-sm bg-red-500 dark:bg-red-500" />
          </div>
          <span>Meer tijd</span>
        </div>
      </div>
    </div>
  );
}

export default function InstellingenPage() {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const {
    visibility,
    toggleVisibility,
    resetToDefaults,
    PAGE_LABELS,
    loading: navLoading,
  } = useNavbarPreferences();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [track, setTrack] = useState('');
  const [gradeYear, setGradeYear] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [gamificationEnabled, setGamificationEnabled] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // AI Settings State
  const [useBYOK, setUseBYOK] = useState(false);
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [preferredProvider, setPreferredProvider] = useState<'qwen' | 'deepseek' | 'openrouter-free'>('qwen');
  const [usageSummary, setUsageSummary] = useState<any>(null);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [aiTesting, setAiTesting] = useState(false);
  const [aiLoading, setAiLoading] = useState(true);

  // Language and Educational Level State
  const [languageCode, setLanguageCode] = useState('nl');
  const [educationalLevel, setEducationalLevel] = useState('middle-school');
  const [countryCode, setCountryCode] = useState('');
  const [preferencesSaving, setPreferencesSaving] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    loadAISettings();
  }, []);

  const fetchUserProfile = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return;

    setUser(authUser);

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setName(profileData.full_name || '');
      setUsername(profileData.username || '');
      setBio(profileData.bio || '');
      setClassLevel(profileData.grade_level || '');
      setTrack(profileData.track || '');
      setGradeYear(profileData.grade_confirmed_year || '');
      setAvatarUrl(profileData.avatar_url || '');
      setAvatarPreview(profileData.avatar_url || '');
      setGamificationEnabled(profileData.gamification_enabled || false);
      
      // Load new internationalization preferences (if they exist after migration)
      setLanguageCode(profileData.language_code || 'nl');
      setEducationalLevel(profileData.educational_level || 'middle-school');
      setCountryCode(profileData.country_code || '');
    }
    setLoading(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;

    setUploading(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setAvatarPreview(publicUrl);
      setAvatarFile(null);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      setSaveMessage({ type: 'error', text: 'Avatar upload mislukt' });
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!avatarUrl) return;

    try {
      const filePath = avatarUrl.split('/').pop();
      if (filePath) {
        await supabase.storage.from('avatars').remove([`avatars/${filePath}`]);
      }
      setAvatarUrl('');
      setAvatarPreview('');
      setAvatarFile(null);
    } catch (error) {
      console.error('Avatar removal failed:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveMessage(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: name,
          username: username,
          bio: bio,
          grade_level: classLevel,
          track: track,
          grade_confirmed_year: gradeYear,
          avatar_url: avatarUrl,
          gamification_enabled: gamificationEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      setSaveMessage({ type: 'success', text: 'Instellingen opgeslagen!' });

      // Update local state
      setProfile({
        ...profile,
        full_name: name,
        username: username,
        bio: bio,
        grade_level: classLevel,
        track: track,
        grade_confirmed_year: gradeYear,
        avatar_url: avatarUrl,
        gamification_enabled: gamificationEnabled,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage({ type: 'error', text: 'Opslaan mislukt' });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (name)
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    if (username) return username.slice(0, 2).toUpperCase();
    return '??';
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSaveMessage({ type: 'error', text: 'Wachtwoorden komen niet overeen' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setSaveMessage({ type: 'error', text: 'Wachtwoord moet minimaal 6 tekens zijn' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setSaveMessage({ type: 'success', text: 'Wachtwoord gewijzigd!' });
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Password change error:', error);
      setSaveMessage({ type: 'error', text: 'Wachtwoord wijzigen mislukt' });
    } finally {
      setLoading(false);
    }
  };

  // AI Settings Functions
  const loadAISettings = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', authUser.id)
        .single();

      if (data?.settings) {
        const settings = data.settings as any;
        setUseBYOK(settings.useBYOK || false);
        setOpenrouterKey(settings.openrouterApiKey || '');
        setDeepseekKey(settings.deepseekApiKey || '');
        setPreferredProvider(settings.preferredProvider || 'qwen');
      }

      const { getUsageSummary } = await import('@/lib/ai/rate-limiter');
      const summary = await getUsageSummary(authUser.id, supabase);
      setUsageSummary(summary);
    } catch (error) {
      console.error('Error loading AI settings:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISave = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return;

    setAiSaving(true);
    setAiTestResult(null);

    try {
      const settings = {
        useBYOK,
        openrouterApiKey: useBYOK ? openrouterKey : '',
        deepseekApiKey: useBYOK ? deepseekKey : '',
        preferredProvider,
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: authUser.id,
          settings,
        });

      if (error) throw error;

      setAiTestResult({ success: true, message: 'Instellingen opgeslagen!' });

      const { getUsageSummary } = await import('@/lib/ai/rate-limiter');
      const summary = await getUsageSummary(authUser.id, supabase);
      setUsageSummary(summary);
    } catch (error: any) {
      setAiTestResult({ success: false, message: error.message });
    } finally {
      setAiSaving(false);
    }
  };

  const handleAITestConnection = async () => {
    if (!openrouterKey) {
      setAiTestResult({ success: false, message: 'Voer eerst een API-key in' });
      return;
    }

    setAiTesting(true);
    setAiTestResult(null);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [{ role: 'user', content: 'Zeg "Verbinding succesvol" in het Nederlands' }],
          max_tokens: 50,
        }),
      });

      if (!response.ok) {
        throw new Error(`API fout: ${response.status}`);
      }

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        setAiTestResult({
          success: true,
          message: 'Verbinding succesvol! Je API-key werkt.',
        });
      } else {
        throw new Error('Ongeldig antwoord van API');
      }
    } catch (error: any) {
      setAiTestResult({
        success: false,
        message: `Verbinding mislukt: ${error.message}`,
      });
    } finally {
      setAiTesting(false);
    }
  };

  const handlePreferencesSave = async () => {
    if (!user) return;

    setPreferencesSaving(true);
    setSaveMessage(null);

    try {
      // Update user profile with language and educational level preferences
      const { error } = await supabase
        .from('users')
        .update({
          language_code: languageCode,
          educational_level: educationalLevel,
          country_code: countryCode || null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', user.id);

      if (error) throw error;

      // Update localStorage for language preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('aether_language', languageCode);
      }

      // Update the translation system
      changeLanguage(languageCode);

      setSaveMessage({ type: 'success', text: 'Voorkeuren opgeslagen!' });
    } catch (error: any) {
      console.error('Failed to save preferences:', error);
      setSaveMessage({ type: 'error', text: 'Opslaan mislukt' });
    } finally {
      setPreferencesSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeader
          title={t('settings_title')}
          description={t('settings_description')}
        />
        <div className="mt-10 flex gap-8">
          <aside className="w-56 shrink-0">
            <div className="space-y-1">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="skeleton-line h-10 w-full rounded-lg"></div>
              ))}
            </div>
          </aside>
          <main className="flex-1 space-y-6">
            <div className="border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-6">
                <div className="skeleton-circle h-24 w-24 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="skeleton-line h-4 w-1/3 rounded"></div>
                  <div className="skeleton-line h-10 w-full rounded"></div>
                </div>
              </div>
            </div>
            <div className="border border-border rounded-lg p-6 space-y-4">
              <div className="skeleton-line h-6 w-1/4 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="skeleton-line h-4 w-1/3 rounded"></div>
                <div className="skeleton-line h-10 w-full rounded"></div>
                <div className="skeleton-line h-4 w-1/3 rounded"></div>
                <div className="skeleton-line h-10 w-full rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={t('settings_title')}
        description={t('settings_description')}
      />

      <div className="mt-10 grid grid-cols-[224px_1fr] gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-56 shrink-0">
          <nav className="space-y-1 sticky top-24">
            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeSection === 'profile'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <User className="h-4 w-4" />
              Profiel
            </button>
            <button
              onClick={() => {
                setActiveSection('appearance');
                openThemePicker();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeSection === 'appearance'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Palette className="h-4 w-4" />
              Uiterlijk
            </button>
            <button
              onClick={() => setActiveSection('navigation')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeSection === 'navigation'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Layout className="h-4 w-4" />
              Navigatie
            </button>
            <button
              onClick={() => setActiveSection('statistics')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeSection === 'statistics'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Statistieken
            </button>
            <button
              onClick={() => setActiveSection('account')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeSection === 'account'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Shield className="h-4 w-4" />
              Account
            </button>
            <button
              onClick={() => setActiveSection('ai')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeSection === 'ai'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              AI
            </button>
            <button
              onClick={() => setActiveSection('accessibility')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeSection === 'accessibility'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Accessibility className="h-4 w-4" />
              Toegankelijkheid
            </button>
            <button
              onClick={() => setActiveSection('language')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeSection === 'language'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Globe className="h-4 w-4" />
              Taal en Niveau
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {activeSection === 'profile' && (
            <Panel title={t('settings_profile')}>
              <div className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-start gap-6">
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="h-24 w-24 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center border-2 border-border">
                        <span className="text-2xl font-semibold">{getInitials()}</span>
                      </div>
                    )}
                    {avatarUrl && (
                      <button
                        onClick={handleAvatarRemove}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label htmlFor="avatar-upload">Profielfoto</Label>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="mt-1"
                      />
                    </div>
                    {avatarFile && (
                      <div className="flex gap-2">
                        <Button onClick={handleAvatarUpload} disabled={uploading} size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          {uploading ? 'Uploaden...' : 'Uploaden'}
                        </Button>
                        <Button
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(avatarUrl);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Annuleren
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">PNG, JPG of GIF. Max 2MB.</p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t('settings_name')}>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Je volledige naam"
                    />
                  </Field>
                  <Field label="Gebruikersnaam">
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Gebruikersnaam"
                    />
                  </Field>
                </div>

                <Field label="Bio">
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Vertel iets over jezelf..."
                    rows={3}
                  />
                </Field>

                {/* School Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t('settings_class')}>
                    <Input
                      value={classLevel}
                      onChange={(e) => setClassLevel(e.target.value)}
                      placeholder="Bijv. VWO 4"
                    />
                  </Field>
                  <Field label={t('settings_profile')}>
                    <select
                      className={inputClass}
                      value={track}
                      onChange={(e) => setTrack(e.target.value)}
                    >
                      <option value="">Kies een profiel</option>
                      <option value="nt">{t('settings_track_nt')}</option>
                      <option value="ng">{t('settings_track_ng')}</option>
                      <option value="em">{t('settings_track_em')}</option>
                      <option value="cm">{t('settings_track_cm')}</option>
                    </select>
                  </Field>
                </div>

                <Field label="Schooljaar">
                  <Input
                    value={gradeYear}
                    onChange={(e) => setGradeYear(e.target.value)}
                    placeholder="Bijv. 2024-2025"
                  />
                </Field>
              </div>
            </Panel>
          )}

          {activeSection === 'appearance' && (
            <Panel title={t('settings_preferences')}>
              <div className="space-y-4">
                <Field label="Kleurenthema">
                  <Button variant="outline" size="sm" onClick={openThemePicker}>
                    <Palette className="h-4 w-4 mr-2" />
                    Thema kiezen
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kies een kleurenpalet dat bij jou past.
                  </p>
                </Field>
                <Field label={t('settings_theme')}>
                  <select
                    className={inputClass}
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                  >
                    <option value="system">{t('settings_theme_system')}</option>
                    <option value="light">{t('settings_theme_light')}</option>
                    <option value="dark">{t('settings_theme_dark')}</option>
                  </select>
                </Field>

                <Field label={t('settings_language')}>
                  <select
                    className={inputClass}
                    value={currentLanguage}
                    onChange={(e) => changeLanguage(e.target.value as any)}
                  >
                    <option value="nl">Nederlands</option>
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                    <option value="zh">中文</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="ar">العربية</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                    <option value="hi">हिन्दी</option>
                    <option value="pt">Português</option>
                    <option value="it">Italiano</option>
                    <option value="tr">Türkçe</option>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="th">ไทย</option>
                    <option value="pl">Polski</option>
                    <option value="uk">Українська</option>
                  </select>
                </Field>
                <Field label="Gamification">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="gamification-toggle"
                      checked={gamificationEnabled}
                      onChange={(e) => setGamificationEnabled(e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-900"
                    />
                    <label htmlFor="gamification-toggle" className="text-sm text-zinc-400">
                      XP & Streak systeem inschakelen
                    </label>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">
                    Verdiene punten voor studeren en behoud een leer-streak. Kan op elk moment
                    worden uitgeschakeld.
                  </p>
                </Field>
              </div>
            </Panel>
          )}

          {activeSection === 'navigation' && (
            <Panel title="Navigatiebalk">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Kies welke pagina's in de navigatiebalk worden weergegeven. Verborgen pagina's
                  zijn nog steeds toegankelijk via andere routes.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(PAGE_LABELS).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibility[key]}
                        onChange={() => toggleVisibility(key as any)}
                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-900"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={resetToDefaults} className="mt-2">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Standaard instellingen herstellen
                </Button>
              </div>
            </Panel>
          )}

          {activeSection === 'statistics' && (
            <Panel title="Studie-activiteit">
              <ActivityGraph />
            </Panel>
          )}

          {activeSection === 'account' && (
            <Panel title="Account">
              <div className="space-y-4">
                <Field label="E-mail">
                  <Input type="email" value={user?.email || ''} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">
                    E-mail kan niet worden gewijzigd.
                  </p>
                </Field>
                <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)}>
                  Wachtwoord wijzigen
                </Button>
              </div>
            </Panel>
          )}

          {activeSection === 'ai' && (
            <Panel title="AI Instellingen">
              <div className="space-y-4">
                {aiLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Laden...
                  </div>
                ) : (
                  <>
                    {/* Usage Summary */}
                    {usageSummary && !usageSummary.isBYOK && (
                      <div className="p-4 bg-secondary rounded-lg border border-border">
                        <h3 className="font-semibold mb-3">Vandaag gebruikt</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">AI-acties</span>
                            <span className="font-medium">
                              {usageSummary.actions.used}/{usageSummary.actions.limit}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${(usageSummary.actions.used / usageSummary.actions.limit) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm mt-3">
                            <span className="text-muted-foreground">Chat berichten</span>
                            <span className="font-medium">
                              {usageSummary.chat.used}/{usageSummary.chat.limit}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${(usageSummary.chat.used / usageSummary.chat.limit) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Provider Toggle */}
                    <Field label="AI Provider">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="byok-toggle"
                          checked={useBYOK}
                          onChange={(e) => setUseBYOK(e.target.checked)}
                          className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                        />
                        <div>
                          <label htmlFor="byok-toggle" className="font-medium cursor-pointer">
                            Gebruik eigen API-key
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {useBYOK
                              ? 'Onbeperkt gebruik met je eigen key'
                              : 'Aether AI (gratis, gelimiteerd: 5 acties + 20 chat/dag)'}
                          </p>
                        </div>
                      </div>
                    </Field>

                    {/* BYOK Settings */}
                    {useBYOK && (
                      <div className="space-y-4 pt-2">
                        <Field label="OpenRouter API Key">
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="password"
                              value={openrouterKey}
                              onChange={(e) => setOpenrouterKey(e.target.value)}
                              placeholder="sk-or-v1-..."
                              className="pl-10"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Verkrijg een key op{' '}
                            <a
                              href="https://openrouter.ai/keys"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              openrouter.ai/keys
                            </a>
                          </p>
                        </Field>

                        <Field label="DeepSeek API Key (optioneel)">
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="password"
                              value={deepseekKey}
                              onChange={(e) => setDeepseekKey(e.target.value)}
                              placeholder="sk-..."
                              className="pl-10"
                            />
                          </div>
                        </Field>

                        <Field label="Voorkeursprovider">
                          <select
                            value={preferredProvider}
                            onChange={(e) => setPreferredProvider(e.target.value as any)}
                            className={inputClass}
                          >
                            <option value="qwen">Qwen 2.5 72B (aanbevolen)</option>
                            <option value="deepseek">DeepSeek V3</option>
                            <option value="openrouter-free">Llama 3.1 8B (gratis)</option>
                          </select>
                        </Field>

                        <Button
                          variant="outline"
                          onClick={handleAITestConnection}
                          disabled={aiTesting || !openrouterKey}
                          className="w-full"
                        >
                          {aiTesting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verbinding testen...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-4 w-4" />
                              Test verbinding
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Test Result */}
                    {aiTestResult && (
                      <div
                        className={`p-4 rounded-lg flex items-start gap-3 ${
                          aiTestResult.success
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        }`}
                      >
                        {aiTestResult.success ? (
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm">{aiTestResult.message}</p>
                      </div>
                    )}

                    <Button onClick={handleAISave} disabled={aiSaving} className="w-full">
                      {aiSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Opslaan...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Instellingen opslaan
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </Panel>
          )}

          {activeSection === 'language' && (
            <Panel title="Taal en onderwijsniveau">
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Pas je taalvoorkeuren en onderwijsniveau aan voor een gepersonaliseerde leerervaring.
                </p>

                {/* Language Selection */}
                <div>
                  <Label htmlFor="language-select">Taal</Label>
                  <select
                    id="language-select"
                    value={languageCode}
                    onChange={(e) => setLanguageCode(e.target.value)}
                    className={inputClass}
                  >
                    <option value="nl">Nederlands</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="pt">Português</option>
                    <option value="ru">Русский</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                    <option value="ar">العربية</option>
                    <option value="hi">हिन्दी</option>
                    <option value="it">Italiano</option>
                    <option value="tr">Türkçe</option>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="th">ไทย</option>
                    <option value="pl">Polski</option>
                    <option value="uk">Українська</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    De taal van de interface en aanbevolingen.
                  </p>
                </div>

                {/* Educational Level Selection */}
                <div>
                  <Label htmlFor="educational-level-select">Onderwijsniveau</Label>
                  <select
                    id="educational-level-select"
                    value={educationalLevel}
                    onChange={(e) => setEducationalLevel(e.target.value as any)}
                    className={inputClass}
                  >
                    <option value="middle-school">Middle School (12-15 jaar)</option>
                    <option value="high-school">High School (15-18 jaar)</option>
                    <option value="university">University (18+ jaar)</option>
                    <option value="professional">Professional (werkend)</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hiermee passen we de inhoud en aanbevelingen aan jouw niveau.
                  </p>
                </div>

                {/* Country Selection (Optional) */}
                <div>
                  <Label htmlFor="country-select">Land (optioneel)</Label>
                  <select
                    id="country-select"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Niet geselecteerd</option>
                    <option value="NL">Nederland</option>
                    <option value="BE">België</option>
                    <option value="DE">Duitsland</option>
                    <option value="FR">Frankrijk</option>
                    <option value="ES">Spanje</option>
                    <option value="IT">Italië</option>
                    <option value="PT">Portugal</option>
                    <option value="GB">Verenigd Koninkrijk</option>
                    <option value="US">Verenigde Staten</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australië</option>
                    <option value="IN">India</option>
                    <option value="CN">China</option>
                    <option value="JP">Japan</option>
                    <option value="KR">Zuid-Korea</option>
                    <option value="BR">Brazilië</option>
                    <option value="RU">Rusland</option>
                    <option value="UA">Oekraïne</option>
                    <option value="TR">Turkije</option>
                    <option value="SA">Saoedi-Arabië</option>
                    <option value="AE">Verenigde Arabische Emiraten</option>
                    <option value="EG">Egypte</option>
                    <option value="ZA">Zuid-Afrika</option>
                    <option value="ID">Indonesië</option>
                    <option value="VN">Vietnam</option>
                    <option value="TH">Thailand</option>
                    <option value="PL">Polen</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Voor curriculum-specifieke aanbevelingen (optioneel).
                  </p>
                </div>

                <Button
                  onClick={handlePreferencesSave}
                  disabled={preferencesSaving}
                  className="w-full"
                >
                  {preferencesSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Voorkeuren opslaan
                    </>
                  )}
                </Button>
              </div>
            </Panel>
          )}

          {activeSection === 'accessibility' && (
            <Panel title="Toegankelijkheid">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Pas de toegankelijkheidsinstellingen aan aan jouw behoeften.
                </p>
                <div className="pt-4">
                  <Link href="/toegankelijkheid">
                    <Button className="w-full">
                      Ga naar Toegankelijkheid
                      <Accessibility className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Panel>
          )}

          {/* Save Button */}
          {activeSection !== 'statistics' && (
            <div className="flex items-center justify-between mt-6">
              {saveMessage && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {saveMessage.type === 'success' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {saveMessage.text}
                </div>
              )}
              <Button onClick={handleSave} disabled={loading} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Opslaan...' : t('settings_save')}
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wachtwoord wijzigen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">Nieuw wachtwoord</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Minimaal 6 tekens"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Bevestig wachtwoord</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="Typ opnieuw"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Annuleren
            </Button>
            <Button onClick={handlePasswordChange} disabled={loading}>
              {loading ? 'Wijzigen...' : 'Wijzigen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
