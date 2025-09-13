/**
 * File Validation Utility for AI Caption Genie
 * Validates JPEG/PNG/GIF/MP4/MOV formats and 10MB size limit
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: 'image' | 'video';
}

// Supported MIME types and their corresponding file types
const SUPPORTED_TYPES = {
  // Image types
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  // Video types
  'video/mp4': 'video',
  'video/quicktime': 'video', // .mov files
} as const;

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validates a file based on type and size requirements
 */
export function validateFile(file: File): FileValidationResult {
  // Check if file type is supported
  const mimeType = file.type.toLowerCase();
  const fileType = SUPPORTED_TYPES[mimeType as keyof typeof SUPPORTED_TYPES];
  
  if (!fileType) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload JPEG, PNG, GIF, MP4, or MOV files.'
    };
  }

  // Check file size (must be 10MB or less)
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File must be under 10MB'
    };
  }

  // File is valid
  return {
    isValid: true,
    fileType
  };
}
