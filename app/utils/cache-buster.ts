/**
 * Utility untuk melakukan cache-busting
 * Membantu mencegah masalah caching font dan aset lainnya
 * 
 * Januar Galuh Prabakti - Portfolio Website
 */

// Membuat timestamp unik untuk cache busting
export const getCacheBuster = (): string => {
  return `v=${new Date().getTime()}`;
};

// Utility untuk menambahkan cache buster ke URL
export const addCacheBusterToUrl = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${getCacheBuster()}`;
};

// Cache busting untuk font
export const fontCacheBuster = {
  key: 'font-cache-v1', // Increment jika ada perubahan besar pada font
  version: new Date().toDateString(),
  getVersionedPath: (path: string): string => {
    return addCacheBusterToUrl(path);
  }
};

export default {
  getCacheBuster,
  addCacheBusterToUrl,
  fontCacheBuster
}; 