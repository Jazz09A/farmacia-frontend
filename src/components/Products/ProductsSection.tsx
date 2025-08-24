import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '../../types/index';

interface ProductsSectionProps {
  currency: 'VES' | 'USD' | 'REF';
  onAddToCart: (product: Product, quantity: number) => void;
  formatPrice: (priceVES: number, priceREF: number) => string;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  currency,
  onAddToCart,
  formatPrice
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['Todos', 'Analgésicos', 'Vitaminas', 'Antiinflamatorios', 'Cuidado Personal', 'Medicamentos'];
  
  const filteredProducts = selectedCategory === 'Todos' 
    ? [] 
    : [];

  return (
    <section className="py-16 bg-gray-50" data-section="products" id="products-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Catálogo Farmacéutico
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Medicamentos certificados y productos farmacéuticos para tu farmacia
          </p>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          className="flex flex-col lg:flex-row justify-between items-center mb-8 space-y-4 lg:space-y-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {/* Category Filters */}
          <div className="flex flex-wrap items-center space-x-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
          layout
        >
          {filteredProducts.map((product: Product, index: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              layout
            >
              <ProductCard
                product={product}
                currency={currency}
                formatPrice={formatPrice}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Load More */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Cargar Más Productos
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};