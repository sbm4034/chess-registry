import { createClient } from '@/lib/supabase/client';

type DocumentType = 'dob' | 'certificate';

export async function uploadDocument(
  userId: string,
  file: File,
  type: DocumentType
) {
  const isPublic = type === 'certificate';
  const supabase = createClient();

  const bucket = isPublic
    ? 'documents-public'
    : 'documents-private';

  const filePath = `${userId}/${type}/${Date.now()}-${file.name}`;

  // Upload to correct bucket
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Insert DB record
  const { error: dbError } = await supabase.from('documents').insert({
    user_id: userId,
    type,
    file_url: filePath,
    visibility: isPublic ? 'public' : 'private',
    bucket
  });

  if (dbError) throw dbError;

  return {
    bucket,
    filePath,
    visibility: isPublic ? 'public' : 'private'
  };
}
