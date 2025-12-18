import React, { useState, useEffect } from 'react';

// Components
import { HeroSection } from '../components/Hero/HeroSection';
import { WhyUsSection } from '../components/WhyUs';
import { CategoriesSection } from '../components/Categories';
import { TestimonialsSection } from '../components/Testimonials';
import { FlashOffersSection } from '../components/FlashOffers/FlashOffersSection';
import { BrandsSection } from '../components/Brands/BrandsSection';
import { CartModal } from '../components/Cart/CartModal';
import FeaturedBlogPosts from '../components/Blog/FeaturedBlogPosts';
import { ContactUsSection } from '../components/ContactUs/ContactUsSection';

// Skeleton Components
import { 
  HeroSkeleton, 
  SectionSkeleton, 
  BlogPostSkeleton 
} from '../components/Skeleton';

// Hooks
import { useHomeCache } from '../hooks/usePageCache';
import { useFeaturedProductsQuery, useOfferProductsQuery } from '../hooks/queries/useProductsQueries';

const HomePage: React.FC = () => {
  const [cartModalOpen, setCartModalOpen] = useState(false);
  // Prefetch de datos clave con React Query
  const { data: featuredProducts, status: statusFeatured } = useFeaturedProductsQuery(8);
  const { data: offerProducts, status: statusOffers } = useOfferProductsQuery(8);
  
  // Usar caché para estado de loading
  const { cachedData: cachedLoadingState, setCachedData: setCachedLoadingState } = useHomeCache(
    'loading-states',
    { version: '1.0' }
  );

  // Loading states for different sections
  const [loadingStates, setLoadingStates] = useState<{
    hero: boolean;
    whyUs: boolean;
    categories: boolean;
    stats: boolean;
    testimonials: boolean;
    flashOffers: boolean;
    products: boolean;
    blog: boolean;
    brands: boolean;
    contact: boolean;
  }>(
    cachedLoadingState || {
      hero: true,
      whyUs: true,
      categories: true,
      stats: true,
      testimonials: true,
      flashOffers: true,
      products: true,
      blog: true,
      brands: true,
      contact: true
    }
  );

  // Simulate realistic loading times for different sections
  useEffect(() => {
    // Si hay caché, usar tiempos más cortos
    const hasCache = !!cachedLoadingState;
    const baseDelay = hasCache ? 100 : 800;
    const increment = hasCache ? 50 : 200;

    const loadingSims = [
      { section: 'hero', delay: baseDelay },
      { section: 'whyUs', delay: baseDelay + increment },
      { section: 'brands', delay: baseDelay + increment * 1.5 },
      { section: 'categories', delay: baseDelay + increment * 2 },
      { section: 'stats', delay: baseDelay + increment * 3 },
      { section: 'testimonials', delay: baseDelay + increment * 4 },
      { section: 'flashOffers', delay: baseDelay + increment * 5 },
      { section: 'blog', delay: baseDelay + increment * 6 },
      { section: 'products', delay: baseDelay + increment * 7 },
      { section: 'contact', delay: baseDelay + increment * 8 }
    ];

    loadingSims.forEach(({ section, delay }) => {
      setTimeout(() => {
        setLoadingStates((prev) => {
          const newState = {
            ...prev,
            [section]: false
          };
          // Guardar en caché el estado final
          if (Object.values(newState).every(val => !val)) {
            setCachedLoadingState(newState, 10 * 60 * 1000); // 10 minutos
          }
          return newState;
        });
      }, delay);
    });
  }, []);


  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section with Skeleton */}
      {loadingStates.hero ? (
        <HeroSkeleton />
      ) : (
        <HeroSection />
      )}

      {/* Why Us Section with Skeleton */}
      {loadingStates.whyUs ? (
        <SectionSkeleton 
          showTitle={true}
          className="bg-gradient-to-br from-gray-50 to-blue-50"
        />
      ) : (
        <WhyUsSection />
      )}

      {/* Brands Section with Skeleton */}
      {loadingStates.brands ? (
        <SectionSkeleton 
          showTitle={true} 
          itemsCount={6} 
          itemsPerRow={6} 
          className="bg-white" 
        />
      ) : (
        <BrandsSection />
      )}

      {/* Categories Section with Skeleton */}
      {loadingStates.categories ? (
        <SectionSkeleton 
          showTitle={true} 
          itemsCount={12} 
          itemsPerRow={4} 
          className="bg-white" 
        />
      ) : (
        <CategoriesSection />
      )}

      {/* Testimonials Section with Skeleton */}
      {loadingStates.testimonials ? (
        <SectionSkeleton 
          showTitle={true} 
          itemsCount={3} 
          itemsPerRow={3} 
          className="bg-white" 
        />
      ) : (
        <TestimonialsSection />
      )}

      <main className="flex-1">
        {/* Flash Offers Section with Skeleton */}
        {loadingStates.flashOffers ? (
          <SectionSkeleton 
            showTitle={true} 
            itemsCount={4} 
            itemsPerRow={4} 
            className="bg-gradient-to-br from-red-50 to-orange-100" 
          />
        ) : (
          <FlashOffersSection
            maxItems={6}
            refreshInterval={1000}
            className="animate-fade-in"
          />
        )}

        {/* Blog Section with Skeleton */}
        {loadingStates.blog ? (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="h-10 bg-gray-300 rounded w-96 mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded w-[500px] mx-auto animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, index) => (
                  <BlogPostSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <FeaturedBlogPosts />
        )}

        {/* Contact Us Section with Skeleton */}
        {loadingStates.contact ? (
          <SectionSkeleton 
            showTitle={true}
            className="bg-gray-50"
          />
        ) : (
          <ContactUsSection />
        )}

      </main>

      {/* Shopping Cart Modal */}
      <CartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
      />
    </div>
  );
};

export default HomePage; 