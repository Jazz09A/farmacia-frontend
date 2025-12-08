import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService, PublicPostsParams, AdminPostsParams, CreatePostData, UpdatePostData, CreateCategoryData, UpdateCategoryData } from '../../services/BlogService';
import type { BlogPostApiResponse, BlogPostDetail, BlogPostListItem, BlogCategory, BlogImagesResponse } from '../../types';
import { queryKeys } from './queryKeys';

// ===== PUBLIC QUERIES =====

/**
 * Query para obtener posts públicos (paginados)
 */
export const usePublicPostsQuery = (params: PublicPostsParams = {}) => {
  return useQuery<BlogPostApiResponse>({
    queryKey: queryKeys.blog.public.posts(params),
    queryFn: () => blogService.getPublicPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos en cache
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Query para obtener un post público por slug
 */
export const usePublicPostBySlugQuery = (slug: string, enabled: boolean = true) => {
  return useQuery<BlogPostDetail>({
    queryKey: queryKeys.blog.public.post(slug),
    queryFn: () => blogService.getPublicPostBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 60 * 60 * 1000, // 1 hora en cache
    refetchOnWindowFocus: false,
  });
};

/**
 * Query para obtener categorías públicas
 */
export const usePublicCategoriesQuery = () => {
  return useQuery<BlogCategory[]>({
    queryKey: queryKeys.blog.public.categories,
    queryFn: () => blogService.getPublicCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutos (las categorías cambian poco)
    gcTime: 60 * 60 * 1000, // 1 hora en cache
    refetchOnWindowFocus: false,
  });
};

// ===== ADMIN QUERIES =====

/**
 * Query para obtener posts de administrador (paginados, incluye borradores)
 */
export const useAdminPostsQuery = (params: AdminPostsParams = {}) => {
  return useQuery<BlogPostApiResponse>({
    queryKey: queryKeys.blog.admin.posts(params),
    queryFn: () => blogService.getAdminPosts(params),
    staleTime: 2 * 60 * 1000, // 2 minutos (los posts de admin cambian más frecuentemente)
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Query para obtener un post de administrador por ID
 */
export const useAdminPostByIdQuery = (postId: string, includeDeleted: boolean = false, enabled: boolean = true) => {
  return useQuery<BlogPostDetail>({
    queryKey: queryKeys.blog.admin.post(postId),
    queryFn: () => blogService.getAdminPostById(postId, includeDeleted),
    enabled: enabled && !!postId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
    refetchOnWindowFocus: false,
  });
};

/**
 * Query para obtener categorías de administrador
 */
export const useAdminCategoriesQuery = (includeDeleted: boolean = false) => {
  return useQuery<BlogCategory[]>({
    queryKey: queryKeys.blog.admin.categories(includeDeleted),
    queryFn: () => blogService.getAdminCategories(includeDeleted),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos en cache
    refetchOnWindowFocus: false,
  });
};

/**
 * Query para obtener una categoría de administrador por ID
 */
export const useAdminCategoryByIdQuery = (categoryId: string, includeDeleted: boolean = false, enabled: boolean = true) => {
  return useQuery<BlogCategory>({
    queryKey: queryKeys.blog.admin.category(categoryId, includeDeleted),
    queryFn: () => blogService.getAdminCategoryById(categoryId, includeDeleted),
    enabled: enabled && !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos en cache
    refetchOnWindowFocus: false,
  });
};

/**
 * Query para obtener imágenes de un post
 */
export const usePostImagesQuery = (postId: string, enabled: boolean = true) => {
  return useQuery<BlogImagesResponse>({
    queryKey: queryKeys.blog.admin.postImages(postId),
    queryFn: () => blogService.getPostImages(postId),
    enabled: enabled && !!postId,
    staleTime: 1 * 60 * 1000, // 1 minuto (las imágenes pueden cambiar frecuentemente)
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
    refetchOnWindowFocus: false,
  });
};

// ===== MUTATIONS =====

/**
 * Mutation para crear un post
 */
export const useCreatePostMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<BlogPostDetail, Error, CreatePostData>({
    mutationFn: (data) => blogService.createPost(data),
    onSuccess: (newPost) => {
      // Invalidar listas de posts
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.admin.posts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.public.posts() });
      
      // Establecer el nuevo post en cache
      queryClient.setQueryData(queryKeys.blog.admin.post(newPost.id), newPost);
    },
  });
};

/**
 * Mutation para actualizar un post
 */
export const useUpdatePostMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<BlogPostDetail, Error, { postId: string; data: UpdatePostData }>({
    mutationFn: ({ postId, data }) => blogService.updatePost(postId, data),
    onSuccess: (updatedPost) => {
      // Invalidar listas de posts
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.admin.posts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.public.posts() });
      
      // Actualizar el post en cache
      queryClient.setQueryData(queryKeys.blog.admin.post(updatedPost.id), updatedPost);
      
      // Si el slug cambió, invalidar también la query pública por slug
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.public.post(updatedPost.slug) });
    },
  });
};

/**
 * Mutation para eliminar un post
 */
export const useDeletePostMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (postId) => blogService.deletePost(postId),
    onSuccess: (_, postId) => {
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.admin.posts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.public.posts() });
      
      // Remover el post del cache
      queryClient.removeQueries({ queryKey: queryKeys.blog.admin.post(postId) });
    },
  });
};

/**
 * Mutation para crear una categoría
 */
export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<BlogCategory, Error, CreateCategoryData>({
    mutationFn: (data) => blogService.createCategory(data),
    onSuccess: () => {
      // Invalidar listas de categorías
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.admin.categories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.public.categories });
    },
  });
};

/**
 * Mutation para actualizar una categoría
 */
export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<BlogCategory, Error, { categoryId: string; data: UpdateCategoryData }>({
    mutationFn: ({ categoryId, data }) => blogService.updateCategory(categoryId, data),
    onSuccess: (updatedCategory) => {
      // Invalidar listas de categorías
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.admin.categories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.public.categories });
      
      // Actualizar la categoría en cache
      queryClient.setQueryData(queryKeys.blog.admin.category(updatedCategory.id, false), updatedCategory);
    },
  });
};

/**
 * Mutation para eliminar una categoría
 */
export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (categoryId) => blogService.deleteCategory(categoryId),
    onSuccess: (_, categoryId) => {
      // Invalidar listas de categorías
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.admin.categories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.public.categories });
      
      // Remover la categoría del cache
      queryClient.removeQueries({ queryKey: queryKeys.blog.admin.category(categoryId, false) });
    },
  });
};

/**
 * Mutation para subir una imagen a un post
 */
export const useUploadPostImageMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    { success: boolean; message: string; image_id: string; image_code: string; image_url: string },
    Error,
    { postId: string; file: File; description?: string; imageCode?: string }
  >({
    mutationFn: ({ postId, file, description, imageCode }) => 
      blogService.uploadPostImage(postId, file, description, imageCode),
    onSuccess: (_, variables) => {
      // Invalidar las imágenes del post
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.admin.postImages(variables.postId) });
      
      // También invalidar el post para refrescar featured_image_url si es necesario
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.admin.post(variables.postId) });
    },
  });
};

/**
 * Mutation para eliminar una imagen
 */
export const useDeleteImageMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { imageId: string; postId?: string }>({
    mutationFn: ({ imageId }) => blogService.deleteImage(imageId),
    onSuccess: (_, variables) => {
      // Si tenemos el postId, invalidar sus imágenes
      if (variables.postId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.blog.admin.postImages(variables.postId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.blog.admin.post(variables.postId) });
      } else {
        // Si no tenemos postId, invalidar todas las queries de imágenes
        queryClient.invalidateQueries({ queryKey: ['blog', 'admin', 'posts'] });
      }
    },
  });
};

