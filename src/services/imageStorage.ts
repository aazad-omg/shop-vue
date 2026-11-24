import { supabase } from '@/supabase'

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxFileSize = 2 * 1024 * 1024

type UploadImageOptions = {
  bucket: string
  folder?: string
}

export async function uploadImage(file: File, { bucket, folder }: UploadImageOptions) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, or WebP image.')
  }

  if (file.size > maxFileSize) {
    throw new Error('Image must be smaller than 2 MB.')
  }

  const extension = file.type.split('/')[1]
  const filename = `${crypto.randomUUID()}.${extension}`
  const path = folder ? `${folder}/${filename}` : filename
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    cacheControl: '3600',
  })

  if (error) throw error

  return path
}

export async function removeImage(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) throw error
}

export function getPublicImageUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

export async function getSignedImageUrl(bucket: string, path: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) throw error

  return data.signedUrl
}
