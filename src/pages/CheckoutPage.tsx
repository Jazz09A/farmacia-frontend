import React, { useEffect, useState, useRef } from 'react';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, User, MapPin, CreditCard, ShieldCheck, UploadCloud, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserAddressesQuery, useCreateOrderMutation, useCreateAddressMutation } from '../hooks/queries/useAuthQueries';
import { useUploadImage } from '../hooks/useUploadImage';
import { getPaymentMethodCurrency } from '../utils/currencyUtils';
import { useNavigate } from 'react-router-dom';
import { useCredit } from '../contexts/CreditContext';
import { useCreditValidation } from '../hooks/useCreditValidation';
import { CreditOrderForm } from '../components/Credit/CreditOrderForm';
import { useNavbar } from '../contexts/NavbarContext';
import { paymentMethods } from '../config/paymentMethods';
import { CheckoutPreview } from '../types/discounts';

interface Address {
  id: string;
  user_id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  recipient_name: string;
  recipient_phone: string;
  delivery_instructions?: string;
  address_type: string;
  is_default: boolean;
  is_active: boolean;
  shipping_zone_id: string;
  created_at: string;
  updated_at: string;
}

const steps = [
  { id: 'user', name: 'Identificación', icon: User },
  { id: 'shipping', name: 'Envío', icon: MapPin },
  { id: 'payment', name: 'Pago', icon: CreditCard },
  { id: 'confirm', name: 'Confirmar', icon: ShieldCheck },
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
  const [isConfirming, setIsConfirming] = useState(false); // ✅ Agregar estado de carga
  const { cart, clearCart } = useCart();
  const { user, loading: userLoading } = useAuth();
  const { formatPriceFromBackend, currency } = useGlobalCurrency();
  const { uploadImage, isUploading } = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Credit system hooks
  const { creditInfo } = useCredit();
  const { canCreateCreditOrder } = useCreditValidation();
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [creditOrderResult, setCreditOrderResult] = useState<any>(null);
  const { hideNavbar, showNavbar } = useNavbar();

  useEffect(() => {
    if (showCreditForm) {
      hideNavbar();
    } else {
      showNavbar();
    }

    return () => {
      showNavbar();
    };
  }, [showCreditForm, hideNavbar, showNavbar]);


  const [addresses, setAddresses] = useState<Address[]>([]);
  const [checkoutPreview, setCheckoutPreview] = useState<CheckoutPreview | null>(null);
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

  const { data: addressesData, refetch: refetchAddresses, isFetching: isFetchingAddresses } = useUserAddressesQuery(
    { include_checkout_preview: true, cart_total: cart?.total || 0 },
    currentStep === 1
  );
  const createOrderMutation = useCreateOrderMutation();
  const createAddressMutation = useCreateAddressMutation();

  useEffect(() => {
    if (addressesData) {
      if (addressesData.addresses?.length) {
        setAddresses(addressesData.addresses);
        const defaultAddress = addressesData.addresses.find(address => address.is_default);
        if (defaultAddress) {
          setFormData(prev => ({
            ...prev,
            shipping_address_id: defaultAddress.id
          }));
        }
      }
      if (addressesData.checkout_preview) {
        setCheckoutPreview(addressesData.checkout_preview);
      }
    }
  }, [addressesData]);

  const fetchAddresses = async () => {
    // Mantener función para compatibilidad, pero usar refetch de React Query
    const result = await refetchAddresses();
    if (result.status === 'success' && result.data) {
      setAddresses(result.data.addresses || []);
      setCheckoutPreview(result.data.checkout_preview || null);
    }
  };

  // Función para obtener el preview del checkout (con fallback)
  const getCheckoutPreview = () => {
    if (checkoutPreview) {
      return checkoutPreview;
    }
    
    // Fallback: crear un preview básico con los datos del carrito
    if (cart) {
      return {
        subtotal: cart.total,
        shipping_cost: 0,
        taxes: 0,
        total: cart.total,
        payment_currency: 'USD' as const,
        shipping_zone: 'Calculando...',
        shipping_address: {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
          recipient_name: '',
          recipient_phone: '',
          delivery_instructions: ''
        },
        quantity_discount: undefined,
        quantity_discount_amount: 0,
        flash_discounts: [],
        total_discount: 0
      };
    }
    
    return null;
  };

  // Función para actualizar preview cuando cambie la dirección
  const updateCheckoutPreview = async (addressId: string) => {
    const result = await refetchAddresses();
    const response: any = result.data as any;
    if (response && response.checkout_preview && response.checkout_preview.previews_by_address) {
      const addressPreview = response.checkout_preview.previews_by_address[addressId];
      const address = addresses.find(addr => addr.id === addressId);
      if (address && addressPreview) {
        const checkoutPreview: CheckoutPreview = {
          subtotal: addressPreview.subtotal,
          shipping_cost: addressPreview.shipping_cost,
          taxes: addressPreview.taxes,
          total: addressPreview.total,
          payment_currency: addressPreview.payment_currency as 'USD' | 'VES',
          exchange_rate: addressPreview.exchange_rate,
          shipping_zone: addressPreview.shipping_zone,
          shipping_address: {
            street: address.street,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
            recipient_name: address.recipient_name,
            recipient_phone: address.recipient_phone,
            delivery_instructions: address.delivery_instructions
          },
          quantity_discount: addressPreview.quantity_discount,
          quantity_discount_amount: addressPreview.quantity_discount_amount,
          flash_discounts: addressPreview.flash_discounts || [],
          total_discount: addressPreview.total_discount,
          original_subtotal: addressPreview.original_subtotal,
          original_taxes: addressPreview.original_taxes,
          original_total: addressPreview.original_total,
          total_savings: addressPreview.total_savings,
          savings_percentage: addressPreview.savings_percentage
        };
        setCheckoutPreview(checkoutPreview);
      }
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
      const createdAddress: any = await createAddressMutation.mutateAsync(newAddress);
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
    // Si es pago con crédito, usar el resultado ya creado
    if (formData.payment_method === 'credito' && creditOrderResult) {
      localStorage.removeItem('checkoutFormData');
      clearCart();
      navigate('/order-success', { state: { order: creditOrderResult } });
      return;
    }

    // Para otros métodos de pago, usar el flujo normal
    const orderData = {
      shipping_address_id: formData.shipping_address_id,
      payment_method: formData.payment_method,
      payment_currency: getPaymentMethodCurrency(formData.payment_method),
      payment_capture_url: formData.payment_capture_url,
      customer_notes: formData.customer_notes,
    };
  
    try {
      setIsConfirming(true); // ✅ Activar estado de carga
      await createOrderMutation.mutateAsync(orderData);
      
      localStorage.removeItem('checkoutFormData');
      clearCart(); 
      
      navigate('/order-success');
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.');
    } finally {
      setIsConfirming(false); // ✅ Desactivar estado de carga
    }
  };

  const handleCreditOrderCreated = (result: any) => {
    setCreditOrderResult(result);
    setShowCreditForm(false);
    // Avanzar al paso de confirmación
    setCurrentStep(3);
  };
  
  const nextStep = () => {
    // Si se selecciona crédito, mostrar el formulario de crédito
    if (currentStep === 2 && formData.payment_method === 'credito') {
      setShowCreditForm(true);
      return;
    }
    
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
        <h1 className="text-4xl font-bold text-medical-gray-900 mb-4">Finalizar Pedido</h1>
        <p className="text-lg text-medical-gray-600 mb-8">Completa los datos para procesar tu pedido comercial de manera segura.</p>

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
                        <div className="space-y-3">
                          {addresses.map(addr => {
                            const isSelected = formData.shipping_address_id === addr.id;
                            
                            return (
                              <div 
                                key={addr.id} 
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'border-medical-primary bg-medical-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, shipping_address_id: addr.id }));
                                  updateCheckoutPreview(addr.id);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="radio" 
                                        checked={isSelected}
                                        onChange={() => {
                                          setFormData(prev => ({ ...prev, shipping_address_id: addr.id }));
                                          updateCheckoutPreview(addr.id);
                                        }}
                                        className="text-medical-primary"
                                      />
                                      <div>
                                        <p className="font-medium">{addr.recipient_name}</p>
                                        <p className="text-sm text-gray-600">
                                          {addr.street}, {addr.city}, {addr.state}
                                        </p>
                                        <p className="text-xs text-gray-500">{addr.recipient_phone}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
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
                      {paymentMethods.map((method) => {
                        // Verificar si el método de crédito está disponible
                        const isCreditMethod = method.id === 'credito';
                        const creditValidation = isCreditMethod ? canCreateCreditOrder(cart?.total || 0) : { canCreate: true };
                        
                        // Determinar la moneda del método de pago
                        const paymentCurrency = getPaymentMethodCurrency(method.id);
                        const isSelected = formData.payment_method === method.id;
                        
                        // Calcular el monto en la moneda correspondiente
                        const totalInPaymentCurrency = paymentCurrency === 'VES' 
                          ? formatPriceFromBackend(cart?.total || 0, 'VES')
                          : formatPriceFromBackend(cart?.total || 0, 'USD');
                        
                        return (
                          <div key={method.id} className="border border-gray-200 rounded-xl overflow-hidden">
                            {/* Header del acordeón */}
                            <label 
                              className={`flex items-center p-4 cursor-pointer transition-all duration-200 ${
                                creditValidation.canCreate 
                                  ? isSelected
                                    ? 'bg-medical-blue-50 border-l-4 border-l-medical-primary'
                                    : 'hover:bg-gray-50'
                                  : 'bg-gray-100 opacity-60 cursor-not-allowed'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name="payment_method" 
                                value={method.id} 
                                checked={isSelected} 
                                onChange={handleChange} 
                                disabled={!creditValidation.canCreate}
                                className="h-5 w-5 text-medical-primary focus:ring-medical-primary disabled:cursor-not-allowed"
                              />
                              <div className="ml-4 flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="font-semibold flex items-center gap-2">
                                      {method.name}
                                      {isCreditMethod && creditInfo && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          ${creditInfo.available_credit.toLocaleString()} disponible
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-sm text-gray-500">{method.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-medical-primary">
                                      {totalInPaymentCurrency}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Total a pagar
                                    </p>
                                  </div>
                                </div>
                                {isCreditMethod && !creditValidation.canCreate && (
                                  <div className="mt-2">
                                    <span className="text-xs text-red-600 font-medium">
                                      {creditValidation.reason}
                                    </span>
                                  </div>
                                )}
                                {isCreditMethod && creditValidation.suggestions && creditValidation.suggestions.length > 0 && (
                                  <div className="mt-2 text-xs text-orange-600">
                                    <p className="font-medium">Sugerencias:</p>
                                    <ul className="list-disc list-inside">
                                      {creditValidation.suggestions.map((suggestion, index) => (
                                        <li key={index}>{suggestion}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </label>
                            
                            {/* Contenido desplegable del acordeón */}
                            <AnimatePresence>
                              {isSelected && method.data && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: "easeInOut" }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 bg-gradient-to-r from-medical-blue-50 to-medical-green-50 border-t border-gray-200">
                                    <div className="pt-4">
                                      <h4 className="text-sm font-semibold text-medical-primary mb-3 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        Datos para el pago
                                      </h4>
                                      <div className="bg-white/80 p-4 rounded-lg border border-medical-primary/20">
                                        <div className="space-y-3">
                                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-700">Monto a pagar:</span>
                                            <span className="text-lg font-bold text-medical-primary">
                                              {totalInPaymentCurrency}
                                            </span>
                                          </div>
                                          <div className="text-sm font-mono text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded">
                                            {method.data}
                                          </div>
                                          {method.id === 'pago-movil' && (
                                            <div className="space-y-3">
                                              <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                                                💡 <strong>Importante:</strong> Realiza el pago móvil y sube el comprobante para continuar.
                                              </div>
                                              <div>
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Sube tu comprobante de pago</h5>
                                                <button 
                                                  onClick={() => fileInputRef.current?.click()} 
                                                  disabled={isUploading} 
                                                  className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50 transition-colors"
                                                >
                                                  {isUploading ? 'Subiendo...' : formData.payment_capture_url ? <><CheckCircle className="text-green-500"/> Comprobante subido</> : <><UploadCloud/> Adjuntar archivo</>}
                                                </button>
                                                {isNextDisabled && formData.payment_method === 'pago-movil' && (
                                                  <p className="text-red-500 text-xs mt-1">Por favor, sube el comprobante para continuar.</p>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                          {method.id === 'zelle' && (
                                            <div className="space-y-3">
                                              <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                                                💡 <strong>Importante:</strong> Realiza la transferencia Zelle y sube el comprobante para continuar.
                                              </div>
                                              <div>
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Sube tu comprobante de pago</h5>
                                                <button 
                                                  onClick={() => fileInputRef.current?.click()} 
                                                  disabled={isUploading} 
                                                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
                                                >
                                                  {isUploading ? 'Subiendo...' : formData.payment_capture_url ? <><CheckCircle className="text-green-500"/> Comprobante subido</> : <><UploadCloud/> Adjuntar archivo</>}
                                                </button>
                                                {isNextDisabled && formData.payment_method === 'zelle' && (
                                                  <p className="text-red-500 text-xs mt-1">Por favor, sube el comprobante para continuar.</p>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                          {method.id === 'efectivo' && (
                                            <div className="text-xs text-gray-600 bg-green-50 p-2 rounded border border-green-200">
                                              💡 <strong>Importante:</strong> Pagarás en efectivo al recibir tu pedido.
                                            </div>
                                          )}
                                          {method.id === 'credito' && (
                                            <div className="text-xs text-gray-600 bg-purple-50 p-2 rounded border border-purple-200">
                                              💡 <strong>Importante:</strong> Se utilizará tu línea de crédito disponible.
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Input de archivo oculto */}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
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
                                
                                {/* Mostrar información de costos si está disponible */}
                                {(() => {
                                  const preview = getCheckoutPreview();
                                  const hasDiscount = preview && preview.total_discount > 0;
                                  
                                  return preview && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <span>📋</span>
                                        Desglose de Costos
                                      </h4>
                                      
                                      <div className="space-y-2 text-sm">
                                        {/* Subtotal Original */}
                                        <div className="flex justify-between">
                                          <span>Subtotal productos:</span>
                                          <span className={`font-medium ${hasDiscount ? 'text-gray-500' : ''}`}>
                                            {formatPriceFromBackend(preview.original_subtotal || preview.subtotal)}
                                          </span>
                                        </div>
                                      
                                      {/* Descuentos aplicados */}
                                        {hasDiscount && (
                                          <div className="ml-2 space-y-1.5 pb-2 border-b border-gray-300">
                                            {/* Descuento por cantidad */}
                                            {preview.quantity_discount && preview.quantity_discount_amount > 0 && (
                                              <div className="flex justify-between items-center bg-green-50 -mx-2 px-2 py-1 rounded">
                                                <div className="flex items-center gap-1.5">
                                                  <span className="text-sm">🎉</span>
                                                  <div>
                                                    <p className="text-green-800 font-medium text-xs">{preview.quantity_discount.name}</p>
                                                  </div>
                                                </div>
                                                <span className="font-semibold text-green-700 text-xs">
                                                  -{formatPriceFromBackend(preview.quantity_discount_amount)}
                                                </span>
                                              </div>
                                            )}
                                            
                                            {/* Ofertas flash */}
                                            {preview.flash_discounts && preview.flash_discounts.length > 0 && (
                                              <div className="flex justify-between items-center bg-orange-50 -mx-2 px-2 py-1 rounded">
                                                <div className="flex items-center gap-1.5">
                                                  <span className="text-sm">⚡</span>
                                                  <p className="text-orange-800 font-medium text-xs">Ofertas Flash</p>
                                                </div>
                                                <span className="font-semibold text-orange-700 text-xs">
                                                  -{formatPriceFromBackend(preview.flash_discounts.reduce((sum, d) => sum + d.discount_amount, 0))}
                                                </span>
                                              </div>
                                            )}
                                            
                                            {/* Subtotal con descuentos */}
                                            <div className="flex justify-between font-semibold pt-1">
                                              <span className="text-green-800 text-xs">Subtotal con descuentos:</span>
                                              <span className="text-green-700 text-xs">
                                                {formatPriceFromBackend(preview.subtotal)}
                                              </span>
                                          </div>
                                        </div>
                                        )}
                                        
                                        {/* Envío */}
                                        <div className="flex justify-between">
                                          <span>Envío ({preview.shipping_zone}):</span>
                                          <span className="font-medium">
                                            {preview.shipping_cost === 0 
                                              ? <span className="text-green-600 font-bold text-xs">¡GRATIS!</span>
                                              : formatPriceFromBackend(preview.shipping_cost)
                                            }
                                          </span>
                                        </div>
                                        
                                        {/* Impuestos */}
                                        <div className="flex justify-between">
                                          <span>Impuestos (16%):</span>
                                          <span className="font-medium">{formatPriceFromBackend(preview.taxes)}</span>
                                        </div>
                                        
                                        {/* Total */}
                                        <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2">
                                          <span>Total a Pagar:</span>
                                          <div className="text-right">
                                            <div className="text-medical-primary">
                                              {formatPriceFromBackend(preview.total)} {preview.payment_currency}
                                            </div>
                                            {preview.original_total && preview.original_total > preview.total && (
                                              <div className="text-xs text-gray-500 line-through">
                                                {formatPriceFromBackend(preview.original_total)}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {/* Ahorro total */}
                                        {hasDiscount && preview.original_total && (
                                          <div className="bg-green-100 border border-green-300 rounded-lg p-2 mt-3">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <span className="text-lg">💰</span>
                                                <span className="text-xs font-semibold text-green-900">Ahorro Total:</span>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-sm font-bold text-green-700">
                                                  {formatPriceFromBackend(preview.original_total - preview.total)}
                                                </p>
                                                <p className="text-xs text-green-600 font-medium">
                                                  {Math.round(((preview.original_total - preview.total) / preview.original_total) * 100)}% OFF
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                                
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-soft border">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2">Método de Pago</h3>
                            <p className="text-sm">{paymentMethods.find(p => p.id === formData.payment_method)?.name}</p>
                            {formData.payment_method === 'credito' && creditOrderResult && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <strong>Orden de Crédito:</strong> {creditOrderResult.order_number}
                                </p>
                                <p className="text-sm text-blue-800">
                                  <strong>Crédito Restante:</strong> ${creditOrderResult.credit_remaining.toLocaleString()}
                                </p>
                              </div>
                            )}
                        </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-soft lg:sticky lg:top-28">
              <h3 className="text-xl font-bold text-medical-gray-800 border-b pb-3 mb-4">Resumen del Pedido Comercial</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {cart?.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.product.images && item.product.images.length > 1 ? item.product.images[1] : item.product.image} 
                        alt={item.product.name} 
                        className="w-12 h-12 rounded-lg object-cover" 
                      />
                      <div>
                        <p className="font-semibold line-clamp-1">{item.product.name}</p>
                        <p className="text-gray-500">Cant: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold">
                      {formatPriceFromBackend(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-medical-gray-700 border-t mt-4 pt-4">
                {(() => {
                  const preview = getCheckoutPreview();
                  const hasDiscount = preview && preview.total_discount > 0;
                  
                  return (
                    <>
                      {/* Subtotal Original */}
                      <div className="flex justify-between text-sm">
                        <span>Subtotal productos</span>
                        <span className={`font-semibold ${hasDiscount ? 'text-gray-500' : ''}`}>
                          {preview && preview.original_subtotal 
                            ? formatPriceFromBackend(preview.original_subtotal)
                            : formatPriceFromBackend(cart?.total || 0)
                          }
                  </span>
                </div>
                
                      {/* Mostrar descuentos si existen */}
                      {hasDiscount && preview && (
                        <div className="ml-2 space-y-2 pb-2 border-b border-gray-200">
                          {/* Descuento por cantidad */}
                          {preview.quantity_discount && preview.quantity_discount_amount > 0 && (
                            <div className="flex justify-between items-center text-sm bg-green-50 -mx-2 px-2 py-1.5 rounded">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">🎉</span>
                                <div>
                                  <p className="text-green-800 font-medium">{preview.quantity_discount.name}</p>
                                  <p className="text-xs text-green-600">
                                    {preview.quantity_discount.discount_type === 'percentage' 
                                      ? `${preview.quantity_discount.discount_value}% de descuento`
                                      : `$${preview.quantity_discount.discount_value} de descuento`
                                    }
                                  </p>
                                </div>
                              </div>
                              <span className="font-semibold text-green-700">
                                -{formatPriceFromBackend(preview.quantity_discount_amount)}
                              </span>
                            </div>
                          )}
                          
                          {/* Descuentos flash */}
                          {preview.flash_discounts && preview.flash_discounts.length > 0 && (
                            <div className="flex justify-between items-center text-sm bg-orange-50 -mx-2 px-2 py-1.5 rounded">
                              <div className="flex items-center gap-2">
                                <span className="text-orange-600">⚡</span>
                                <div>
                                  <p className="text-orange-800 font-medium">Ofertas Flash</p>
                                  <p className="text-xs text-orange-600">
                                    {preview.flash_discounts.length} producto{preview.flash_discounts.length > 1 ? 's' : ''} en oferta
                                  </p>
                                </div>
                              </div>
                              <span className="font-semibold text-orange-700">
                                -{formatPriceFromBackend(preview.flash_discounts.reduce((sum, d) => sum + d.discount_amount, 0))}
                              </span>
                            </div>
                          )}
                          
                          {/* Subtotal después de descuentos */}
                          <div className="flex justify-between text-sm font-semibold pt-1">
                            <span className="text-green-800">Subtotal con descuentos</span>
                            <span className="text-green-700">
                              {formatPriceFromBackend(preview.subtotal)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Envío */}
                      {preview && formData.shipping_address_id ? (
                        <div className="flex justify-between text-sm">
                          <span>Envío ({preview.shipping_zone})</span>
                      <span className="font-semibold">
                            {preview.shipping_cost === 0 
                              ? <span className="text-green-600 font-bold">¡GRATIS!</span>
                              : formatPriceFromBackend(preview.shipping_cost)
                            }
                      </span>
                    </div>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span>Envío</span>
                          <span className="font-semibold text-gray-500">Calculando...</span>
                        </div>
                      )}
                      
                      {/* Impuestos */}
                      {preview && formData.shipping_address_id ? (
                        <div className="flex justify-between text-sm">
                      <span>Impuestos (16%)</span>
                      <span className="font-semibold">
                        {formatPriceFromBackend(preview.taxes)}
                      </span>
                    </div>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span>Impuestos (16%)</span>
                    <span className="font-semibold text-gray-500">Calculando...</span>
                  </div>
                )}
                
                      {/* Total */}
                <div className="flex justify-between font-bold text-lg text-medical-gray-900 border-t pt-3 mt-3">
                        <span>Total a Pagar</span>
                        <div className="text-right">
                          <div className="text-lg font-bold text-medical-primary">
                            {preview 
                              ? formatPriceFromBackend(preview.total) 
                              : formatPriceFromBackend(cart?.total || 0)
                            } {preview?.payment_currency || currency}
                          </div>
                          {preview && preview.original_total && preview.original_total > preview.total && (
                            <div className="text-xs text-gray-500 line-through">
                              {formatPriceFromBackend(preview.original_total)}
                            </div>
                          )}
                  </div>
                </div>
                
                      {/* Tarjeta de ahorro total destacado */}
                      {hasDiscount && preview && preview.original_total && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">💰</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-green-900">¡Estás ahorrando!</p>
                                <p className="text-xs text-green-700">Descuento aplicado automáticamente</p>
                            </div>
                          </div>
                          <div className="text-right">
                              <p className="text-xl font-bold text-green-700">
                                {formatPriceFromBackend(preview.original_total - preview.total)}
                            </p>
                              <p className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block">
                                {Math.round(((preview.original_total - preview.total) / preview.original_total) * 100)}% OFF
                            </p>
                          </div>
                        </div>
                      </div>
                      )}
                    </>
                    );
                })()}
              </div>
            </div>
          </div>
        </div>
        
        {/* Botones de navegación - Siempre al final después de todo el contenido */}
        <div className="mt-8 pb-4 lg:pb-0">
          <div className="flex justify-between items-center gap-4 max-w-full">
            <button 
              onClick={prevStep} 
              disabled={currentStep === 0} 
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 text-medical-gray-700 hover:text-medical-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" /> 
              <span>Anterior</span>
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button 
                onClick={nextStep} 
                disabled={isNextDisabled} 
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-medical-primary text-white rounded-xl hover:bg-medical-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleConfirmOrder} 
                disabled={isConfirming}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-xl transition-all disabled:cursor-not-allowed font-bold shadow-xl hover:shadow-2xl"
              >
                {isConfirming ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Confirmar Pedido</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de formulario de crédito */}
      {showCreditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreditOrderForm
              cartItems={cart?.items || []}
              cartTotal={cart?.total || 0}
              selectedShippingAddress={(() => {
                const selectedAddr = addresses.find(addr => addr.id === formData.shipping_address_id);
                return selectedAddr ? {
                  id: selectedAddr.id,
                  name: selectedAddr.recipient_name || 'Dirección seleccionada',
                  address: `${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.state}`
                } : undefined;
              })()}
              onOrderCreated={handleCreditOrderCreated}
              onCancel={() => setShowCreditForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;