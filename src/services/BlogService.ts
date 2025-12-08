import { getApiUrl } from '../config';
import { authService } from './AuthService';
import {
  BlogPostApiResponse,
  BlogPostDetail,
  BlogPostListItem,
  BlogCategory,
  BlogImagesResponse,
  BlogImage,
} from '../types';

export interface PublicPostsParams {
  page?: number;
  limit?: number;
  category_slug?: string;
  search?: string;
}

export interface AdminPostsParams {
  page?: number;
  limit?: number;
  status_filter?: 'draft' | 'published' | 'archived';
  category_id?: string;
  search?: string;
  include_deleted?: boolean;
}

export interface CreatePostData {
  title: string;
  content: string;
  category_id: string;
  author_name?: string;
  featured_image_url?: string;
  status: 'draft' | 'published' | 'archived';
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  content?: string;
  category_id?: string;
  author_name?: string;
  featured_image_url?: string;
  status?: 'draft' | 'published' | 'archived';
  published_at?: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

class BlogService {
  private baseUrl = '/v1';
  private publicBaseUrl = `${this.baseUrl}/public/blog`;
  private adminBaseUrl = `${this.baseUrl}/admin/blog`;

  // ========== PUBLIC METHODS (No authentication required) ==========

  /**
   * Get public blog posts (paginated)
   */
  async getPublicPosts(params: PublicPostsParams = {}): Promise<BlogPostApiResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category_slug) queryParams.append('category_slug', params.category_slug);
    if (params.search) queryParams.append('search', params.search);

    const url = `${getApiUrl(this.publicBaseUrl)}/posts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener artículos del blog' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get public blog post by slug
   */
  async getPublicPostBySlug(slug: string): Promise<BlogPostDetail> {
    const url = `${getApiUrl(this.publicBaseUrl)}/posts/${slug}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Artículo no encontrado');
      }
      const error = await response.json().catch(() => ({ message: 'Error al obtener el artículo' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get public blog categories
   */
  async getPublicCategories(): Promise<BlogCategory[]> {
    const url = `${getApiUrl(this.publicBaseUrl)}/categories`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener categorías' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get public blog image by ID
   * Returns the image URL directly (can be used in <img src>)
   */
  getPublicImageUrl(imageId: string): string {
    return `${getApiUrl(this.publicBaseUrl)}/images/${imageId}`;
  }

  // ========== ADMIN METHODS (Authentication required) ==========

  /**
   * Get admin blog posts (paginated, includes drafts)
   */
  async getAdminPosts(params: AdminPostsParams = {}): Promise<BlogPostApiResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status_filter) queryParams.append('status_filter', params.status_filter);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.search) queryParams.append('search', params.search);
    if (params.include_deleted !== undefined) queryParams.append('include_deleted', params.include_deleted.toString());

    const url = `${getApiUrl(this.adminBaseUrl)}/posts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await authService.authenticatedFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener artículos' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get admin blog post by ID
   */
  async getAdminPostById(postId: string, includeDeleted: boolean = false): Promise<BlogPostDetail> {
    const queryParams = new URLSearchParams();
    if (includeDeleted) queryParams.append('include_deleted', 'true');

    const url = `${getApiUrl(this.adminBaseUrl)}/posts/${postId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await authService.authenticatedFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Artículo no encontrado');
      }
      const error = await response.json().catch(() => ({ message: 'Error al obtener el artículo' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create new blog post
   */
  async createPost(data: CreatePostData): Promise<BlogPostDetail> {
    const url = `${getApiUrl(this.adminBaseUrl)}/posts`;
    
    const response = await authService.authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear el artículo' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Update blog post
   */
  async updatePost(postId: string, data: UpdatePostData): Promise<BlogPostDetail> {
    const url = `${getApiUrl(this.adminBaseUrl)}/posts/${postId}`;
    
    const response = await authService.authenticatedFetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar el artículo' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delete blog post (soft delete)
   */
  async deletePost(postId: string): Promise<{ success: boolean; message: string }> {
    const url = `${getApiUrl(this.adminBaseUrl)}/posts/${postId}`;
    
    const response = await authService.authenticatedFetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar el artículo' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get admin blog categories
   */
  async getAdminCategories(includeDeleted: boolean = false): Promise<BlogCategory[]> {
    const queryParams = new URLSearchParams();
    if (includeDeleted) queryParams.append('include_deleted', 'true');

    const url = `${getApiUrl(this.adminBaseUrl)}/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await authService.authenticatedFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener categorías' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get admin blog category by ID
   */
  async getAdminCategoryById(categoryId: string, includeDeleted: boolean = false): Promise<BlogCategory> {
    const queryParams = new URLSearchParams();
    if (includeDeleted) queryParams.append('include_deleted', 'true');

    const url = `${getApiUrl(this.adminBaseUrl)}/categories/${categoryId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await authService.authenticatedFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Categoría no encontrada');
      }
      const error = await response.json().catch(() => ({ message: 'Error al obtener la categoría' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create new blog category
   */
  async createCategory(data: CreateCategoryData): Promise<BlogCategory> {
    const url = `${getApiUrl(this.adminBaseUrl)}/categories`;
    
    const response = await authService.authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear la categoría' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Update blog category
   */
  async updateCategory(categoryId: string, data: UpdateCategoryData): Promise<BlogCategory> {
    const url = `${getApiUrl(this.adminBaseUrl)}/categories/${categoryId}`;
    
    const response = await authService.authenticatedFetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar la categoría' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delete blog category (soft delete)
   */
  async deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }> {
    const url = `${getApiUrl(this.adminBaseUrl)}/categories/${categoryId}`;
    
    const response = await authService.authenticatedFetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar la categoría' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Upload image for blog post
   */
  async uploadPostImage(
    postId: string,
    file: File,
    description?: string,
    imageCode?: string
  ): Promise<{ success: boolean; message: string; image_id: string; image_code: string; image_url: string }> {
    const url = `${getApiUrl(this.adminBaseUrl)}/posts/${postId}/images`;
    
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (imageCode) formData.append('image_code', imageCode);

    const response = await authService.authenticatedFetch(url, {
      method: 'POST',
      // NO incluir Content-Type, el navegador lo establece automáticamente con el boundary
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al subir la imagen' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get images for a blog post
   */
  async getPostImages(postId: string): Promise<BlogImagesResponse> {
    const url = `${getApiUrl(this.adminBaseUrl)}/posts/${postId}/images`;
    
    const response = await authService.authenticatedFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener las imágenes' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delete blog image
   */
  async deleteImage(imageId: string): Promise<void> {
    const url = `${getApiUrl(this.adminBaseUrl)}/images/${imageId}`;
    
    const response = await authService.authenticatedFetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar la imagen' }));
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    }
  }
}

// Export singleton instance
export const blogService = new BlogService();
export default blogService;

