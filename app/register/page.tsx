'use client';

import { useState,useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { uploadDocument } from '@/lib/supabase/uploadDocument';
import { useRouter } from 'next/navigation';
import { Playfair_Display, Manrope } from 'next/font/google';
import { Camera, FileText, ShieldCheck, Award } from 'lucide-react';

const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
});

const sans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});


export default function RegisterPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('player');
  const [city, setCity] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [dobFile, setDobFile] = useState<File | null>(null);
  const [certFiles, setCertFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profile) {
        router.push('/profile');
      }
    };

    checkProfile();
  }, [router]);

  const handleSubmit = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      router.push('/login');
      return;
    }

    let profilePhotoUrl: string | null = null;
    if (profilePhotoFile) {
      const filePath = `${user.id}/${Date.now()}-${profilePhotoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, profilePhotoFile, { upsert: true });

      if (uploadError) {
        alert(uploadError.message);
        setLoading(false);
        return;
      }

      profilePhotoUrl = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath).data.publicUrl;
    }

    // 1️⃣ Create profile
    const { error: profileError } = await supabase.from('user_profiles').upsert(
  {
    id: user.id,
    name,
    role,
    city,
    profile_photo_url: profilePhotoUrl || null,
  },
  {
    onConflict: 'id'
  }
);

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Upload DOB
    if (dobFile) {
      const dobUrl = await uploadDocument(user.id, dobFile, 'dob');

      await supabase.from('documents').insert({
        user_id: user.id,
        type: 'dob',
        file_url: dobUrl
      });
    }

    // 3️⃣ Upload certificates
    if (certFiles) {
      for (const file of Array.from(certFiles)) {
        const certUrl = await uploadDocument(user.id, file, 'certificate');

        await supabase.from('documents').insert({
          user_id: user.id,
          type: 'certificate',
          file_url: certUrl
        });
      }
    }

    setLoading(false);
    router.push('/profile');
  };

  return (
    <div className={`${sans.className} min-h-screen px-4 py-8`}>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(30,41,59,0.08),transparent_60%),radial-gradient(900px_500px_at_85%_10%,rgba(15,23,42,0.06),transparent_55%),linear-gradient(180deg,#ffffff_0%,#f8fafc_60%,#ffffff_100%)]" />
        <div
          className="absolute inset-0 bg-no-repeat opacity-[0.04]"
          style={{
            backgroundImage: "url('/logo.png')",
            backgroundPosition: '50% 35%',
            backgroundSize: 'clamp(240px, 40vw, 520px) auto',
          }}
        />
      </div>
  <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur">

<div>
  <h1 className={`${display.className} text-2xl text-slate-900`}>
    Complete Registration
  </h1>
  <p className="text-sm text-slate-600 mt-1">
    Register once to participate in official chess events
  </p>
</div>


     <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 space-y-4 shadow-sm">
  <h2 className="text-lg font-medium text-slate-900">
    Player Details
  </h2>

  <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3">
    <div className="h-16 w-16 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden">
      {profilePhotoPreview ? (
        <img src={profilePhotoPreview} alt="Profile preview" className="h-full w-full object-cover" />
      ) : (
        <Camera className="h-6 w-6 text-slate-500" />
      )}
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-slate-900">Profile Photo</p>
      <p className="text-xs text-slate-500">
        Shown on your public player profile
      </p>
      <label className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm cursor-pointer">
        <Camera className="h-4 w-4" />
        Upload profile photo
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setProfilePhotoFile(file);
            setProfilePhotoPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
      </label>
    </div>
  </div>

  <div>
    <label className="text-sm text-slate-600">
      Full Name
    </label>
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      placeholder="Enter full name"
    />
  </div>

  <div>
    <label className="text-sm text-slate-600">
      City
    </label>
    <input
      value={city}
      onChange={(e) => setCity(e.target.value)}
      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm"
      placeholder="City"
    />
  </div>

  <div>
    <label className="text-sm text-slate-600">
      Role
    </label>
    <select
      value={role}
      onChange={(e) => setRole(e.target.value)}
      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm"
    >
      <option>Player</option>
      <option>Coach</option>
      <option>Referee</option>
    </select>
  </div>
</div>
<div className="rounded-2xl border border-slate-200 bg-white/90 p-4 space-y-4 shadow-sm">
  <h2 className="text-lg font-medium text-slate-900">
    Documents
  </h2>

  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
    <div className="flex items-center gap-3">
      <ShieldCheck className="h-5 w-5 text-slate-600" />
      <div>
        <p className="text-sm font-semibold text-slate-900">DOB Proof</p>
        <p className="text-xs text-slate-500">
          Required · Private · Used for age verification
        </p>
      </div>
    </div>
    <label className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm cursor-pointer">
      <FileText className="h-4 w-4" />
      Upload DOB proof
      <input
        type="file"
        hidden
        onChange={(e) => setDobFile(e.target.files?.[0] || null)}
      />
    </label>
    {dobFile && (
      <p className="text-xs text-slate-600">
        Selected: {dobFile.name}
      </p>
    )}
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Award className="h-5 w-5 text-slate-600" />
      <div>
        <p className="text-sm font-semibold text-slate-900">Chess Certificates</p>
        <p className="text-xs text-slate-500">
          Achievement · Public · Visible on your profile
        </p>
      </div>
    </div>
    <label className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm cursor-pointer">
      <FileText className="h-4 w-4" />
      Upload certificates
      <input
        type="file"
        multiple
        hidden
        onChange={(e) => setCertFiles(e.target.files || null)}
      />
    </label>
    {certFiles && certFiles.length > 0 && (
      <p className="text-xs text-slate-600">
        {certFiles.length} file(s) selected
      </p>
    )}
  </div>
</div>
<div className="rounded-2xl border border-slate-200 bg-white/90 p-4 space-y-3 shadow-sm">
  <h2 className="text-sm font-semibold text-slate-800">Finalize Registration</h2>
  <button
    onClick={handleSubmit}
    disabled={loading}
    className="w-full rounded-full bg-slate-900 text-white py-3 font-semibold text-base shadow-lg shadow-slate-900/20 disabled:opacity-60"
  >
  Submit Registration
  </button>
  <p className="text-xs text-slate-500 text-center">
    Documents are verified manually by tournament organizers.
  </p>
</div>

    </div>
    </div>
  );
}
