'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadDocument } from '@/lib/supabase/uploadDocument';
import { useRouter } from 'next/navigation';
import { Camera, FileText, ShieldCheck, Award } from 'lucide-react';
import { INDIAN_STATES } from '@/lib/constants';
import { allowedTypes  } from '@/lib/constants';
import LoadingButton from '@/app/components/ui/LoadingButton';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'player' | 'coach' | 'referee'>('player');
  const [city, setCity] = useState('');
  const [fideId, setFideId] = useState('');
  const [state, setState] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [dobFile, setDobFile] = useState<File | null>(null);
  const [certFiles, setCertFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

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

    const { error: profileError } = await supabase.from('user_profiles').upsert(
      {
        id: user.id,
        name,
        role,
        state,
        city,
        fide_id: fideId || null,
        profile_photo_url: profilePhotoUrl || null,
      },
      {
        onConflict: 'id',
      },
    );

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    if (dobFile) {

  if (!allowedTypes.includes(dobFile.type)) {
    alert('Only PDF, JPG, PNG files are allowed for DOB proof.');
    setLoading(false);
    return;
  }

  await uploadDocument(user.id, dobFile, 'dob');
}

    if (certFiles) {
  const filesArray = Array.from(certFiles);

  const invalidFile = filesArray.find(
    (file) => !allowedTypes.includes(file.type)
  );

  if (invalidFile) {
    alert(`File "${invalidFile.name}" is not supported. Only PDF, JPG, PNG allowed.`);
    setLoading(false);
    return;
  }

  for (const file of filesArray) {
    await uploadDocument(user.id, file, 'certificate');
  }
}

    setLoading(false);
    router.push('/profile');
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center py-16 font-sans">
      <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="bg-surface border border-border rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
          <div className="text-center">
            <h1 className="font-serif text-2xl md:text-3xl text-primary tracking-tight">
              Complete Registration
            </h1>
            <div className="w-20 h-[2px] bg-accent mx-auto mt-4 mb-8" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full border border-border bg-surface flex items-center justify-center overflow-hidden">
                  {profilePhotoPreview ? (
                    <img src={profilePhotoPreview} alt="Profile preview" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">Shown on your public player profile</p>
                  <label className="mt-2 inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 rounded-full px-5 py-2 text-xs font-semibold shadow-md cursor-pointer">
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
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-primary">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                placeholder="Enter full name"
              />
              <p className="mt-1 text-xs text-muted-foreground">As per official records</p>
            </div>
            <div>
              <label className="text-sm font-medium text-primary">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((stateName) => (
                  <option key={stateName} value={stateName}>
                    {stateName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-primary">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                placeholder="City"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-primary">FIDE ID</label>
              <input
                value={fideId}
                onChange={(e) => setFideId(e.target.value)}
                className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                placeholder="Optional (e.g., 12345678)"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-primary">Role</label>
              <select
                value={role}
                onChange={(e) =>
                setRole(e.target.value as 'player' | 'coach' | 'referee')}
                className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
              >
                  <option value="player">Player</option>
                  <option value="coach">Coach</option>
                  <option value="referee">Referee</option>
              </select>
            </div>

            <div className="md:col-span-2 bg-background border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">DOB Proof</p>
                  <p className="text-xs text-muted-foreground">
                    Required • Private • Used for age verification
                  </p>
                  <label className="mt-3 inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 rounded-full px-5 py-2 text-xs font-semibold cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Upload DOB proof
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      hidden
                      onChange={(e) => setDobFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {dobFile && (
                    <p className="mt-2 text-xs text-muted-foreground">Selected: {dobFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-background border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">Chess Certificates</p>
                  <p className="text-xs text-muted-foreground">
                    Achievement • Public • Visible on your profile
                  </p>
                  <label className="mt-3 inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 rounded-full px-5 py-2 text-xs font-semibold cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Upload certificates
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      hidden
                      onChange={(e) => setCertFiles(e.target.files || null)}
                    />
                  </label>
                  {certFiles && certFiles.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {certFiles.length} file(s) selected
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-center">
            <LoadingButton
              onClick={handleSubmit}
              loading={loading}
              loadingText="Submitting..."
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 rounded-full px-8 py-3 shadow-md hover:shadow-lg font-medium disabled:opacity-60 inline-flex items-center justify-center gap-2"
              spinnerClassName="text-primary-foreground"
            >
              Submit Registration
            </LoadingButton>
            <p className="text-xs text-muted-foreground">
              Documents are verified manually by tournament organizers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
