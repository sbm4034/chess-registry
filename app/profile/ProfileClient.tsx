'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { uploadDocument } from '@/lib/supabase/uploadDocument';
import { Check, Copy, FileText, MapPin, X } from 'lucide-react';
import { Playfair_Display, Manrope } from 'next/font/google';
import PlayerAvatar from '@/app/components/PlayerAvatar';
import { INDIAN_STATES } from '@/lib/constants';

type Doc = {
  id: string;
  type: 'dob' | 'certificate';
  file_url: string;
};

const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  preload: false,
});

const sans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  preload: false,
});

export default function ProfileClient({
  user,
  profile: initialProfile,
  documents: initialDocs,
  registrations: initialRegs,
}: {
  user: any
  profile: any
  documents: Doc[]
  registrations: any[]
}) {
  const supabase = createClient()
  const [profile, setProfile] = useState(initialProfile);
  const [documents, setDocuments] = useState(initialDocs);
  const [registrations, setRegistrations] = useState(initialRegs);
  const router = useRouter();
  const handleLogout = async () => {
  await supabase.auth.signOut()
  router.replace('/login')
  router.refresh()
}
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const dobDoc = documents.find(d => d.type === 'dob');
  const certDocs = documents.filter(d => d.type === 'certificate');
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // ─────────────────────────────────────────────
  // LOAD
  // ─────────────────────────────────────────────

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  const getDobSignedUrl = async (): Promise<string | null> => {
    if (!dobDoc) return null;

    const { data, error } = await supabase.storage
      .from('documents-private')
      .createSignedUrl(dobDoc.file_url, 60);

    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  };

  const getCertificatePublicUrl = (path: string) => {
    return supabase.storage
      .from('documents-public')
      .getPublicUrl(path).data.publicUrl;
  };

  const openPreview = async (doc: Doc) => {
    if (doc.type === 'dob') {
      const url = await getDobSignedUrl();
      if (!url) return alert('Unable to preview DOB');
      setPreviewUrl(url);
    } else {
      setPreviewUrl(getCertificatePublicUrl(doc.file_url));
    }
  };

  const reloadDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setDocuments(data || []);
  };

  const saveProfile = async () => {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      name: profile.name,
      city: profile.city,
      fide_id: profile.fide_id,
      state: profile.state,
    })
    .eq('id', profile.id);

  if (error) {
    setToast({ message: error.message, type: 'error' });
    return;
  }

  setToast({ message: 'Profile updated successfully', type: 'success' });
  setIsEditing(false);

  setTimeout(() => setToast(null), 2500);
};
  const profileCompletion = () => {
  const total = 5;
  let score = 0;

  if (profile?.name) score++;
  if (profile?.city) score++;
  if (profile?.state) score++;
  if (documents.some(d => d.type === 'dob')) score++;
  if (documents.some(d => d.type === 'certificate')) score++;

  return Math.round((score / total) * 100);
};

const completion = profileCompletion();

  const uploadProfilePhoto = async (file: File) => {
    if (!user) return;
    setPhotoUploading(true);
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setToast({ message: uploadError.message, type: 'error' });
      setPhotoUploading(false);
      return;
    }

    const publicUrl = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath).data.publicUrl;

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ profile_photo_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      setToast({ message: updateError.message, type: 'error' });
    } else {
      setProfile({ ...profile, profile_photo_url: publicUrl });
      setToast({ message: 'Profile photo updated', type: 'success' });
    }
    setPhotoUploading(false);
    setTimeout(() => setToast(null), 2500);
  };

  const initials = useMemo(() => {
    const name = profile?.name || '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join('') || 'P';
  }, [profile?.name]);

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ message: 'Copied ✓', type: 'success' });
      setTimeout(() => setToast(null), 2000);
    } catch {
      setToast({ message: 'Unable to copy link', type: 'error' });
      setTimeout(() => setToast(null), 2000);
    }
  };



  // ─────────────────────────────────────────────
  // UPLOADS
  // ─────────────────────────────────────────────
  const uploadDob = async (file: File) => {
    await uploadDocument(user.id, file, 'dob');
    reloadDocuments();
  };

  const uploadCertificates = async (files: FileList) => {
    for (const file of Array.from(files)) {
      await uploadDocument(user.id, file, 'certificate');
    }
    reloadDocuments();
  };


  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!previewUrl) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [previewUrl]);
  
  // ─────────────────────────────────────────────

  return (
    <div className={`${sans.className} min-h-screen px-4 py-8`}>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <section className="rounded-3xl border border-white/60 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-sm backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <PlayerAvatar
                  photoUrl={profile?.profile_photo_url}
                  name={profile?.name || 'Profile'}
                  className="h-20 w-20 md:h-24 md:w-24"
                />
                <div>
                  <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm cursor-pointer">
                    {photoUploading ? 'Uploading…' : profile?.profile_photo_url ? 'Change photo' : 'Upload photo'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadProfilePhoto(file);
                      }}
                    />
                  </label>
                  <p className="mt-1 text-xs text-slate-500">
                    Shown on your public player profile
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className={`${display.className} text-2xl text-slate-900 md:text-3xl`}>
                    {profile?.name}
                  </h1>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {profile?.role || 'Player'}
                  </span>
                </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>{profile?.city || '—'}, {profile?.state || '—'}</span>
          </div>
              </div>
            </div>
            <button
              onClick={copyProfileLink}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              <Copy className="h-4 w-4" />
              Copy profile link
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              Logout
          </button>
          </div>
        </section>

        {toast && (
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm">
            <span className="inline-flex items-center gap-2">
              {toast.type === 'success' ? <Check className="h-4 w-4 text-slate-700" /> : <X className="h-4 w-4 text-slate-700" />}
              {toast.message}
            </span>
          </div>
        )}

        {/* PERSONAL */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-4 space-y-4 shadow-sm">
  {/* Header */}
  <div className="flex justify-between items-center">
    <h2 className="font-medium text-white">Personal Information</h2>

    {!isEditing && (
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm text-white/80 hover:underline"
      >
        Edit
      </button>
    )}
  </div>

  {/* CONTENT */}
    <div className="space-y-3 text-sm">
    {/* Row */}
    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
        <span className="text-white/70">Full Name</span>
      {isEditing ? (
        <input
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white"
        />
      ) : (
        <span className="font-medium text-white">{profile.name}</span>
      )}
    </div>

    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
        <span className="text-white/70">FIDE ID</span>
      {isEditing ? (
        <input
          value={profile.fide_id || ''}
          onChange={(e) => setProfile({ ...profile, fide_id: e.target.value })}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white"
        />
      ) : (
        <span className="text-white/90">{profile.fide_id || '—'}</span>
      )}
    </div>

    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
        <span className="text-white/70">City</span>
      {isEditing ? (
        <input
          value={profile.city || ''}
          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white"
        />
      ) : (
        <span className="text-white/90">{profile.city || '—'}</span>
      )}
    </div>

    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
        <span className="text-white/70">State</span>
      {isEditing ? (
        <select
          value={profile.state || ''}
          onChange={(e) => setProfile({ ...profile, state: e.target.value })}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white"
        >
          <option value="">Select state</option>
          {INDIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      ) : (
        <span className={profile.state ? 'text-white' : 'italic text-white/60'}>
          {profile.state || 'Not provided'}
        </span>
      )}
    </div>
  </div>

  {/* ACTIONS */}
  {isEditing && (
    <div className="flex gap-2 pt-3">
      <button
        onClick={saveProfile}
        className="flex-1 rounded-xl bg-white text-slate-900 py-2 text-sm font-semibold shadow-sm"
      >
        Save
      </button>
      <button
        onClick={() => setIsEditing(false)}
        className="flex-1 rounded-xl border border-white/30 py-2 text-sm text-white/80"
      >
        Cancel
      </button>
    </div>
  )}
</div>


        {/* DOCUMENTS */}
<div className="rounded-2xl border border-slate-200 bg-white/80 p-4 space-y-5 shadow-sm">
  <h2 className="font-medium text-slate-900">Documents</h2>

          {/* DOB */}
<div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3">
  <div>
    <p className="font-medium text-slate-900">DOB Proof</p>
    <p className="text-sm text-slate-600">
      Uploaded · Private · Only visible to organizers
    </p>
  </div>

  <div className="flex gap-3 items-center">
    {dobDoc && (
      <button
        onClick={() => openPreview(dobDoc)}
        className="w-11 h-11 flex items-center justify-center
                   rounded-xl border border-slate-200
                   bg-white text-slate-700
                   hover:bg-slate-50 transition"
      >
        <FileText size={18} />
      </button>
    )}

    <label className="text-sm text-slate-600 cursor-pointer hover:underline">
      Replace
      <input
        type="file"
        hidden
        onChange={e => e.target.files && uploadDob(e.target.files[0])}
      />
    </label>
  </div>
</div>

          {/* CERTIFICATES */}
<div className="rounded-xl bg-slate-50 border border-slate-200 p-3">

  <p className="font-medium text-slate-900">
    Chess Certificates
  </p>

  <p className="text-sm text-slate-600 mb-2">
    Public · Shown on your player profile
  </p>

  {certDocs.length === 0 ? (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
      No public certificates uploaded yet
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {certDocs.map(doc => (
        <button
          key={doc.id}
          onClick={() => openPreview(doc)}
          className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <img
            src={getCertificatePublicUrl(doc.file_url)}
            className="h-28 w-full object-cover"
          />
          <div className="absolute bottom-2 left-2 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Certificate
          </div>
        </button>
      ))}
    </div>
  )}

  <label className="inline-block mt-2 text-sm text-slate-600 cursor-pointer hover:underline">
    Upload more
    <input
      type="file"
      multiple
      hidden
      onChange={e =>
        e.target.files && uploadCertificates(e.target.files)
      }
    />
  </label>
</div>

        </div>

        {/* REGISTRATIONS */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 space-y-4 shadow-sm">
          <h2 className="font-medium text-slate-900">Event Participation</h2>
          {registrations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
              No event participation yet
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {registrations.map((r, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-base font-semibold text-slate-900">
                    {r.event?.name}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {r.event?.start_date} → {r.event?.end_date}
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-3 -right-3 rounded-full bg-white p-2 shadow"
            >
              <X className="h-4 w-4 text-gray-700" />
            </button>
            <img
              src={previewUrl}
              className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-xl"
            />
          </div>

        </div>
      )}
    </div>
  );
}