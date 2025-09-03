import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram
} from 'lucide-react';

export const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' }
  ];

  const quickLinks = [
    'Sobre Nosotros',
    'Servicios de Distribución',
    'Catálogo Farmacéutico',
    'Asesoría Comercial',
    'Promociones B2B',
    'Blog Farmacéutico'
  ];

  const customerService = [
    'Centro de Ayuda Comercial',
    'Política de Devoluciones B2B',
    'Términos Comerciales',
    'Política de Privacidad',
    'Logística y Distribución',
    'Garantía de Productos'
  ];



  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="text-2xl font-bold font-serif mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-green-200">
                Grupo Drozainka
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Distribuidor líder de productos farmacéuticos en Venezuela. 
                Suministramos medicamentos certificados a farmacias con la más alta calidad y confiabilidad.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-blue-100">
                <Phone className="h-5 w-5 text-blue-300" />
                <span>+58 212 555-0123</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <Mail className="h-5 w-5 text-blue-300" />
                <span>info@grupodrozainka.com</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <MapPin className="h-5 w-5 text-blue-300" />
                <span>Caracas, Venezuela</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="p-3 bg-blue-700/30 hover:bg-blue-600/50 rounded-full transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li key={index}>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors hover:underline"
                  >
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Customer Service */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-6">Atención al Cliente</h4>
            <ul className="space-y-3">
              {customerService.map((service, index) => (
                <motion.li key={index}>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors hover:underline"
                  >
                    {service}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-6">Newsletter</h4>
            <p className="text-blue-100 mb-4">
              Recibe promociones comerciales y actualizaciones del sector farmacéutico
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Tu email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
              />
              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Suscribirse
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-blue-700/50 bg-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-blue-200 text-sm">
              © 2025 Grupo Drozainka. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-6 text-sm text-blue-200">
              <span>Distribución de medicamentos certificados</span>
              <span>•</span>
              <span>Suministro confiable para farmacias</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};