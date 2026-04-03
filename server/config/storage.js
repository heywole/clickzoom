const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (buffer, originalName, mimeType, folder = 'general') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `clickzoom/${folder}`, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ key: result.public_id, url: result.secure_url });
      }
    );
    const { Readable } = require('stream');
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

const saveLocalFile = async (sourcePath, folder = 'general') => {
  const result = await cloudinary.uploader.upload(sourcePath, {
    folder: `clickzoom/${folder}`,
    resource_type: 'auto',
  });
  return { key: result.public_id, url: result.secure_url };
};

const deleteFile = async (key) => {
  try {
    await cloudinary.uploader.destroy(key, { resource_type: 'auto' });
  } catch (err) {
    console.warn('[Storage] Cloudinary delete failed:', err.message);
  }
};

const getFilePath = (key) => key;

const scheduleDelete = (key, delayMs = 24 * 60 * 60 * 1000) => {
  setTimeout(async () => {
    await deleteFile(key);
    console.log(`[Storage] Cleaned up: ${key}`);
  }, delayMs);
};

const OUTPUT_DIR = path.join(__dirname, '../uploads/output');

module.exports = { uploadFile, saveLocalFile, deleteFile, getFilePath, scheduleDelete, OUTPUT_DIR };
