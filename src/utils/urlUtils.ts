/**
 * Utilidades para URLs obfuscadas ("chorrero de letras y numeros")
 * Implementa varios métodos de obfuscación para URLs de productos y páginas
 */

// Configuración
const SALT = 'farmaplus_2024_salt';
const URL_MAPPINGS: Record<string, string> = {};
const REVERSE_MAPPINGS: Record<string, string> = {};

interface ObfuscationOptions {
  method: 'base64' | 'hash' | 'uuid' | 'custom';
  includeTimestamp?: boolean;
  length?: number;
}

/**
 * Método 1: Base64 + Salt para obfuscación básica
 */
export class Base64Obfuscator {
  static encode(originalUrl: string, salt: string = SALT): string {
    const combined = `${originalUrl}|${salt}|${Date.now()}`;
    const encoded = btoa(combined);
    // Hacer URL-safe y remover padding
    return encoded.replace(/[+/]/g, (match) => match === '+' ? '-' : '_').replace(/=/g, '');
  }

  static decode(obfuscatedUrl: string, salt: string = SALT): string | null {
    try {
      // Restaurar padding y caracteres
      const padding = '='.repeat((4 - obfuscatedUrl.length % 4) % 4);
      const restored = obfuscatedUrl.replace(/[-_]/g, (match) => match === '-' ? '+' : '/') + padding;
      
      const decoded = atob(restored);
      const [originalUrl, receivedSalt] = decoded.split('|');
      
      if (receivedSalt !== salt) {
        return null;
      }
      
      return originalUrl;
    } catch {
      return null;
    }
  }
}

/**
 * Método 2: Hash personalizado para URLs más cortas
 */
export class HashObfuscator {
  private static hashTable: Record<string, string> = {};
  private static reverseTable: Record<string, string> = {};

  static generateHash(input: string, length: number = 12): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let hash = '';
    
    // Crear hash usando el input + salt
    const combined = input + SALT;
    let hashNumber = 0;
    
    for (let i = 0; i < combined.length; i++) {
      hashNumber = ((hashNumber << 5) - hashNumber + combined.charCodeAt(i)) & 0xffffffff;
    }
    
    // Convertir a string alfanumérico
    const absHash = Math.abs(hashNumber);
    for (let i = 0; i < length; i++) {
      hash += chars[absHash % chars.length];
      hashNumber = Math.floor(hashNumber / chars.length);
    }
    
    return hash;
  }

  static encode(originalUrl: string): string {
    if (this.hashTable[originalUrl]) {
      return this.hashTable[originalUrl];
    }

    const hash = this.generateHash(originalUrl);
    this.hashTable[originalUrl] = hash;
    this.reverseTable[hash] = originalUrl;
    
    return hash;
  }

  static decode(hash: string): string | null {
    return this.reverseTable[hash] || null;
  }

  static getMapping(): Record<string, string> {
    return { ...this.hashTable };
  }
}

/**
 * Método 3: UUID-like para URLs que parecen IDs únicos
 */
export class UUIDObfuscator {
  static encode(originalUrl: string): string {
    const timestamp = Date.now().toString(16);
    const randomPart = Math.random().toString(16).substr(2, 8);
    const hashPart = HashObfuscator.generateHash(originalUrl, 8);
    
    // Formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuid = [
      hashPart.substr(0, 8),
      timestamp.substr(0, 4),
      '4' + randomPart.substr(0, 3),
      'a' + hashPart.substr(8, 3),
      timestamp.substr(4) + randomPart.substr(3)
    ].join('-');

    // Guardar mapeo
    URL_MAPPINGS[originalUrl] = uuid;
    REVERSE_MAPPINGS[uuid] = originalUrl;

    return uuid;
  }

  static decode(uuid: string): string | null {
    return REVERSE_MAPPINGS[uuid] || null;
  }
}

/**
 * Método 4: Obfuscador personalizado con múltiples capas
 */
export class CustomObfuscator {
  private static encode_map: Record<string, string> = {};
  private static decode_map: Record<string, string> = {};

  static encode(originalUrl: string, options: ObfuscationOptions = { method: 'custom' }): string {
    if (this.encode_map[originalUrl]) {
      return this.encode_map[originalUrl];
    }

    let obfuscated: string;

    switch (options.method) {
      case 'base64':
        obfuscated = Base64Obfuscator.encode(originalUrl);
        break;
      
      case 'hash':
        obfuscated = HashObfuscator.encode(originalUrl);
        break;
      
      case 'uuid':
        obfuscated = UUIDObfuscator.encode(originalUrl);
        break;
      
      default:
        // Método personalizado: combinación de varios
        const hashPart = HashObfuscator.generateHash(originalUrl, 6);
        const timestampPart = Date.now().toString(36).substr(-4);
        const randomPart = Math.random().toString(36).substr(2, 4);
        obfuscated = `${hashPart}${timestampPart}${randomPart}`.toLowerCase();
        break;
    }

    this.encode_map[originalUrl] = obfuscated;
    this.decode_map[obfuscated] = originalUrl;

    return obfuscated;
  }

  static decode(obfuscated: string): string | null {
    return this.decode_map[obfuscated] || null;
  }

  static getAllMappings() {
    return {
      encoded: { ...this.encode_map },
      decoded: { ...this.decode_map }
    };
  }
}

/**
 * Clase principal para gestión de URLs obfuscadas
 */
export class URLObfuscator {
  private static method: ObfuscationOptions['method'] = 'custom';

  /**
   * Configurar método de obfuscación global
   */
  static setMethod(method: ObfuscationOptions['method']): void {
    this.method = method;
  }

  /**
   * Obfuscar URL de producto
   */
  static obfuscateProductUrl(productId: string, productSlug?: string): string {
    const originalUrl = productSlug ? `/producto/${productSlug}` : `/producto/${productId}`;
    
    switch (this.method) {
      case 'base64':
        return `/p/${Base64Obfuscator.encode(originalUrl)}`;
      case 'hash':
        return `/p/${HashObfuscator.encode(originalUrl)}`;
      case 'uuid':
        return `/p/${UUIDObfuscator.encode(originalUrl)}`;
      default:
        return `/p/${CustomObfuscator.encode(originalUrl)}`;
    }
  }

  /**
   * Obfuscar URL de categoría
   */
  static obfuscateCategoryUrl(category: string, subcategory?: string): string {
    const originalUrl = subcategory 
      ? `/catalogo/${category}/${subcategory}` 
      : `/catalogo/${category}`;
    
    return `/c/${CustomObfuscator.encode(originalUrl)}`;
  }

  /**
   * Desobfuscar cualquier URL
   */
  static deobfuscateUrl(obfuscatedPath: string): string | null {
    // Extraer la parte obfuscada de la URL
    const pathMatch = obfuscatedPath.match(/^\/[pc]\/(.+)$/);
    if (!pathMatch) return null;

    const obfuscatedPart = pathMatch[1];

    // Intentar con todos los métodos
    const methods = [
      () => CustomObfuscator.decode(obfuscatedPart),
      () => Base64Obfuscator.decode(obfuscatedPart),
      () => HashObfuscator.decode(obfuscatedPart),
      () => UUIDObfuscator.decode(obfuscatedPart)
    ];

    for (const method of methods) {
      const result = method();
      if (result) return result;
    }

    return null;
  }

  /**
   * Generar URL obfuscada para debugging
   */
  static generateDebugUrl(originalUrl: string): {
    original: string;
    base64: string;
    hash: string;
    uuid: string;
    custom: string;
  } {
    return {
      original: originalUrl,
      base64: Base64Obfuscator.encode(originalUrl),
      hash: HashObfuscator.encode(originalUrl),
      uuid: UUIDObfuscator.encode(originalUrl),
      custom: CustomObfuscator.encode(originalUrl)
    };
  }
}

/**
 * Utilidades para debugging en desarrollo
 */
export class DebugUtils {
  /**
   * Mostrar todos los mapeos de URLs
   */
  static showAllMappings(): void {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 URL Obfuscation Mappings');
      console.log('Custom Mappings:', CustomObfuscator.getAllMappings());
      console.log('Hash Mappings:', HashObfuscator.getMapping());
      console.groupEnd();
    }
  }

  /**
   * Probar obfuscación de URL
   */
  static testObfuscation(originalUrl: string): void {
    if (process.env.NODE_ENV === 'development') {
      const results = URLObfuscator.generateDebugUrl(originalUrl);
      console.group(`🧪 Testing URL: ${originalUrl}`);
      Object.entries(results).forEach(([method, url]) => {
        console.log(`${method.padEnd(10)}: ${url}`);
      });
      console.groupEnd();
    }
  }

  /**
   * Comandos de consola para debugging
   */
  static setupConsoleCommands(): void {
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore
      window.farmaDebug = {
        obfuscate: (url: string) => URLObfuscator.generateDebugUrl(url),
        deobfuscate: (url: string) => URLObfuscator.deobfuscateUrl(url),
        showMappings: () => DebugUtils.showAllMappings(),
        testUrl: (url: string) => DebugUtils.testObfuscation(url)
      };

      console.log('🎯 FarmaPlus Debug Utils loaded! Use window.farmaDebug');
    }
  }
}

// Auto-setup en desarrollo
if (process.env.NODE_ENV === 'development') {
  DebugUtils.setupConsoleCommands();
}

// Exportar todo
export {
  Base64Obfuscator,
  HashObfuscator,
  UUIDObfuscator,
  CustomObfuscator,
  DebugUtils
};

// Export por defecto
export default URLObfuscator; 