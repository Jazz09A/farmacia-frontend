// 🛒 Helper para persistencia mínima del carrito de cotizaciones en localStorage
// Solo guarda co_art y cantidad según la guía de implementación

export interface QuoteCartItem {
  co_art: string;
  cantidad: number;
}

export const QUOTE_CART_STORAGE_KEY = 'profitplus_quote_cart';
const QUOTE_CART_KEY = QUOTE_CART_STORAGE_KEY;

/**
 * Carga el carrito desde localStorage
 * @returns Array de items con co_art y cantidad, o array vacío si no hay datos
 */
export function loadQuoteCart(): QuoteCartItem[] {
  try {
    const stored = localStorage.getItem(QUOTE_CART_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    // Validar que sea un array
    if (!Array.isArray(parsed)) {
      console.warn('Quote cart data is not an array, resetting');
      localStorage.removeItem(QUOTE_CART_KEY);
      return [];
    }
    // Validar estructura de cada item
    const validItems = parsed.filter(
      (item: any): item is QuoteCartItem =>
        item &&
        typeof item.co_art === 'string' &&
        typeof item.cantidad === 'number' &&
        item.cantidad > 0
    );
    // Si hay items inválidos, guardar solo los válidos
    if (validItems.length !== parsed.length) {
      saveQuoteCart(validItems);
    }
    return validItems;
  } catch (error) {
    console.error('Error loading quote cart from localStorage:', error);
    // Limpiar datos corruptos
    localStorage.removeItem(QUOTE_CART_KEY);
    return [];
  }
}

/**
 * Guarda el carrito en localStorage
 * @param items Array de items con co_art y cantidad
 */
export function saveQuoteCart(items: QuoteCartItem[]): void {
  try {
    // Validar antes de guardar
    const validItems = items.filter(
      (item): item is QuoteCartItem =>
        item &&
        typeof item.co_art === 'string' &&
        typeof item.cantidad === 'number' &&
        item.cantidad > 0
    );
    localStorage.setItem(QUOTE_CART_KEY, JSON.stringify(validItems));
  } catch (error) {
    console.error('Error saving quote cart to localStorage:', error);
    // Si hay error de quota, intentar limpiar y guardar de nuevo
    try {
      localStorage.removeItem(QUOTE_CART_KEY);
      localStorage.setItem(QUOTE_CART_KEY, JSON.stringify(items));
    } catch (retryError) {
      console.error('Failed to save quote cart after cleanup:', retryError);
    }
  }
}

/**
 * Agrega o actualiza un item en el carrito
 * @param co_art Código del artículo
 * @param cantidad Cantidad a agregar (se suma si el item ya existe)
 * @returns El carrito actualizado
 */
export function addToQuoteCart(co_art: string, cantidad: number): QuoteCartItem[] {
  const cart = loadQuoteCart();
  const existingIndex = cart.findIndex(item => item.co_art === co_art);

  if (existingIndex >= 0) {
    // Actualizar cantidad existente
    cart[existingIndex].cantidad += cantidad;
    // Si la cantidad resultante es <= 0, eliminar el item
    if (cart[existingIndex].cantidad <= 0) {
      cart.splice(existingIndex, 1);
    }
  } else {
    // Agregar nuevo item
    if (cantidad > 0) {
      cart.push({ co_art, cantidad });
    }
  }

  saveQuoteCart(cart);
  return cart;
}

/**
 * Actualiza la cantidad de un item específico
 * @param co_art Código del artículo
 * @param nuevaCantidad Nueva cantidad (si es <= 0, se elimina el item)
 * @returns El carrito actualizado
 */
export function updateQuoteCartQuantity(
  co_art: string,
  nuevaCantidad: number
): QuoteCartItem[] {
  const cart = loadQuoteCart();
  const existingIndex = cart.findIndex(item => item.co_art === co_art);

  if (existingIndex >= 0) {
    if (nuevaCantidad > 0) {
      cart[existingIndex].cantidad = nuevaCantidad;
    } else {
      // Eliminar si cantidad es 0 o menos
      cart.splice(existingIndex, 1);
    }
  } else if (nuevaCantidad > 0) {
    // Si no existe y la cantidad es válida, agregarlo
    cart.push({ co_art, cantidad: nuevaCantidad });
  }

  saveQuoteCart(cart);
  return cart;
}

/**
 * Elimina un item del carrito
 * @param co_art Código del artículo a eliminar
 * @returns El carrito actualizado
 */
export function removeFromQuoteCart(co_art: string): QuoteCartItem[] {
  const cart = loadQuoteCart();
  const filtered = cart.filter(item => item.co_art !== co_art);
  saveQuoteCart(filtered);
  return filtered;
}

/**
 * Limpia todo el carrito
 */
export function clearQuoteCart(): void {
  localStorage.removeItem(QUOTE_CART_KEY);
}

/**
 * Obtiene la cantidad de un item específico
 * @param co_art Código del artículo
 * @returns Cantidad del item, o 0 si no existe
 */
export function getQuoteCartQuantity(co_art: string): number {
  const cart = loadQuoteCart();
  const item = cart.find(item => item.co_art === co_art);
  return item ? item.cantidad : 0;
}

/**
 * Obtiene el total de items únicos en el carrito
 */
export function getQuoteCartItemCount(): number {
  return loadQuoteCart().length;
}

/**
 * Sincroniza el carrito de localStorage con el carrito del servidor
 * Convierte items del servidor (con product.id) a formato localStorage (co_art)
 * @param serverCartItems Items del carrito del servidor
 */
export function syncQuoteCartFromServer(serverCartItems: Array<{ product: { id: string }; quantity: number }>): void {
  const quoteItems: QuoteCartItem[] = serverCartItems.map(item => ({
    co_art: item.product.id, // En nuestro sistema, product.id es el co_art
    cantidad: item.quantity
  }));
  saveQuoteCart(quoteItems);
}

/**
 * Convierte el carrito de localStorage a formato para enviar al servidor
 * @returns Array de items en formato { co_art, cantidad }
 */
export function getQuoteCartForValidation(): QuoteCartItem[] {
  return loadQuoteCart();
}


