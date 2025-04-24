/**
 * Image processing utilities to optimize images before sending to Groq API
 */

// Drastically reduced maximum dimensions for images sent to Groq API
const MAX_IMAGE_DIMENSION = 200 // pixels (reduced from 400)
const MAX_FILE_SIZE = 100000 // 100KB (reduced from 500KB)
const MIN_COMPRESSION_QUALITY = 0.4 // Minimum compression quality (40%)

/**
 * Creates a tiny thumbnail version of the image suitable for Groq API
 * Addresses the "Please reduce the length of the messages" error
 */
export async function createTinyThumbnail(imageBlob: Blob): Promise<Blob> {
  // Create an image element to load the blob
  const img = document.createElement("img")
  img.crossOrigin = "anonymous"
  const imageUrl = URL.createObjectURL(imageBlob)

  // Wait for the image to load
  await new Promise((resolve) => {
    img.onload = resolve
    img.src = imageUrl
  })

  // Create a canvas for the tiny thumbnail
  const canvas = document.createElement("canvas")

  // Set to very small dimensions
  canvas.width = Math.min(img.width, MAX_IMAGE_DIMENSION)
  canvas.height = Math.min(img.height, MAX_IMAGE_DIMENSION)

  // If the image is larger than our max dimension, calculate aspect ratio
  if (img.width > MAX_IMAGE_DIMENSION || img.height > MAX_IMAGE_DIMENSION) {
    const aspectRatio = img.width / img.height

    if (img.width > img.height) {
      canvas.width = MAX_IMAGE_DIMENSION
      canvas.height = Math.floor(MAX_IMAGE_DIMENSION / aspectRatio)
    } else {
      canvas.height = MAX_IMAGE_DIMENSION
      canvas.width = Math.floor(MAX_IMAGE_DIMENSION * aspectRatio)
    }
  }

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Could not get canvas context")
  }

  // Draw the image on the canvas
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // Clean up the object URL
  URL.revokeObjectURL(imageUrl)

  // Convert canvas to blob with very aggressive compression
  const thumbnailBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          // Fallback if toBlob fails
          resolve(imageBlob)
        }
      },
      "image/jpeg",
      0.5, // Very low quality (50%)
    )
  })

  return thumbnailBlob
}

/**
 * Resizes and compresses an image to make it suitable for Groq API
 * This is the original function but with more aggressive settings
 */
export async function optimizeImageForGroq(imageBlob: Blob): Promise<Blob> {
  // For Groq API, we'll now use the tiny thumbnail approach
  return createTinyThumbnail(imageBlob)
}

/**
 * Further compresses an image to target a specific file size
 */
async function compressImage(imageBlob: Blob, maxSizeBytes: number): Promise<Blob> {
  const img = document.createElement("img")
  img.crossOrigin = "anonymous"
  const imageUrl = URL.createObjectURL(imageBlob)

  // Wait for the image to load
  await new Promise((resolve) => {
    img.onload = resolve
    img.src = imageUrl
  })

  // Create a canvas
  const canvas = document.createElement("canvas")
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Could not get canvas context")
  }

  // Draw the image on the canvas
  ctx.drawImage(img, 0, 0)

  // Clean up the object URL
  URL.revokeObjectURL(imageUrl)

  // Try different quality levels until we get under the max size
  let quality = 0.5 // Start with 50% quality (reduced from 70%)
  let resultBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob || imageBlob), "image/jpeg", quality)
  })

  while (resultBlob.size > maxSizeBytes && quality > MIN_COMPRESSION_QUALITY) {
    quality -= 0.1
    resultBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob || imageBlob), "image/jpeg", quality)
    })
  }

  // If still too large, reduce dimensions by half
  if (resultBlob.size > maxSizeBytes) {
    // Reduce dimensions by 50%
    canvas.width = Math.floor(canvas.width * 0.5)
    canvas.height = Math.floor(canvas.height * 0.5)

    // Redraw at smaller size
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Try compression again
    resultBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob || imageBlob), "image/jpeg", MIN_COMPRESSION_QUALITY)
    })
  }

  return resultBlob
}

/**
 * Server-side image processing function
 * This is used when processing images on the server
 */
export async function optimizeImageOnServer(buffer: Buffer): Promise<Buffer> {
  // In a real implementation, we would use the 'sharp' library
  // For this demo, we'll just return the original buffer
  // Example implementation with sharp:
  /*
  import sharp from 'sharp';
  
  return await sharp(buffer)
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 50 })
    .toBuffer();
  */

  return buffer
}

/**
 * Truncates base64 image data to reduce token size for Groq API
 */
export function truncateBase64ForGroq(base64Image: string, maxLength = 30000): string {
  if (base64Image.length <= maxLength) {
    return base64Image
  }

  // Truncate the base64 string to reduce token count
  return base64Image.substring(0, maxLength)
}

/**
 * Estimates the number of tokens in a base64 string
 * This is a rough estimate based on the assumption that 1 token ≈ 4 characters
 */
export function estimateTokenCount(base64String: string): number {
  return Math.ceil(base64String.length / 4)
}
