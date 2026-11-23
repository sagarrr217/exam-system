import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true
});

export const uploadImageToCloudinary = async (base64OrUrl: string, folder = 'exam-questions'): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(base64OrUrl, {
      folder,
      resource_type: 'image'
    });
    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Image upload failed: ${error.message || 'Unknown error'}`);
  }
};

export { cloudinary };
