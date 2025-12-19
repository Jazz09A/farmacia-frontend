import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  Facebook, 
  Linkedin, 
  Instagram
} from 'lucide-react';

export const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' }
  ];

  const quickLinks = [
    { label: 'Por que nosotros', href: '/why-us' },
    { label: 'Catálogo', href: '/catalog' },
    { label: 'Convertirse en cliente', href: '/cliente-drozainka' },
    { label: 'Quieres ser proveedor', href: '/proveedor-drozainka' },
    { label: 'Blog', href: '/blog' }
  ];

  const customerService = [
    { label: 'Términos Comerciales y Política de Devoluciones B2B.', href: '/terminos-y-condiciones' },
    { label: 'Política de Privacidad.', href: '/politica-de-privacidad' },
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
              <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-green-200">
                Grupo Drozainka
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Distribuidor líder de productos nutraceuticos y farmacéuticos en Venezuela.
                Suministramos productos certificados a farmacias con la más alta calidad y confiabilida.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-blue-100">
                <Phone className="h-5 w-5 text-blue-300" />
                <a href="tel:+584241806018" className="hover:text-white transition-colors">+58 424 180 6018</a>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <Mail className="h-5 w-5 text-blue-300" />
                <a href="mailto:info@grupodrozainka.com" className="hover:text-white transition-colors">info@grupodrozainka.com</a>
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
                  target="_blank"
                  rel="noopener noreferrer"
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
                  <Link to={link.href} className="text-blue-100 hover:text-white transition-colors hover:underline">
                    {link.label}
                  </Link>
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
                  <Link
                    to={service.href}
                    className="text-blue-100 hover:text-white transition-colors hover:underline"
                  >
                    {service.label}
                  </Link>
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
              Recibe promociones comerciales y actualizaciones de nuestra empresa
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