import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TestimonialsSection: React.FC = () => {
  const navigate = useNavigate();
  const testimonials = [
    {
      name: 'Dr. María González',
      role: 'Farmacéutica - Farmacia San Rafael',
      location: 'Caracas, Venezuela',
      rating: 5,
      quote: 'Grupo Drozainka C.A ha sido nuestro socio estratégico por más de 8 años. Su confiabilidad en el suministro y la calidad de sus productos nos ha permitido brindar un servicio excepcional a nuestros pacientes.',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Lic. Carlos Mendoza',
      role: 'Director - Farmacia del Pueblo',
      location: 'Valencia, Venezuela',
      rating: 5,
      quote: 'La atención 24/7 y la rapidez en las entregas nos han salvado en múltiples emergencias. Su equipo técnico siempre está disponible para asesorarnos en cualquier consulta farmacéutica.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Dra. Ana Rodríguez',
      role: 'Propietaria - Farmacia Central',
      location: 'Maracaibo, Venezuela',
      rating: 5,
      quote: 'Desde que trabajamos con Drozainka, hemos aumentado nuestras ventas en un 40%. Su catálogo completo y precios competitivos nos han dado la ventaja que necesitábamos en el mercado.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    }
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
            <Quote className="w-5 h-5" />
            <span>Testimonios</span>
          </motion.div>
          
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Lo que dicen nuestros{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-blue-600 to-medical-green-600">
              clientes
            </span>
          </motion.h2>
          
          <motion.p
            className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
             Más de 1200 farmacias confían en nosotros. 
             Conoce las experiencias de nuestros clientes satisfechos.
          </motion.p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              {/* Quote Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-medical-blue-100 rounded-full flex items-center justify-center group-hover:bg-medical-blue-200 transition-colors duration-300">
                  <Quote className="w-6 h-6 text-medical-blue-600" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex justify-center mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 text-center mb-8 leading-relaxed italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-medical-blue-600 font-medium">{testimonial.role}</p>
                  <p className="text-xs text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
