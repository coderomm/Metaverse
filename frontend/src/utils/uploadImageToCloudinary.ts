export interface UploadToCloudinaryOptions {
    file: File;
    validate?: () => void;
}

export const uploadImageToCloudinary = async ({
    file,
    validate,
}: UploadToCloudinaryOptions): Promise<string> => {
    if (validate) validate();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET_NAME);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await res.json();

    if (!data.secure_url) {
        throw new Error("Upload failed: No URL returned from Cloudinary");
    }

    return data.secure_url;
};
