const path = require('path');
const fs = require('fs').promises;
const { existsSync } = require('fs');
const { v4: uuidv4 } = require('uuid');

const OUTPUT_DIR = path.join(__dirname, '../uploads/output');
const TEMP_DIR = path.join(__dirname, '../uploads/temp');

const ensureDirs = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(TEMP_DIR, { recursive: true });
};

/**
 * Save a file locally and return a download URL
 * Files are served via Express static and deleted after download
 */
const uploadFile = async (buffer, originalName, mimeType, folder = 'general') => {
  await ensureDirs();
  const ext = path.extname(originalName);
  const filename = `${uuidv4()}${ext}`;
  const folderPath = path.join(OUTPUT_DIR, folder);
  await fs.mkdir(folderPath, { recursive: true });
  const filePath = path.join(folderPath, filename);
  await fs.writeFile(filePath, buffer);
  const key = `${folder}/${filename}`;
  const url = `/downloads/${key}`;
  return { key, url, filePath };
};

/**
 * Save a file from a local path to the output directory
 */
const saveLocalFile = async (sourcePath, folder = 'general') => {
  await ensureDirs();
  const ext = path.extname(sourcePath);
  const filename = `${uuidv4()}${ext}`;
  const folderPath = path.join(OUTPUT_DIR, folder);
  await fs.mkdir(folderPath, { recursive: true });
  const destPath = path.join(folderPath, filename);
  await fs.copyFile(sourcePath, destPath);
  const key = `${folder}/${filename}`;
  const url = `/downloads/${key}`;
  return { key, url, filePath: destPath };
};

/**
 * Delete a file by key
 */
const deleteFile = async (key) => {
  try {
    const filePath = path.join(OUTPUT_DIR, key);
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
    }
  } catch (err) {
    console.warn('[Storage] Delete failed:', err.message);
  }
};

/**
 * Get full file path from key
 */
const getFilePath = (key) => path.join(OUTPUT_DIR, key);

/**
 * Delete file after a delay (cleanup after download)
 * Default: delete after 24 hours
 */
const scheduleDelete = (key, delayMs = 24 * 60 * 60 * 1000) => {
  setTimeout(async () => {
    await deleteFile(key);
    console.log(`[Storage] Cleaned up: ${key}`);
  }, delayMs);
};

module.exports = { uploadFile, saveLocalFile, deleteFile, getFilePath, scheduleDelete, OUTPUT_DIR };
