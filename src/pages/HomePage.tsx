import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

// Components
import { HeroSection } from '../components/Hero/HeroSection';
import { SearchBar } from '../components/Header/SearchBar';
import { CurrencyToggle } from '../components/Header/CurrencyToggle';
import { FlashOffersSection } from '../components/FlashOffers/FlashOffersSection';
import { ProductsSection } from '../components/Products/ProductsSection';
import { BrandsSection } from '../components/Brands/BrandsSection';
import { CartModal } from '../components/Cart/CartModal';
import FeaturedBlogPosts from '../components/Blog/FeaturedBlogPosts';

// Hooks
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';

// Data
import { mockProducts } from '../data/mockData';

const HomePage: React.FC = () => {
  const cart = useCart();
  const currency = useCurrency();

  // Handle add to cart
  const handleAddToCart = (productId: string, quantity: number = 1) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      cart.addItem(product, quantity);
    }
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
      <HeroSection />
      <main className="flex-1">
        <FlashOffersSection
          currency={currency.currency}
          onAddToCart={handleAddToCart}
          formatPrice={formatPrice}
        />
        <ProductsSection
          currency={currency.currency}
          onAddToCart={handleAddToCart}
          formatPrice={formatPrice}
        />
        <FeaturedBlogPosts />
        <BrandsSection />
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