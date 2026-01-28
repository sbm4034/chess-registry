'use client';

import { useState,useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { uploadDocument } from '@/lib/supabase/uploadDocument';
import { useRouter } from 'next/navigation';


export default function RegisterPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('player');
  const [city, setCity] = useState('');
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

    // 1️⃣ Create profile
    const { error: profileError } = await supabase.from('user_profiles').upsert(
  {
    id: user.id,
    name,
    role,
    city
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
    <div className="min-h-screen bg-black text-white px-4 py-8">
  <div className="max-w-md mx-auto space-y-6">

<div>
  <h1 className="text-2xl font-semibold">
    Complete Registration
  </h1>
  <p className="text-sm text-gray-400 mt-1">
    Register once to participate in official chess events
  </p>
</div>


     <div className="bg-zinc-900 rounded-xl p-4 space-y-4">
  <h2 className="text-lg font-medium">
    Player Details
  </h2>

  <div>
    <label className="text-sm text-gray-400">
      Full Name
    </label>
    <input
      className="w-full mt-1 px-3 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-yellow-500"
      placeholder="Enter full name"
    />
  </div>

  <div>
    <label className="text-sm text-gray-400">
      City
    </label>
    <input
      className="w-full mt-1 px-3 py-2 bg-black border border-zinc-700 rounded-lg"
      placeholder="City"
    />
  </div>

  <div>
    <label className="text-sm text-gray-400">
      Role
    </label>
    <select
      className="w-full mt-1 px-3 py-2 bg-black border border-zinc-700 rounded-lg"
    >
      <option>Player</option>
      <option>Coach</option>
      <option>Referee</option>
    </select>
  </div>
</div>
<div className="bg-zinc-900 rounded-xl p-4 space-y-4">
  <h2 className="text-lg font-medium">
    Documents
  </h2>

  <div>
    <label className="text-sm text-gray-400">
      DOB Proof (Private)
    </label>
    <input
      type="file"
      className="w-full mt-1 text-sm text-gray-300"
    />
    <p className="text-xs text-gray-500 mt-1">
      Used only for age verification
    </p>
  </div>

  <div>
    <label className="text-sm text-gray-400">
      Chess Certificates (Public)
    </label>
    <input
      type="file"
      className="w-full mt-1 text-sm text-gray-300"
    />
    <p className="text-xs text-gray-500 mt-1">
      Visible for verification by organizers
    </p>
  </div>
</div>
<button
  className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold text-lg"
>
  Submit Registration
</button>
<p className="text-xs text-gray-500 text-center">
  Documents are verified manually by tournament organizers.
</p>

    </div>
    </div>
  );
}
