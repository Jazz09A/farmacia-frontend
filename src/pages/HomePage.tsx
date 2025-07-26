import React, { useState, useEffect } from 'react';

// Components
import { HeroSection } from '../components/Hero/HeroSection';
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
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';
import { getProductsPaginated } from '../data/products';

const HomePage: React.FC = () => {
  const cart = useCart();
  const currency = useCurrency();

  // Loading states for different sections
  const [loadingStates, setLoadingStates] = useState({
    hero: true,
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
      { section: 'flashOffers', delay: 1200 },
      { section: 'products', delay: 1500 },
      { section: 'blog', delay: 1800 },
      { section: 'brands', delay: 2000 },
      { section: 'contact', delay: 2200 }
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
  const handleAddToCart = (productId: string, quantity: number = 1) => {
   console.log(productId, quantity);
  };

  // Wrapper function to match component expectations
  const formatPrice = (priceVES: number, priceREF: number) => {
    return currency.formatPrice(
      currency.currency === 'VES' ? priceVES : priceREF, 
      currency.currency
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section with Skeleton */}
      {loadingStates.hero ? (
        <HeroSkeleton />
      ) : (
        <HeroSection />
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
            currency={currency.currency}
            onAddToCart={handleAddToCart}
            formatPrice={formatPrice}
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
            currency={currency.currency}
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
        isOpen={cart.isOpen}
        onClose={() => cart.setIsOpen(false)}
        items={cart.items}
        currency={currency.currency}
        formatPrice={formatPrice}
        totalPrice={cart.totalPrice(currency.currency)}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
      />
    </div>
  );
};

export default HomePage; 