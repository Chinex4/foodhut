import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { generateSignature } from "@/redux/storageApi/storageApi.thunks";
import axios from "axios";
import { showError } from "@/components/ui/toast";

export type UploadableFile = {
  uri: string;
  name?: string;
  type?: string;
};

/**
 * Hook to handle signed image uploads to Cloudinary.
 * Follows the flow:
 * 1. Request signature from backend
 * 2. Upload file directly to Cloudinary using the signature
 * 3. Return the pre-allocated storage ID from the backend
 */
export const useImageUpload = () => {
  const dispatch = useAppDispatch();
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: UploadableFile): Promise<string | null> => {
    setIsUploading(true);
    try {
      // 1. Generate signature from backend
      const signatureAction = await dispatch(generateSignature()).unwrap();
      
      if (!signatureAction.upload_url || !signatureAction.payload) {
        throw new Error("Invalid signature received from server");
      }

      // 2. Prepare Form Data for Cloudinary
      const formData = new FormData();
      
      // The file must be appended
      // In React Native, the object structure for a file is { uri, name, type }
      formData.append("file", {
        uri: file.uri,
        type: file.type || "image/jpeg",
        name: file.name || "upload.jpg",
      } as any);
      
      // Add all fields from the backend signature payload (api_key, timestamp, signature, etc.)
      Object.entries(signatureAction.payload).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      // 3. Upload directly to Cloudinary
      await axios.post(signatureAction.upload_url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 4. Return the storage ID allocated by the backend
      return signatureAction.id;
    } catch (error: any) {
      console.error("Image upload failed:", error?.response?.data || error);
      showError(error?.message || "Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading };
};
