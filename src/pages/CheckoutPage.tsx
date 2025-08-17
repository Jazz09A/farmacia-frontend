import React, { useEffect, useState, useRef } from 'react';
import { useCurrency } from '../hooks/useCurrency';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, User, MapPin, CreditCard, ShieldCheck, UploadCloud, CheckCircle } from 'lucide-react';
import { PaymentMethod, ShippingZone } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/AuthService';
import { useUploadImage } from '../hooks/useUploadImage';

const steps = [
  { id: 'user', name: 'Identificación', icon: User },
  { id: 'shipping', name: 'Envío', icon: MapPin },
  { id: 'payment', name: 'Pago', icon: CreditCard },
  { id: 'confirm', name: 'Confirmar', icon: ShieldCheck },
];

const paymentMethods: PaymentMethod[] = [
  { id: 'pago-movil', name: 'Pago Móvil', description: 'pago en Bs. ', icon: '', available: true, currencies: ['VES'], data: 'Cédula: 1234567890\nTeléfono: 04123456789\nBanco: Banco de Venezuela' },
  { id: 'zelle', name: 'Zelle', description: 'Datos para pago en USD.', icon: '', available: true, currencies: ['REF'], data: 'Correo: zelle@zelle.com' },
  { id: 'efectivo', name: 'Efectivo', description: 'Paga al recibir tu pedido.', icon: '', available: true, currencies: ['VES', 'REF']},
];

interface FormData {
  razonSocial: string;
  rif: string;
  email: string;
  telefono: string;
  shipping_address_id: string;
  customer_notes: string;
  payment_method: string;
  payment_capture_url: string;
}

const CheckoutPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { cart } = useCart();
  const { user, loading: userLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const { uploadImage, isUploading } = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    razonSocial: '',
    rif: '',
    email: '',
    telefono: '',
    shipping_address_id: '',
    customer_notes: '',
    payment_method: 'pago-movil',
    payment_capture_url: '',
  });

  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);

  useEffect(() => {
    authService.getShippingZones().then(shippingData => {
      // La API devuelve el array directamente, así que lo usamos.
      setShippingZones(shippingData);
      
      // Verificamos que el array exista y tenga elementos antes de usarlo.
      if (!formData.shipping_address_id && shippingData && shippingData.length > 0) {
        setFormData(prev => ({ ...prev, shipping_address_id: shippingData[0].id }));
      }
    }).catch(console.error);
  }, [formData.shipping_address_id]);

  useEffect(() => {
    if (user && !userLoading) {
      setFormData(prev => ({
        ...prev,
        razonSocial: user.company_name || prev.razonSocial,
        rif: user.rif || prev.rif,
        email: user.email || prev.email,
        telefono: user.phone || prev.telefono,
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, metodoPago: e.target.value }));
  };
  
  const handleConfirmOrder = () => {
    // Here you would typically send the order to the backend
    console.log('Order confirmed:', { formData, cart });
    alert('Pedido confirmado! Gracias por tu compra.');
    localStorage.removeItem('checkoutFormData');
    // Redirect or clear cart
  };

  const nextStep = () => {
    // Save data on step transition
    localStorage.setItem('checkoutFormData', JSON.stringify(formData));
    setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  };
  
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0));

  const isNextDisabled = currentStep === 2 && 
    (formData.payment_method === 'pago-movil' || formData.payment_method === 'zelle') &&
    !formData.payment_capture_url;

  
  if (userLoading) return <div>Cargando...</div>;

  return (
    <div className="min-h-screen bg-medical-gray-50 pt-32 pb-16">
      <div className="medical-container">
        <h1 className="text-4xl font-bold text-medical-gray-900 mb-4">Finalizar Compra</h1>
        <p className="text-lg text-medical-gray-600 mb-8">Sigue los pasos para completar tu pedido de forma segura.</p>

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
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                {currentStep === 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">1. Información de Farmacia</h2>
                    <form className="space-y-4">
                      <input type="text" name="razonSocial" value={formData.razonSocial} onChange={handleChange} placeholder="Razón Social" className="w-full p-3 border-gray-300 rounded-lg" />
                      <input type="text" name="rif" value={formData.rif} onChange={handleChange} placeholder="RIF" className="w-full p-3 border-gray-300 rounded-lg" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Correo Electrónico" className="w-full p-3 border-gray-300 rounded-lg" />
                      <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono" className="w-full p-3 border-gray-300 rounded-lg" />
                    </form>
                  </div>
                )}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">2. Dirección de Envío</h2>
                    <form className="space-y-4">
                      <select name="shipping_address_id" value={formData.shipping_address_id} onChange={handleChange} className="w-full p-3 border-gray-300 rounded-lg">
                        {shippingZones.map(zone => <option key={zone.id} value={zone.id}>{zone.name} - {formatPrice(zone.price, 'REF')}</option>)}
                      </select>
                      <textarea name="customer_notes" value={formData.customer_notes} onChange={handleChange} placeholder="Punto de referencia o instrucciones adicionales" className="w-full p-3 border-gray-300 rounded-lg" rows={3}></textarea>
                    </form>
                  </div>
                )}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">3. Método de Pago</h2>
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <label key={method.id} className="flex items-center p-4 rounded-xl border-2 border-gray-200 has-[:checked]:border-medical-primary has-[:checked]:bg-medical-blue-50">
                          <input type="radio" name="payment_method" value={method.id} checked={formData.payment_method === method.id} onChange={handleChange} className="h-5 w-5 text-medical-primary focus:ring-medical-primary"/>
                          <div className="ml-4">
                            <p className="font-semibold">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    
                    {/* Mostrar datos del método de pago seleccionado */}
                    <AnimatePresence>
                      {formData.payment_method && paymentMethods.find(p => p.id === formData.payment_method)?.data && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 p-4 bg-gradient-to-r from-medical-blue-50 to-medical-green-50 rounded-xl border border-medical-primary/20">
                            <h3 className="text-lg font-semibold mb-3 text-medical-primary flex items-center gap-2">
                              <CreditCard className="w-5 h-5" />
                              Datos para el pago
                            </h3>
                            <div className="bg-white/80 p-3 rounded-lg">
                              <p className="text-sm font-mono text-gray-700 whitespace-pre-line">
                                {paymentMethods.find(p => p.id === formData.payment_method)?.data}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    { (formData.payment_method === 'pago-movil' || formData.payment_method === 'zelle') && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Sube tu comprobante de pago</h3>
                             <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
                                {isUploading ? 'Subiendo...' : formData.payment_capture_url ? <><CheckCircle className="text-green-500"/> Comprobante subido</> : <><UploadCloud/> Adjuntar archivo</>}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                            {isNextDisabled && (
                                <p className="text-red-500 text-sm mt-2">Por favor, sube el comprobante para continuar.</p>
                            )}
                        </div>
                    )}
                  </div>
                )}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">4. Confirmar Pedido</h2>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-soft border">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2">Información de la Farmacia</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div><span className="font-semibold text-gray-600">Razón Social:</span> <p>{formData.razonSocial}</p></div>
                                <div><span className="font-semibold text-gray-600">RIF:</span> <p>{formData.rif}</p></div>
                                <div><span className="font-semibold text-gray-600">Email:</span> <p>{formData.email}</p></div>
                                <div><span className="font-semibold text-gray-600">Teléfono:</span> <p>{formData.telefono}</p></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-soft border">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2">Dirección de Envío</h3>
                            <div className="text-sm">
                                <div><span className="font-semibold text-gray-600">Zona:</span> <p>{shippingZones.find(z => z.id === formData.shipping_address_id)?.name}</p></div>
                                <div className="mt-2"><span className="font-semibold text-gray-600">Notas:</span> <p>{formData.customer_notes || 'N/A'}</p></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-soft border">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2">Método de Pago</h3>
                            <p className="text-sm">{paymentMethods.find(p => p.id === formData.payment_method)?.name}</p>
                        </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex justify-between">
              <button onClick={prevStep} disabled={currentStep === 0} className="flex items-center gap-2 px-6 py-3 disabled:opacity-50">
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
              {currentStep < steps.length - 1 ? (
                <button onClick={nextStep} disabled={isNextDisabled} className="flex items-center gap-2 px-6 py-3 bg-medical-primary text-white rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed">
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleConfirmOrder} className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl">
                  Confirmar Pedido <ShieldCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
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
                    <span className="font-semibold">{formatPrice(item.subtotal_ves, 'VES')}</span>
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
                  <span className="font-semibold">{shippingZones.find(z => z.id === formData.shipping_address_id)?.price ? formatPrice(shippingZones.find(z => z.id === formData.shipping_address_id)!.price, 'REF') : 'Selecciona una zona'}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-medical-gray-900 border-t pt-3 mt-3">
                  <span>Total</span>
                  <span>{formatPrice((cart?.total_ref || 0) + (shippingZones.find(z => z.id === formData.shipping_address_id)?.price || 0), 'REF')}</span>
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