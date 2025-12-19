import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  Clock, 
  Truck, 
  Award, 
  Users, 
  Heart,
  Star,
  CheckCircle,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Globe,
  Zap,
  Target,
  TrendingUp,
  Building2,
  Leaf,
  HandHeart,
  Quote,
  Camera,
  Video,
  Download,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContactForm } from '../components/ContactUs/ContactForm';

const WhyUsPage: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeProcessStep, setActiveProcessStep] = useState(0);

  // Image carousel data
  const facilityImages = [
    {
      src: '/images-local/establecimiento_Drozainka.webp',
      title: 'Nuestras Instalaciones',
      description: 'Instalaciones modernas y equipadas para la distribución farmacéutica'
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'Dr. María González',
      role: 'Farmacéutica Propietaria',
      location: 'Caracas, Venezuela',
      quote: 'Grupo Drozainka ha transformado la forma en que gestiono mi inventario. Su servicio 24/7 es invaluable y la calidad de sus productos es insuperable.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 5,
      video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    },
    {
      id: 2,
      name: 'Dr. Carlos Mendoza',
      role: 'Director Farmacéutico',
      location: 'Valencia, Venezuela',
      quote: 'La confiabilidad en las entregas y la asesoría técnica especializada nos han permitido crecer un 40% en ventas este año.',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 5,
      video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4'
    },
    {
      id: 3,
      name: 'Dra. Ana Rodríguez',
      role: 'Gerente de Farmacia',
      location: 'Maracaibo, Venezuela',
      quote: 'El soporte técnico y la rapidez en las entregas nos han convertido en la farmacia de referencia en nuestra zona.',
      image: 'https://images.unsplash.com/photo-1594824388852-8a0b1b0b0b0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 5,
      video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4'
    }
  ];

  // Process steps data
  const processSteps = [
    {
      step: 1,
      title: 'Análisis de Necesidades',
      description: 'Evaluamos tu inventario actual y identificamos oportunidades de mejora',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      step: 2,
      title: 'Propuesta Personalizada',
      description: 'Diseñamos un plan de suministro adaptado a tu farmacia',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      step: 3,
      title: 'Implementación',
      description: 'Ejecutamos el plan con seguimiento continuo y ajustes',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      step: 4,
      title: 'Seguimiento y Optimización',
      description: 'Monitoreamos resultados y optimizamos continuamente',
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  // Team members data
  const teamMembers = [
    {
      name: 'Dr. Roberto Drozainka',
      role: 'CEO & Fundador',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      experience: '20+ años',
      specialty: 'Distribución Farmacéutica'
    },
    {
      name: 'Dra. Carmen Herrera',
      role: 'Directora Médica',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      experience: '15+ años',
      specialty: 'Farmacología Clínica'
    },
    {
      name: 'Ing. Miguel Torres',
      role: 'Director de Operaciones',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      experience: '12+ años',
      specialty: 'Logística Farmacéutica'
    },
    {
      name: 'Lic. Patricia Vega',
      role: 'Directora Comercial',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      experience: '10+ años',
      specialty: 'Desarrollo de Negocios'
    }
  ];

  // Certifications data
  const certifications = [
    {
      name: 'ISO 9001:2015',
      description: 'Sistema de Gestión de Calidad',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      year: '2020'
    },
    {
      name: 'Buenas Prácticas de Almacenamiento',
      description: 'Certificación BPA',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      year: '2021'
    },
    {
      name: 'Registro Sanitario',
      description: 'Autorización INVIMA',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      year: '2019'
    },
    {
      name: 'Certificación Ambiental',
      description: 'ISO 14001:2015',
      image: 'https://images.unsplash.com/photo-1569163139394-de4466c0e3b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      year: '2022'
    }
  ];

  // Auto-advance carousel (solo si hay más de una imagen)
  useEffect(() => {
    if (facilityImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % facilityImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [facilityImages.length]);

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % facilityImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + facilityImages.length) % facilityImages.length);
  };

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full bg-gradient-to-br from-medical-blue-600 to-medical-blue-800">
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </div>
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
              <Shield className="w-5 h-5" />
              <span>¿Por qué elegirnos?</span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-bold leading-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Tu socio estratégico en{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                distribución farmacéutica
              </span>
            </motion.h1>

            <motion.p
              className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Con más de 15 años de experiencia, somos el distribuidor farmacéutico 
              más confiable de Venezuela, comprometidos con la excelencia y la 
              innovación en cada entrega.
            </motion.p>

            {/* Video Play Button */}
            <motion.div
              className="flex justify-center mb-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <motion.button
                className="group relative w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  {isVideoPlaying ? (
                    <Pause className="w-6 h-6 text-medical-blue-600 ml-0.5" />
                  ) : (
                    <Play className="w-6 h-6 text-medical-blue-600 ml-1" />
                  )}
                </div>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              {[
                { number: '1200+', label: 'Farmacias Satisfechas' },
                { number: '15+', label: 'Años de Experiencia' },
                { number: '24/7', label: 'Servicio Disponible' },
                { number: '99.8%', label: 'Tiempo de Entrega' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 + index * 0.1 }}
                >
                  <motion.div
                    className="text-3xl lg:text-4xl font-bold text-white mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15, delay: 1.3 + index * 0.1 }}
                  >
                    {stat.number}
                  </motion.div>
                  <p className="text-white/80 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* Facilities Carousel Section */}
      <section className="py-24 bg-white">
        <div className="medical-container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nuestras <span className="text-medical-blue-600">Instalaciones</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conoce las instalaciones de vanguardia que nos permiten ofrecer 
              el mejor servicio de distribución farmacéutica del país.
            </p>
          </motion.div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              {facilityImages.length > 0 && facilityImages[currentImageIndex] ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    className="relative h-96 lg:h-[500px]"
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img
                      src={facilityImages[currentImageIndex].src}
                      alt={facilityImages[currentImageIndex].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 text-white">
                      <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                        {facilityImages[currentImageIndex].title}
                      </h3>
                      <p className="text-white/90 text-lg">
                        {facilityImages[currentImageIndex].description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="relative h-96 lg:h-[500px] bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No hay imágenes disponibles</p>
                </div>
              )}
            </div>

            {/* Navigation Buttons - Solo mostrar si hay más de una imagen */}
            {facilityImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </>
            )}

            {/* Dots Indicator - Solo mostrar si hay más de una imagen */}
            {facilityImages.length > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {facilityImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? 'bg-medical-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="medical-container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Porque elegir a <span className="text-medical-blue-600">Grupo Drozainka</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un enfoque sistemático y probado que garantiza el éxito de tu farmacia.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  activeProcessStep === index
                    ? `${step.bgColor} ${step.borderColor} shadow-lg scale-105`
                    : 'bg-white border-gray-200 hover:shadow-md'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setActiveProcessStep(index)}
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${step.bgColor} ${step.borderColor} border-2 mb-6`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${step.color} bg-white border-2 ${step.borderColor} text-sm font-bold mb-4`}>
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="medical-container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Lo que dicen nuestros <span className="text-medical-blue-600">clientes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Historias reales de farmacias que han transformado su negocio con nosotros.
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonialIndex}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                {/* Video Section */}
                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <div className="aspect-video bg-gradient-to-br from-medical-blue-600 to-medical-blue-800 flex items-center justify-center">
                      <motion.button
                        className="group relative w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <Play className="w-6 h-6 text-medical-blue-600 ml-1" />
                        </div>
                      </motion.button>
                    </div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-gray-700">Testimonial</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonials[currentTestimonialIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <Quote className="w-12 h-12 text-medical-blue-600 mb-4" />
                  
                  <blockquote className="text-xl lg:text-2xl text-gray-700 leading-relaxed font-medium">
                    "{testimonials[currentTestimonialIndex].quote}"
                  </blockquote>
                  
                  <div className="flex items-center space-x-4 pt-6">
                    <img
                      src={testimonials[currentTestimonialIndex].image}
                      alt={testimonials[currentTestimonialIndex].name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {testimonials[currentTestimonialIndex].name}
                      </h4>
                      <p className="text-medical-blue-600 font-medium">
                        {testimonials[currentTestimonialIndex].role}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {testimonials[currentTestimonialIndex].location}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="medical-container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nuestro <span className="text-medical-green-600">Equipo</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Profesionales altamente capacitados comprometidos con tu éxito.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-medical-blue-600 font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-3">{member.specialty}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{member.experience}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ¿Listo para transformar tu farmacia?
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Únete a las 1200+ farmacias que ya confían en nosotros para su suministro farmacéutico.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>

    </div>
  );
};

export default WhyUsPage;
