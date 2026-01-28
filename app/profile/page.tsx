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

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>My Profile</h1>

      <label>Name</label>
      <input
        value={profile.name}
        onChange={(e) =>
          setProfile({ ...profile, name: e.target.value })
        }
      />

      <label>FIDE ID</label>
      <input
        placeholder="FIDE ID"
        value={profile.fide_id || ''}
        onChange={(e) =>
          setProfile({ ...profile, fide_id: e.target.value })
        }
      />

      <label>City</label>
      <input
        placeholder="City"
        value={profile.city || ''}
        onChange={(e) =>
          setProfile({ ...profile, city: e.target.value })
        }
      />
      <hr />

<h2>Documents</h2>

<div>
  <label>DOB Proof (Private)</label>
  <input
    type="file"
    accept="image/*,application/pdf"
    onChange={(e) =>
      e.target.files && uploadDob(e.target.files[0])
    }
  />
</div>

<div style={{ marginTop: 10 }}>
  <label>
    Chess Certificates (Public – visible for verification)
  </label>
  <input
    type="file"
    multiple
    accept="image/*,application/pdf"
    onChange={(e) =>
      e.target.files && uploadCertificates(e.target.files)
    }
  />
</div>
<h3>Uploaded Documents</h3>


{documents.length === 0 && <p>No documents uploaded</p>}

<ul>
  {documents.map((doc) => (
    <li key={doc.id}>
      <strong>{doc.type}</strong> — {doc.visibility}
    </li>
  ))}
</ul>

<hr />

<h2>My Event Registrations</h2>

{registrations.length === 0 && (
  <p>You have not registered for any events yet.</p>
)}

<ul>
  {registrations.map((reg, index) => (
    <li key={index} style={{ marginBottom: 12 }}>
      <strong>{reg.events.name}</strong>
      <br />
      <small>
        {reg.events.location} | {reg.events.start_date} → {reg.events.end_date}
      </small>
      <br />
      Status:{' '}
      <strong style={{ textTransform: 'capitalize' }}>
        {reg.status}
      </strong>
    </li>
  ))}
</ul>

      <div style={{ marginTop: 16 }}>
        <button onClick={saveProfile}>Save Profile</button>
        <button onClick={logout} style={{ marginLeft: 10 }}>
          Logout
        </button>
      </div>
    </div>
  );
}
