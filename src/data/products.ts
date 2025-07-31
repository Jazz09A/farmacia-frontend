import { Product } from "../types/index";

// Interface for paginated response matching the backend structure
interface PaginatedResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface for backend API response
interface BackendResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    next_page: number | null;
    prev_page: number | null;
  };
  filters_applied: {
    sort_by: string;
  };
  total: number;
}

// Function to map backend product data to frontend Product interface
const mapBackendProductToProduct = (backendProduct: Product): Product => {
  // Handle image URLs - if they contain placeholder, use a default image
  const imageUrl = backendProduct.image?.includes('placeholder') 
    ? 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop'
    : backendProduct.image;

  const images = backendProduct.images?.map(img => 
    img?.includes('placeholder') 
      ? 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop'
      : img
  ) || [imageUrl];

  return {
    id: backendProduct.id,
    name: backendProduct.name,
    brand: backendProduct.brand,
    category: backendProduct.category,
    subcategory: backendProduct.subcategory,
    patology: backendProduct.patology,
    price_ves: backendProduct.price_ves,
    price_ref: backendProduct.price_ref,
    description: backendProduct.description,
    ingredients: backendProduct.ingredients || [],
    image: imageUrl,
    images: images,
    in_stock: backendProduct.in_stock,
    stock: backendProduct.stock,
    prescription: backendProduct.prescription,
    rating: backendProduct.rating,
    review_count: backendProduct.review_count,
    is_offer: backendProduct.is_offer,
    original_price: backendProduct.original_price || null,
    offer_end_time: backendProduct.offer_end_time ? new Date(backendProduct.offer_end_time).toISOString() : null,
    featured: backendProduct.featured,
    dosage: backendProduct.dosage,
    presentation: backendProduct.presentation,
    laboratorio: backendProduct.laboratorio,
    registro_sanitario: backendProduct.registro_sanitario,
    contraindicaciones: backendProduct.contraindicaciones,
    efectos_secundarios: backendProduct.efectos_secundarios,
    slug: backendProduct.slug,
    discount_percentage: backendProduct.discount_percentage,
    current_price: backendProduct.current_price,
    is_available: backendProduct.is_available,
    created_at: backendProduct.created_at,
    updated_at: backendProduct.updated_at,
  };
};

// Function to fetch products with pagination from the real API
const fetchProductsPaginated = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse> => {
  try {
    console.log(`Fetching products from API - Page: ${page}, Limit: ${limit}`);
    
    // Build the API URL with pagination parameters
    const apiUrl = `/api/v1/public/products?page=${page}&limit=${limit}&sort_by=name`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: BackendResponse = await response.json();
    console.log('API Response:', data);
    
    // Map backend products to frontend products
    const mappedProducts = data.products.map(mapBackendProductToProduct);
    
    const result: PaginatedResponse = {
      products: mappedProducts,
      total: data.pagination.total,
      page: data.pagination.page,
      limit: data.pagination.limit,
      totalPages: data.pagination.total_pages
    };
    
    console.log('Mapped products:', mappedProducts.length, `Total pages: ${result.totalPages}`);
    console.log('Pagination info:', {
      page: result.page,
      totalPages: result.totalPages,
      total: result.total,
      limit: result.limit
    });
    
    return result;
    
  } catch (error) {
    console.error('Error fetching products from API:', error);
    
    // Fallback: return empty structure to maintain consistency
    return {
      products: [],
      total: 0,
      page: 1,
      limit: limit,
      totalPages: 0
    };
  }
};

// Export function for paginated requests
export const getProductsPaginated = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse> => {
  return await fetchProductsPaginated(page, limit);
};

// Export function for backward compatibility - gets first page of products
export const getProducts = async (): Promise<Product[]> => {
  const response = await fetchProductsPaginated(1, 100);
  return response.products;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const response = await fetch(`/api/v1/public/products/${id}`);
  const data = await response.json();
  return data || null;
};


// Default export - empty array since we're now using async loading
