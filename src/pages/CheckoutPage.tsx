import React, { useEffect, useState } from 'react';
import { useCurrency } from '../hooks/useCurrency';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, User, Building, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import { Cart } from '../types';
import { authService } from '../services/AuthService';

const steps = [
  { id: 'user', name: 'Identificación', icon: User },
  { id: 'shipping', name: 'Envío', icon: MapPin },
  { id: 'payment', name: 'Pago', icon: CreditCard },
  { id: 'confirm', name: 'Confirmar', icon: ShieldCheck },
];

const CheckoutPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const userType = 'juridico'; // Solo usuarios jurídicos

  const [cart, setCart] = useState<Cart | null>(null);
  const { formatPrice } = useCurrency();

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0));

  useEffect(() => {
    authService.getCart().then((cart: any) => {
      setCart(cart.data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-medical-gray-50 pt-32">
      <div className="medical-container">
        <h1 className="text-4xl font-bold text-medical-gray-900 mb-4">Finalizar Compra</h1>
        <p className="text-lg text-medical-gray-600 mb-8">Sigue los pasos para completar tu pedido de forma segura.</p>

        {/* Stepper */}
        <div className="mb-12">
          <ol className="flex items-center w-full">
            {steps.map((step, index) => (
              <li key={step.id} className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:inline-block" : ''}`}>
                <span className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${currentStep >= index ? 'bg-medical-primary text-white' : 'bg-medical-gray-200 text-medical-gray-500'}`}>
                  <step.icon className="w-5 h-5" />
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form Steps */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">1. Información de Farmacia</h2>
                    <div className="flex items-center gap-2 p-4 rounded-xl border-2 border-medical-primary bg-medical-blue-50 mb-6">
                      <Building className="text-medical-primary" />
                      <span className="font-medium">Persona Jurídica (Farmacia)</span>
                    </div>
                    
                    <form className="space-y-4">
                      <input type="text" placeholder="Razón Social" className="w-full p-3 border-gray-300 rounded-lg" />
                      <input type="text" placeholder="RIF (J-12345678-9)" className="w-full p-3 border-gray-300 rounded-lg" />
                      <input type="text" placeholder="Nombre del Contacto" className="w-full p-3 border-gray-300 rounded-lg" />
                      <input type="text" placeholder="Cédula de Identidad" className="w-full p-3 border-gray-300 rounded-lg" />
                      <input type="email" placeholder="Correo Electrónico" className="w-full p-3 border-gray-300 rounded-lg" />
                      <input type="tel" placeholder="Teléfono" className="w-full p-3 border-gray-300 rounded-lg" />
                    </form>
                  </div>
                )}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">2. Dirección de Envío</h2>
                    <form className="space-y-4">
                      <select className="w-full p-3 border-gray-300 rounded-lg">
                        {shippingZones.map(zone => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
                      </select>
                      <input type="text" placeholder="Dirección Completa (Calle, Edificio, Apartamento)" className="w-full p-3 border-gray-300 rounded-lg" />
                      <textarea placeholder="Punto de referencia o instrucciones adicionales" className="w-full p-3 border-gray-300 rounded-lg" rows={3}></textarea>
                    </form>
                  </div>
                )}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">3. Método de Pago</h2>
                    <div className="space-y-4">
                      {paymentMethods.map(method => (
                        <label key={method.id} className="flex items-center p-4 rounded-xl border-2 border-gray-200 has-[:checked]:border-medical-primary has-[:checked]:bg-medical-blue-50">
                          <input type="radio" name="payment" className="h-5 w-5 text-medical-primary focus:ring-medical-primary"/>
                          <div className="ml-4">
                            <p className="font-semibold">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">4. Confirmar Pedido</h2>
                    <p>Revisa tu pedido antes de confirmar.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-between">
              <button onClick={prevStep} disabled={currentStep === 0} className="flex items-center gap-2 px-6 py-3 disabled:opacity-50">
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
              {currentStep < steps.length - 1 ? (
                <button onClick={nextStep} className="flex items-center gap-2 px-6 py-3 bg-medical-primary text-white rounded-xl">
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button className="flex items-center gap-2 px-6 py-3 bg-medical-accent text-white rounded-xl">
                  Confirmar Pedido <ShieldCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-soft sticky top-28">
              <h3 className="text-xl font-bold text-medical-gray-800 border-b pb-3 mb-4">Resumen del Pedido</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {cart?.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold line-clamp-1">{item.product.name}</p>
                        <p className="text-gray-500">Cant: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold">{formatPrice(item.product.price_ves * item.quantity, 'VES')}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-medical-gray-700 border-t mt-4 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(cart?.total_ves || 0, 'VES')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className="font-semibold">Calculado en el siguiente paso</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-medical-gray-900 border-t pt-3 mt-3">
                  <span>Total</span>
                  <span>{formatPrice(cart?.total_ves || 0, 'VES')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 