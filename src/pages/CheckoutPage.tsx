import React, { useEffect, useState, useRef } from 'react';
import { useCurrency } from '../hooks/useCurrency';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, User, MapPin, CreditCard, ShieldCheck, UploadCloud, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { PaymentMethod } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/AuthService';
import { useUploadImage } from '../hooks/useUploadImage';
import { useNavigate } from 'react-router-dom';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  recipient_name: string;
  recipient_phone: string;
  is_default: boolean;
}

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
  const { cart, clearCart } = useCart();
  const { user, loading: userLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const { uploadImage, isUploading } = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    recipient_name: '',
    recipient_phone: '',
    is_default: true,
  });

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

  useEffect(() => {
    if (currentStep === 1) {
      fetchAddresses();
    }
  }, [currentStep]);

  const fetchAddresses = async () => {
    try {
      const userAddresses = await authService.getUserAddresses();
      setAddresses(userAddresses);
      if (userAddresses.length > 0) {
        setFormData(prev => ({ ...prev, shipping_address_id: userAddresses.find(a => a.is_default)?.id || userAddresses[0].id }));
      } else {
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setShowAddressForm(true); // Show form if there's an error fetching
    }
  };

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveAddress = async () => {
    try {
      const createdAddress = await authService.createUserAddress(newAddress);
      setAddresses([...addresses, createdAddress]);
      setFormData(prev => ({ ...prev, shipping_address_id: createdAddress.id }));
      setShowAddressForm(false);
    } catch (error) {
      console.error('Failed to save address:', error);
      alert('Hubo un error al guardar la dirección.');
    }
  };


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
  }, [user, userLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, metodoPago: e.target.value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) {
        setFormData(prev => ({ ...prev, payment_capture_url: uploadedUrl }));
      }
    }
  };
  
  const handleConfirmOrder = async () => {
    const orderData = {
      shipping_address_id: formData.shipping_address_id,
      payment_method: formData.payment_method,
      payment_capture_url: formData.payment_capture_url,
      customer_notes: formData.customer_notes,
    };
  
    try {
      const result = await authService.createOrder(orderData);
      console.log('Order created successfully:', result);
      alert('Pedido confirmado! Gracias por tu compra.');
      
      localStorage.removeItem('checkoutFormData');
      clearCart(); 
      
      navigate('/order-success');
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.');
    }
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

  
  if (userLoading) return <LoadingSpinner variant="inline" message="Cargando información..." />;

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
                    {addresses.length > 0 && !showAddressForm ? (
                      <div className="space-y-4">
                        <select name="shipping_address_id" value={formData.shipping_address_id} onChange={handleChange} className="w-full p-3 border-gray-300 rounded-lg">
                          {addresses.map(addr => (
                            <option key={addr.id} value={addr.id}>
                              {`${addr.street}, ${addr.city}, ${addr.state}`}
                            </option>
                          ))}
                        </select>
                        <button onClick={() => setShowAddressForm(true)} className="text-medical-primary font-semibold">
                          + Agregar nueva dirección
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Agregar nueva dirección de envío</h3>
                        <input type="text" name="street" value={newAddress.street} onChange={handleNewAddressChange} placeholder="Calle" className="w-full p-3 border-gray-300 rounded-lg" />
                        <input type="text" name="city" value={newAddress.city} onChange={handleNewAddressChange} placeholder="Ciudad" className="w-full p-3 border-gray-300 rounded-lg" />
                        <input type="text" name="state" value={newAddress.state} onChange={handleNewAddressChange} placeholder="Estado" className="w-full p-3 border-gray-300 rounded-lg" />
                        <input type="text" name="postal_code" value={newAddress.postal_code} onChange={handleNewAddressChange} placeholder="Código Postal" className="w-full p-3 border-gray-300 rounded-lg" />
                        <input type="text" name="recipient_name" value={newAddress.recipient_name} onChange={handleNewAddressChange} placeholder="Nombre del destinatario" className="w-full p-3 border-gray-300 rounded-lg" />
                        <input type="text" name="recipient_phone" value={newAddress.recipient_phone} onChange={handleNewAddressChange} placeholder="Teléfono del destinatario" className="w-full p-3 border-gray-300 rounded-lg" />
                        <label className="flex items-center gap-2">
                          <input type="checkbox" name="is_default" checked={newAddress.is_default} onChange={handleNewAddressChange} />
                          <span>Marcar como dirección por defecto</span>
                        </label>
                        <button onClick={handleSaveAddress} className="px-6 py-3 bg-medical-primary text-white rounded-xl">
                          Guardar Dirección
                        </button>
                        {addresses.length > 0 && (
                           <button onClick={() => setShowAddressForm(false)} className="ml-4 text-gray-600">
                             Cancelar
                           </button>
                        )}
                      </div>
                    )}
                    <textarea name="customer_notes" value={formData.customer_notes} onChange={handleChange} placeholder="Punto de referencia o instrucciones adicionales" className="w-full p-3 border-gray-300 rounded-lg mt-4" rows={3}></textarea>
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
                                <div><span className="font-semibold text-gray-600">Zona:</span> <p>{addresses.find(z => z.id === formData.shipping_address_id)?.street}</p></div>
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
                  <span className="font-semibold">Gratis</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-medical-gray-900 border-t pt-3 mt-3">
                  <span>Total</span>
                  <span>{formatPrice((cart?.total_ref || 0), 'REF')}</span>
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