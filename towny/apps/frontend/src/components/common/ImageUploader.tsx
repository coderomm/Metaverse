import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import { toast } from "sonner";

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  label?: string;
  folder?: string;
}

export function ImageUploader({ onUploadComplete, label = "Upload Image", folder = "uploads" }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const uploadToS3 = async () => {
    if (!file) {
      toast.error("Please select an image first.");
      setError("Please select an image first.");
      return;
    }

    setUploading(true);
    setProgress(50);
    setError(null);

    try {
      const client = new S3Client({
        region: import.meta.env.VITE_PUBLIC_AWS_REGION,
        credentials: {
          accessKeyId: import.meta.env.VITE_PUBLIC_AWS_ACCESS_KEY_ID!,
          secretAccessKey: import.meta.env.VITE_PUBLIC_AWS_SECRET_ACCESS_KEY!,
        },
      });

      const upload = new Upload({
        client,
        params: {
          Bucket: import.meta.env.VITE_PUBLIC_AWS_BUCKET_NAME,
          Key: `${folder}/${Date.now()}-${file.name}`,
          Body: file,
          ContentType: file.type,
        },
      });

      upload.on("httpUploadProgress", (progress) => {
        if (progress.loaded && progress.total) {
          const percentage = Math.round((progress.loaded / progress.total) * 100);
          setProgress(percentage);
        }
      });

      const result = await upload.done();
      onUploadComplete(result.Location!);
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${isDragActive ? "border-purple-500 bg-purple-50" : "border-gray-300"}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? <p className="text-purple-500">Drop the image here ...</p> : <p>Drag & drop an image here, or click to select one</p>}
      </div>

      {preview && <img src={preview} alt="Preview" className="mx-auto w-32 h-32 object-cover rounded-lg" />}

      {file && !uploading && (
        <button
          type="button"
          disabled={uploading}
          onClick={uploadToS3}
          className={`text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition duration-200 flex items-center justify-center h-[40px]
      ${!uploading ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500"}`}>
          {label}
        </button>
      )}

      {uploading && (
        <div className="mt-2">
          <div className="bg-gray-200 rounded-full h-2.5">
            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-center mt-2">{progress}% uploaded</p>
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
