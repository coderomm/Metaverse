import { AxiosError } from "axios";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<string>; // Function that uploads and returns the URL
  onUploadComplete: (url: string) => void; // Callback to return uploaded image URL
  label?: string;
  acceptTypes?: string[]; // Allowed file types
  maxSize?: number; // Max file size in MB
  preview?: boolean; // Show preview or not
  className?: string; // Custom styling
}

export function ImageUploader({
  onUpload,
  onUploadComplete,
  label = "Upload Image",
  acceptTypes = ["image/*"],
  maxSize = 5,
  preview = true,
  className = "",
}: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];

    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      toast.error(`File size should not exceed ${maxSize}MB`);
      return;
    }

    setFile(selectedFile);
    if (preview) setPreviewUrl(URL.createObjectURL(selectedFile));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    multiple: false,
  });

  const uploadFile = async () => {
    if (!file) {
      toast.error("Please select a file.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const url = await onUpload(file);
      onUploadComplete(url);
      setFile(null);
      setPreviewUrl(null);
      toast.success("Upload successful!");
    } catch (error) {
      const message = error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : 'An unexpected error occurred';
      toast.error(`${message}`);
      console.error("Upload failed: ", message)
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${isDragActive ? "border-purple-500 bg-purple-50" : "border-gray-300"}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? <p className="text-purple-500">Drop the image here...</p> : <p>Drag & drop an image, or click to select</p>}
      </div>

      {preview && previewUrl && <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-lg mx-auto" />}

      <button onClick={uploadFile} disabled={uploading} className="bg-purple-500 text-white py-2 px-4 rounded w-full">
        {uploading ? `Uploading ${progress}%` : label}
      </button>
    </div>
  );
}