import { supabase } from '@/supabase'

export async function uploadAvatar(file: File, oldAvatarPath?: string | null) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('You must be signed in.')

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, or WebP image.')
  }

  // Validate file size
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Image must be smaller than 2 MB.')
  }

  const extension = file.type.split('/')[1]
  const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`

  // Upload new image
  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
    contentType: file.type,
    cacheControl: '3600',
  })

  if (uploadError) throw uploadError

  // Update profile with new image path
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, avatar_path: filePath }, { onConflict: 'id' })

  if (profileError) {
    // Remove newly uploaded image if profile update fails
    await supabase.storage.from('avatars').remove([filePath])
    throw profileError
  }

  // Delete previous image after successful profile update
  if (oldAvatarPath) {
    const { error: deleteError } = await supabase.storage.from('avatars').remove([oldAvatarPath])

    if (deleteError) {
      console.error('Could not delete previous avatar:', deleteError)
    }
  }

  return filePath
}

// check if possible to send profile path as url directly while fetching profile data
export async function getAvatarUrl(path: string) {
  const { data, error } = await supabase.storage.from('avatars').createSignedUrl(path, 3600)

  if (error) throw error

  return data.signedUrl
}
