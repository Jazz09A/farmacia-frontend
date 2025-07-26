import { Product } from "../types";
import { mockProducts } from "./mockData";

// Interface for paginated response
interface PaginatedResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Function to map API data to Product interface
const mapApiDataToProduct = (apiProduct: any): Product => {
  return {
    id: apiProduct.id || Math.random().toString(36).substr(2, 9),
    name: apiProduct.name || 'Producto sin nombre',
    brand: apiProduct.brand || 'Marca desconocida',
    category: apiProduct.category || 'Sin categoría',
    subcategory: apiProduct.subcategory,
    patology: apiProduct.patology,
    priceVES: apiProduct.price_ves || apiProduct.current_price || 0,
    priceREF: apiProduct.price_ref || 0,
    description: apiProduct.description || 'Sin descripción disponible',
    ingredients: apiProduct.ingredients || [],
    image: apiProduct.image || apiProduct.images?.[0] || 'https://via.placeholder.com/300x300?text=Sin+Imagen',
    images: apiProduct.images || [apiProduct.image || 'https://via.placeholder.com/300x300?text=Sin+Imagen'],
    inStock: apiProduct.in_stock !== undefined ? apiProduct.in_stock : apiProduct.is_available !== undefined ? apiProduct.is_available : true,
    stock: apiProduct.stock || 10,
    prescription: apiProduct.prescription || false,
    rating: apiProduct.rating || 4.0,
    reviews: apiProduct.review_count || Math.floor(Math.random() * 100) + 1,
    isOffer: apiProduct.is_offer || false,
    originalPrice: apiProduct.original_price,
    offerEndTime: apiProduct.offer_end_time ? new Date(apiProduct.offer_end_time) : undefined,
    featured: apiProduct.featured || false,
    dosage: apiProduct.dosage,
    presentation: apiProduct.presentation,
    laboratorio: apiProduct.laboratorio || apiProduct.brand,
    registroSanitario: apiProduct.registro_sanitario,
    contraindicaciones: apiProduct.contraindicaciones,
    efectosSecundarios: apiProduct.efectos_secundarios,
  };
};

// Function to fetch products with pagination
const fetchProductsPaginated = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse> => {
  // For now, always use mock data since we don't have a real API
  console.log(`Using mock data pagination - Page: ${page}, Limit: ${limit}`);
  console.log(`Total mock products available: ${mockProducts.length}`);
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMockProducts = mockProducts.slice(startIndex, endIndex);
  const total = mockProducts.length;
  const totalPages = Math.ceil(total / limit);
  
  console.log(`Returning page ${page}: products ${startIndex + 1}-${Math.min(endIndex, total)} of ${total}`);
  console.log(`Total pages: ${totalPages}`);
  
  return {
    products: paginatedMockProducts,
    total,
    page,
    limit,
    totalPages
  };

  /* Commented out API logic for future use
  try {
    console.log(`Fetching products from API - Page: ${page}, Limit: ${limit}`);
    const response = await fetch(`/api/v1/public/products?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Paginated Response:', data);
    
    // Check if the response has pagination info or if it's just an array
    let products, total, totalPages;
    
    if (Array.isArray(data)) {
      // Fallback for APIs that return a raw array. We'll paginate the full list client-side.
      const allProducts = data.map(mapApiDataToProduct);
      total = allProducts.length;
      totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      products = allProducts.slice(startIndex, startIndex + limit);
    } else {
      // Standard pagination structure handling
      const results = data.results || data.products || data.data || [];
      products = results.map(mapApiDataToProduct);
      total = data.total || data.count || products.length;
      totalPages = data.totalPages || data.total_pages || Math.ceil(total / limit);
    }
    
    console.log('Mapped products:', products.length, `Total pages calculated: ${totalPages}`);
    
    return {
      products,
      total,
      page,
      limit,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching paginated products:', error);
    console.log('Falling back to mock data');
    
    // Return mock data with pagination structure
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMockProducts = mockProducts.slice(startIndex, endIndex);
    
    return {
      products: paginatedMockProducts,
      total: mockProducts.length,
      page,
      limit,
      totalPages: Math.ceil(mockProducts.length / limit)
    };
  }
  */
};

// Function to fetch products from API (backward compatibility)
const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetchProductsPaginated(1, 100); // Get first 100 products
  return response.products;
};

// Export function for paginated requests
export const getProductsPaginated = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse> => {
  return await fetchProductsPaginated(page, limit);
};

// Export function for use in components (backward compatibility)
export const getProducts = async (): Promise<Product[]> => {
  return await fetchProducts();
};

// Initialize products with mock data, then try to fetch from API
let products: Product[] = mockProducts;

// Attempt to fetch from API
fetchProducts().then(apiProducts => {
  products = apiProducts;
  console.log('Products loaded:', products.length, 'items');
  });

export default products;