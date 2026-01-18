import React from 'react';
import { motion } from 'framer-motion';
import { 
  Pill,
  Brain,
  Heart, 
  Shield,
  Bone,
  Sparkles,
  User,
  Flower2,
  Scale,
  Award,
  Package,
  Leaf,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CategoriesSection: React.FC = () => {
  const navigate = useNavigate();
  const categories = [
    {
      icon: Brain,
      title: 'Sistema Nervioso',
      description: 'Productos para el cuidado y bienestar del sistema nervioso',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:bg-purple-100'
    },
    {
      icon: Heart,
      title: 'Salud Cardiovascular',
      description: 'Nutraceuticos para el cuidado del corazón y sistema circulatorio',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      hoverColor: 'hover:bg-red-100'
    },
    {
      icon: Shield,
      title: 'Sistema Inmunológico',
      description: 'Refuerza tus defensas naturales con productos de alta calidad',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      icon: Bone,
      title: 'Sistema Osteoarticular',
      description: 'Cuidado de huesos, articulaciones y movilidad',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hoverColor: 'hover:bg-orange-100'
    },
    {
      icon: Sparkles,
      title: 'Bienestar General',
      description: 'Productos para mejorar tu salud y calidad de vida',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      hoverColor: 'hover:bg-yellow-100'
    },
    {
      icon: User,
      title: 'Salud Masculina',
      description: 'Especializados en el bienestar y salud del hombre',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      hoverColor: 'hover:bg-indigo-100'
    },
    {
      icon: Flower2,
      title: 'Salud Femenina',
      description: 'Cuidado integral para la salud y bienestar de la mujer',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      hoverColor: 'hover:bg-pink-100'
    },
    {
      icon: Scale,
      title: 'Pérdida de Peso',
      description: 'Productos naturales para apoyo en el control de peso',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100'
    },
  ];

  const brands = [
    {
      name: 'BY NATURLIFES',
      description: '16 categorías especializadas',
      icon: Leaf,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100',
      hoverBorderColor: 'group-hover:border-green-300',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      name: 'NUVITT',
      description: '8 categorías de bienestar',
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      hoverBorderColor: 'group-hover:border-blue-300',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      name: 'DULCILINA',
      description: 'Alimentación saludable',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:bg-purple-100',
      hoverBorderColor: 'group-hover:border-purple-300',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      name: 'FITOSANA',
      description: 'Productos naturales',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hoverColor: 'hover:bg-orange-100',
      hoverBorderColor: 'group-hover:border-orange-300',
      gradient: 'from-orange-500 to-amber-600'
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="medical-container">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-medical-blue-100 text-medical-blue-700 px-6 py-3 rounded-full text-sm font-semibold mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Pill className="w-5 h-5" />
            <span>Nuestras Categorías</span>
          </motion.div>
          
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Especialidades{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-blue-600 to-medical-green-600">
              Farmacéuticas
            </span>
          </motion.h2>
          
          <motion.p
            className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
             Cubrimos muchas especialidades médicas con productos nutraceuticos 
             y farmacéuticos de la más alta calidad para tu farmacia.
          </motion.p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          {categories.map((category, index) => (
            <motion.button
              key={index}
              className={`group p-6 rounded-2xl border-2 ${category.bgColor} ${category.borderColor} ${category.hoverColor} transition-all duration-300 text-left w-full`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-xl ${category.bgColor} ${category.borderColor} border group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className={`w-8 h-8 ${category.color}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-medical-blue-50 to-medical-green-50 border border-medical-blue-200 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿No encuentras lo que buscas?
            </h3>
            <p className="text-gray-600 mb-6">
              Tenemos acceso a más de 1.000 productos nutraceuticos y farmacéuticos. 
              Contáctanos para consultas especializadas y pedidos personalizados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="btn-medical-primary px-8 py-3 text-base font-semibold"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('https://wa.me/584241806018?text=Quiero%20consultar%20disponibilidad%20de%20productos', '_blank')}
              >
                📞 Consultar Disponibilidad
              </motion.button>
              <motion.button
                className="btn-medical-secondary px-8 py-3 text-base font-semibold border-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate('/catalog');
                }}
              >
                📋 Ver Catálogo Completo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
