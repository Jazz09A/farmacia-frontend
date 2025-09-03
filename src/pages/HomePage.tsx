import React, { useState, useEffect } from 'react';

// Components
import { HeroSection } from '../components/Hero/HeroSection';
import { WhyUsSection } from '../components/WhyUs';
import { CategoriesSection } from '../components/Categories';
import { StatsSection } from '../components/Stats';
import { TestimonialsSection } from '../components/Testimonials';
import { FlashOffersSection } from '../components/FlashOffers/FlashOffersSection';
import { ProductsSection } from '../components/Products/ProductsSection';
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

import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import { Cart, Product } from '../types';
import { useCart } from '../contexts/CartContext';

const HomePage: React.FC = () => {
  const { currency, formatPrice: globalFormatPrice } = useGlobalCurrency();
  const { addToCart } = useCart();
  const [cartModalOpen, setCartModalOpen] = useState(false);
  // Loading states for different sections
  const [loadingStates, setLoadingStates] = useState({
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
  });

  // Simulate realistic loading times for different sections
  useEffect(() => {
    const loadingSims = [
      { section: 'hero', delay: 800 },
      { section: 'whyUs', delay: 1000 },
      { section: 'brands', delay: 1200 },
      { section: 'categories', delay: 1400 },
      { section: 'stats', delay: 1600 },
      { section: 'testimonials', delay: 1800 },
      { section: 'flashOffers', delay: 2000 },
      { section: 'blog', delay: 2300 },
      { section: 'products', delay: 2600 },
      { section: 'contact', delay: 2800 }
    ];

    loadingSims.forEach(({ section, delay }) => {
      setTimeout(() => {
        setLoadingStates(prev => ({
          ...prev,
          [section]: false
        }));
      }, delay);
    });
  }, []);

  // Handle add to cart
  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    try {
      await addToCart(product.id, quantity);
      // Optionally show a success notification
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      // Optionally show an error notification
    }
  };

  // Wrapper function to match component expectations
  const formatPrice = (priceVES: number, priceREF: number) => {
    return currency === 'VES' 
      ? `Bs. ${priceVES.toLocaleString('es-VE')}` 
      : `$ ${priceREF.toFixed(2)}`;
  };

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

      {/* Stats Section with Skeleton */}
      {loadingStates.stats ? (
        <SectionSkeleton 
          showTitle={false} 
          itemsCount={4} 
          itemsPerRow={4} 
          className="bg-gradient-to-br from-medical-blue-50 to-medical-green-50" 
        />
      ) : (
        <StatsSection />
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

        {/* Products Section with Skeleton */}
        {loadingStates.products ? (
          <SectionSkeleton 
            showTitle={true} 
            itemsCount={8} 
            itemsPerRow={4} 
            className="bg-gray-50" 
          />
        ) : (
          <ProductsSection
            currency={currency as 'VES' | 'USD' | 'REF'}
            onAddToCart={handleAddToCart}
            formatPrice={formatPrice}
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
        currency={currency as 'VES' | 'REF'}
        formatPrice={formatPrice}
        totalPrice={0} // Cart state is now managed by CartContext, so this will be updated automatically
        onUpdateQuantity={() => {}}
        onRemoveItem={() => {}}
      />
    </div>
  );
};

export default HomePage; 