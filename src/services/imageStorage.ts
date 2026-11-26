import { supabase } from '@/supabase'
import { validateImageFile } from '@/helpers'

type UploadImageOptions = {
  bucket: string
  folder?: string
}

export async function uploadImage(file: File, { bucket, folder }: UploadImageOptions) {
  validateImageFile(file)

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
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

  if (error) throw error

  return data.signedUrl
}
