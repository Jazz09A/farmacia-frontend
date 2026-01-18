import { BlogPost } from '../types';

export const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Innovaciones en Farmacología: Nuevos Tratamientos para la Hipertensión',
    slug: 'innovaciones-farmacologia-hipertension',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.`,
    excerpt: 'Explora las últimas innovaciones farmacológicas en el tratamiento de la hipertensión arterial, incluyendo nuevos medicamentos y terapias combinadas que están revolucionando la medicina cardiovascular.',
    author: 'Dr. Carlos Mendoza',
    category: 'Farmacología',
    tags: ['hipertensión', 'cardiología', 'innovación', 'medicamentos'],
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    published: true,
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    createdAt: new Date('2024-01-14T14:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    readTime: 8,
  },
  {
    id: '2',
    title: 'Guía Completa de Medicamentos para el Manejo del Dolor Crónico',
    slug: 'guia-medicamentos-dolor-cronico',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.`,
    excerpt: 'Una guía exhaustiva sobre los diferentes tipos de medicamentos utilizados para el manejo del dolor crónico, incluyendo opioides, antiinflamatorios y terapias alternativas.',
    author: 'Dra. María González',
    category: 'Dolor y Analgesia',
    tags: ['dolor crónico', 'analgesia', 'opioides', 'antiinflamatorios'],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    published: true,
    publishedAt: new Date('2024-01-10T14:30:00Z'),
    createdAt: new Date('2024-01-09T09:00:00Z'),
    updatedAt: new Date('2024-01-10T14:30:00Z'),
    readTime: 12,
  },
  {
    id: '3',
    title: 'Interacciones Medicamentosas: Lo que Todo Farmacéutico Debe Saber',
    slug: 'interacciones-medicamentosas-farmacia',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.`,
    excerpt: 'Conoce las interacciones medicamentosas más comunes y cómo identificarlas para brindar un mejor asesoramiento farmacéutico a tus pacientes.',
    author: 'Dr. Roberto Silva',
    category: 'Farmacia Clínica',
    tags: ['interacciones', 'farmacia clínica', 'seguridad', 'asesoramiento'],
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    published: true,
    publishedAt: new Date('2024-01-05T16:00:00Z'),
    createdAt: new Date('2024-01-04T11:00:00Z'),
    updatedAt: new Date('2024-01-05T16:00:00Z'),
    readTime: 10,
  },
  {
    id: '4',
    title: 'Tecnología en Farmacia: Sistemas de Gestión y Automatización',
    slug: 'tecnologia-farmacia-gestion-automatizacion',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.`,
    excerpt: 'Descubre cómo la tecnología está transformando la gestión farmacéutica moderna, desde sistemas de inventario hasta dispensación automatizada.',
    author: 'Ing. Patricia López',
    category: 'Tecnología Farmacéutica',
    tags: ['tecnología', 'automatización', 'gestión', 'innovación'],
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    published: true,
    publishedAt: new Date('2024-01-01T09:00:00Z'),
    createdAt: new Date('2023-12-30T15:00:00Z'),
    updatedAt: new Date('2024-01-01T09:00:00Z'),
    readTime: 7,
  },
  {
    id: '5',
    title: 'Nutraceuticos: La Frontera entre Alimento y Medicamento',
    slug: 'nutraceuticos-frontera-alimento-medicamento',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.`,
    excerpt: 'Explora el mundo de los nutraceuticos y su creciente importancia en la prevención y tratamiento de diversas condiciones de salud.',
    author: 'Dra. Ana Martínez',
    category: 'Nutraceuticos',
    tags: ['nutraceuticos', 'prevención', 'salud', 'alimentación'],
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    published: true,
    publishedAt: new Date('2023-12-28T12:00:00Z'),
    createdAt: new Date('2023-12-27T10:00:00Z'),
    updatedAt: new Date('2023-12-28T12:00:00Z'),
    readTime: 9,
  },
  {
    id: '6',
    title: 'Regulación Farmacéutica en Venezuela: Actualizaciones 2024',
    slug: 'regulacion-farmaceutica-venezuela-2024',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.`,
    excerpt: 'Mantente actualizado con las últimas regulaciones farmacéuticas en Venezuela y cómo afectan a la práctica profesional.',
    author: 'Dr. Luis Herrera',
    category: 'Regulación',
    tags: ['regulación', 'Venezuela', 'legislación', 'farmacia'],
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    published: true,
    publishedAt: new Date('2023-12-25T08:00:00Z'),
    createdAt: new Date('2023-12-24T14:00:00Z'),
    updatedAt: new Date('2023-12-25T08:00:00Z'),
    readTime: 6,
  }
]; 