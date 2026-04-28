import { useState, useEffect } from 'react';
import { User, Mail, Building2, Phone, Camera, Save } from 'lucide-react';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  bio: string;
}

export function Profile() {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    bio: '',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const nameParts = (user.full_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      setFormData({
        firstName,
        lastName,
        email: user.email || '',
        phone: '',
        department: '',
        role: user.role || '',
        bio: '',
      });
    }
  }, [user]);

  const updateField = (field: keyof ProfileFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');
    setSaved(false);

    try {
      await apiClient.put('/admin/users/' + user.id, {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        role: formData.role,
        bio: formData.bio,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account information
        </p>
      </div>

      {/* Success message */}
      {saved && (
        <div
          className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400"
          role="status"
        >
          Profile saved successfully.
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Profile Photo
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {formData.firstName[0] || ''}
              {formData.lastName[0] || ''}
            </div>
            <div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Camera className="h-4 w-4" />
                Change Photo
              </button>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="mr-1 inline h-4 w-4" />
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={updateField('firstName')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={updateField('lastName')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Mail className="mr-1 inline h-4 w-4" />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={updateField('email')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Phone className="mr-1 inline h-4 w-4" />
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={updateField('phone')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="department" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Building2 className="mr-1 inline h-4 w-4" />
                Department
              </label>
              <input
                id="department"
                type="text"
                value={formData.department}
                onChange={updateField('department')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <input
                id="role"
                type="text"
                value={formData.role}
                onChange={updateField('role')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                readOnly
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="bio" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={updateField('bio')}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
