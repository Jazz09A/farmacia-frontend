/**
 * Utilidades para optimización de imágenes
 * Incluye transformaciones de Cloudinary y progressive loading
 */

interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
  dpr?: number | 'auto';
  fetchFormat?: 'auto';
}

/**
 * Detectar si la URL es de Cloudinary
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

/**
 * Extraer el public_id de una URL de Cloudinary
 */
export const extractCloudinaryPublicId = (url: string): string | null => {
  if (!isCloudinaryUrl(url)) return null;

  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
};

/**
 * Generar URL optimizada de Cloudinary
 */
export const getOptimizedCloudinaryUrl = (
  url: string,
  options: CloudinaryTransformOptions = {}
): string => {
  if (!isCloudinaryUrl(url)) return url;

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    dpr
  } = options;

  // Construir transformaciones válidas
  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity && gravity !== 'auto') transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  // Solo agregar dpr si es un número específico
  if (dpr && typeof dpr === 'number') transformations.push(`dpr_${dpr}`);
  // fetchFormat no es un parámetro válido, usar solo format

  const transformString = transformations.join(',');

  // Si no hay transformaciones, retornar URL original
  if (!transformString) return url;

  // Insertar transformaciones en la URL
  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${transformString}/`);
  }

  return url;
};

/**
 * Generar URL de thumbnail para preview rápido
 */
export const getThumbnailUrl = (url: string, width: number = 50): string => {
  return getOptimizedCloudinaryUrl(url, {
    width,
    height: width,
    quality: 30,
    format: 'auto',
    crop: 'thumb'
  });
};

/**
 * Generar URL de baja calidad para placeholder
 */
export const getLowQualityUrl = (url: string, width: number = 100): string => {
  return getOptimizedCloudinaryUrl(url, {
    width,
    quality: 20,
    format: 'auto',
    crop: 'scale'
  });
};

/**
 * Generar URL de alta calidad
 */
export const getHighQualityUrl = (url: string, width?: number, height?: number): string => {
  // Si no es Cloudinary, retornar URL original
  if (!isCloudinaryUrl(url)) return url;
  
  return getOptimizedCloudinaryUrl(url, {
    width,
    height,
    quality: 'auto',
    format: 'auto',
    crop: width && height ? 'fill' : 'scale'
  });
};

/**
 * Generar URLs para diferentes tamaños de pantalla (responsive)
 */
export const getResponsiveUrls = (url: string) => {
  return {
    thumbnail: getThumbnailUrl(url, 50),
    small: getHighQualityUrl(url, 320),
    medium: getHighQualityUrl(url, 640),
    large: getHighQualityUrl(url, 1024),
    xlarge: getHighQualityUrl(url, 1920)
  };
};

/**
 * Generar srcset para imágenes responsive
 */
export const generateSrcSet = (url: string): string => {
  if (!isCloudinaryUrl(url)) return '';

  const sizes = [320, 640, 768, 1024, 1280, 1920];
  return sizes
    .map(size => `${getHighQualityUrl(url, size)} ${size}w`)
    .join(', ');
};

/**
 * Precargar imagen
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
    img.src = url;
  });
};

/**
 * Precargar múltiples imágenes
 */
export const preloadImages = async (urls: string[]): Promise<void[]> => {
  return Promise.all(urls.map(url => preloadImage(url)));
};

/**
 * Detectar soporte de WebP
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Obtener el ancho de dispositivo actual
 */
export const getDeviceWidth = (): number => {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};

/**
 * Calcular tamaño óptimo de imagen basado en el viewport
 */
export const getOptimalImageSize = (containerWidth: number, dpr: number = window.devicePixelRatio || 1): number => {
  // Redondear al múltiplo de 100 más cercano para mejor caché
  return Math.ceil((containerWidth * dpr) / 100) * 100;
};

/**
 * Generar blur placeholder data URL
 */
export const getBlurDataUrl = (width: number = 10, height: number = 10): string => {
  // Crear un canvas pequeño con gradiente
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Crear gradiente
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.1);
};

/**
 * Cache de imágenes en memoria
 */
class ImageCache {
  private cache: Map<string, HTMLImageElement>;
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(url: string, image: HTMLImageElement): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(url, image);
  }

  get(url: string): HTMLImageElement | undefined {
    return this.cache.get(url);
  }

  has(url: string): boolean {
    return this.cache.has(url);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const imageCache = new ImageCache(50);

/**
 * Cargar imagen con caché
 */
export const loadImageWithCache = async (url: string): Promise<HTMLImageElement> => {
  // Verificar caché
  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }

  // Cargar imagen
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });

  // Guardar en caché
  imageCache.set(url, img);

  return img;
};

export default {
  isCloudinaryUrl,
  getOptimizedCloudinaryUrl,
  getThumbnailUrl,
  getLowQualityUrl,
  getHighQualityUrl,
  getResponsiveUrls,
  generateSrcSet,
  preloadImage,
  preloadImages,
  supportsWebP,
  getDeviceWidth,
  getOptimalImageSize,
  getBlurDataUrl,
  imageCache,
  loadImageWithCache
};

