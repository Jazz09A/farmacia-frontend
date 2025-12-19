import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Clock, 
  ArrowRight,
  Phone,
  Mail,
  Award,
  Truck
} from 'lucide-react';
import { ContactForm } from '../components/ContactUs/ContactForm';

const ClienteDrozainkaPage: React.FC = () => {

  const values = [
    {
      icon: Award,
      title: 'Expertos en nutracéuticos en Venezuela',
      description: 'Más de 15 años de experiencia especializada en la distribución de nutracéuticos y productos farmacéuticos de alta calidad.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: MapPin,
      title: 'Atención a todos los estados del país',
      description: 'Cobertura nacional con logística especializada que garantiza entregas puntuales en cualquier rincón de Venezuela.',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Clock,
      title: 'Despachos en tiempo récord',
      description: 'Sistema de distribución optimizado que permite entregas en 24-48 horas en las principales ciudades del país.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];


  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Banner Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images-local/establecimiento_Drozainka.webp"
            alt="Establecimiento de Grupo Drozainka"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-medical-blue-600/20 to-medical-blue-800/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 medical-container text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Users className="w-5 h-5" />
              <span>Únete a nuestra red</span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-bold leading-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Conviértete en{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Cliente Drozainka
              </span>
            </motion.h1>

            <motion.p
              className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Únete a la red de farmacias más confiable de Venezuela. 
              Accede a productos de calidad, distribución nacional y 
              el mejor servicio al cliente del sector farmacéutico.
            </motion.p>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.button
                onClick={() => document.getElementById('values-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center text-white/90 hover:text-white font-semibold text-lg group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Descubre por qué somos tu mejor opción
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values-section" className="pt-24 pb-12 bg-white">
        <div className="medical-container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ¿Por qué elegir{' '}
              <span className="text-medical-blue-600">Grupo Drozainka</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre los valores que nos hacen el socio ideal para tu farmacia
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${value.bgColor} ${value.borderColor}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${value.color} text-white mb-6`}>
                    <value.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action para continuar leyendo */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="form-section" className="pt-8 pb-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="medical-container">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-medical-blue-600 text-white">
        <div className="medical-container">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8">
              ¿Tienes preguntas? Contáctanos directamente
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Teléfono</h3>
                <p className="text-white/80">+58 424 180 6018</p>
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-white/80">info@grupodrozainka.com</p>
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Horario</h3>
                <p className="text-white/80">24/7 - Servicio Continuo</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ClienteDrozainkaPage;
