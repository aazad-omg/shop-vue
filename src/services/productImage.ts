import { supabase } from '@/supabase'

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxFileSize = 2 * 1024 * 1024
const bucketName = 'products'

export async function uploadProductImage(file: File) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, or WebP image.')
  }

  if (file.size > maxFileSize) {
    throw new Error('Image must be smaller than 2 MB.')
  }

  const extension = file.type.split('/')[1]
  const path = `${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(bucketName).upload(path, file, {
    contentType: file.type,
    cacheControl: '3600',
  })

  if (error) throw error

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path)

  return { path, url: data.publicUrl }
}

export async function removeProductImage(path: string) {
  const { error } = await supabase.storage.from(bucketName).remove([path])

  if (error) throw error
}
