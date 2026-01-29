'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { uploadDocument } from '@/lib/supabase/uploadDocument'
export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const hasDob = documents.some(d => d.type === 'dob');
  const certCount = documents.filter(d => d.type === 'certificate').length;


  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push('/login');
        return;
      }

      const user = sessionData.session.user;
      setUser(user);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        router.push('/register');
        return;
      }

      setProfile(profile);
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

        const { data: regs } = await supabase
  .from('player_events')
  .select(`
    status,
    events (
      id,
      name,
      start_date,
      end_date,
      location
    )
  `)
  .eq('user_id', user.id);

setRegistrations(regs || []);

      setDocuments(docs || []);

      setLoading(false);
    };

    loadProfile();
  }, [router]);

const saveProfile = async () => {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      name: profile.name,
      city: profile.city,
      fide_id: profile.fide_id
    })
    .eq('id', profile.id);

  if (error) {
    alert(error.message);
    return;
  }

  alert('Profile updated');
};


  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const uploadDob = async (file: File) => {
  if (!user) return;

  await uploadDocument(user.id, file, 'dob');
  alert('DOB uploaded');

  reloadDocuments();
};

const uploadCertificates = async (files: FileList) => {
  if (!user) return;

  for (const file of Array.from(files)) {
    await uploadDocument(user.id, file, 'certificate');
  }

  alert('Certificates uploaded');
  reloadDocuments();
};

const reloadDocuments = async () => {
  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  setDocuments(data || []);
};

const viewDob = async () => {
  const dobDoc = documents.find(d => d.type === 'dob');

  const { data } = await supabase.storage
    .from('documents-private')
    .createSignedUrl(dobDoc.file_url, 60);

  const link = document.createElement('a');
    link.href = data.signedUrl;
    link.download = 'dob-proof';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

};


if (loading) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-gray-400">Loading profile...</p>
    </div>
  );
}

return (
  <div className="min-h-screen bg-black text-white px-4 py-8">
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="text-sm text-gray-400 mt-1">
          Your official chess registration details
        </p>
      </div>

      {/* Profile details */}
      <div className="bg-zinc-900 rounded-xl p-4 space-y-4 border border-zinc-800">
        <h2 className="font-medium">Personal Information</h2>

        <div>
          <label className="text-sm text-gray-400">Full Name</label>
          <input
            value={profile.name}
            onChange={(e) =>
              setProfile({ ...profile, name: e.target.value })
            }
            className="w-full mt-1 px-3 py-2 bg-black border border-zinc-700 rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">FIDE ID</label>
          <input
            value={profile.fide_id || ''}
            onChange={(e) =>
              setProfile({ ...profile, fide_id: e.target.value })
            }
            placeholder="Optional"
            className="w-full mt-1 px-3 py-2 bg-black border border-zinc-700 rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">City</label>
          <input
            value={profile.city || ''}
            onChange={(e) =>
              setProfile({ ...profile, city: e.target.value })
            }
            className="w-full mt-1 px-3 py-2 bg-black border border-zinc-700 rounded-lg"
          />
        </div>

        <button
          onClick={saveProfile}
          className="w-full bg-yellow-500 text-black py-2 rounded-lg font-semibold"
        >
          Save Profile
        </button>
      </div>

      {/* Documents */}
<div className="bg-zinc-900 rounded-xl p-4 space-y-4 border border-zinc-800">
  <h2 className="font-medium">Documents</h2>

  {/* DOB */}
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium">DOB Proof</p>
      <p className="text-sm text-gray-400">
        {hasDob ? 'Uploaded (Private)' : 'Not uploaded'}
      </p>
    </div>

    <div className="flex gap-3">
      {hasDob && (
        <button
          onClick={viewDob}
          className="text-sm text-yellow-400"
        >
          View
        </button>
      )}

      <label className="text-sm text-gray-300 cursor-pointer">
        {hasDob ? 'Replace' : 'Upload'}
        <input
          type="file"
          hidden
          onChange={(e) =>
            e.target.files && uploadDob(e.target.files[0])
          }
        />
      </label>
    </div>
  </div>

  {/* Certificates */}
  <div>
    <p className="font-medium">Chess Certificates</p>
    <p className="text-sm text-gray-400">
      {certCount > 0
        ? `${certCount} certificate(s) uploaded`
        : 'No certificates uploaded'}
    </p>

    <label className="inline-block mt-2 text-sm text-yellow-400 cursor-pointer">
      Upload more
      <input
        type="file"
        multiple
        hidden
        onChange={(e) =>
          e.target.files && uploadCertificates(e.target.files)
        }
      />
    </label>
  </div>
</div>


      {/* Event registrations */}
      <div className="bg-zinc-900 rounded-xl p-4 space-y-3 border border-zinc-800">
        <h2 className="font-medium">My Event Registrations</h2>

        {registrations.length === 0 && (
          <p className="text-sm text-gray-400">
            You have not registered for any events yet.
          </p>
        )}

        {registrations.map((reg, idx) => (
          <div key={idx} className="border-b border-zinc-800 pb-2">
            <p className="font-medium">{reg.events.name}</p>
            <p className="text-sm text-gray-400">
              {reg.events.start_date} → {reg.events.end_date}
            </p>

            <span
              className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                reg.status === 'pending'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : reg.status === 'confirmed'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {reg.status}
            </span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full border border-zinc-700 py-2 rounded-lg text-gray-300"
      >
        Logout
      </button>
    </div>
  </div>
);

}
