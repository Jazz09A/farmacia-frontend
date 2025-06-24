// Tipos compartidos para formularios de autenticación

// Formulario para usuarios naturales
export interface NaturalRegisterForm {
  user_type: 'natural';
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  cedula: string;
  phone: string;
  birth_date: string;
  address: string;
  preferred_currency: 'VES' | 'USD';
}

// Formulario para usuarios jurídicos
export interface JuridicoRegisterForm {
  user_type: 'juridico';
  email: string;
  password: string;
  confirm_password: string;
  company_name: string;
  rif: string;
  registro_mercantil: string;
  phone: string;
  preferred_currency: 'VES' | 'USD';
  
  // Representante legal
  representante_legal_cedula: string;
  representante_legal_nombre: string;
  representantes_adicionales: string;
  
  // Referencias
  referencia_comercial_proveedor: string;
  referencia_bancaria: string;
  
  // Dirección
  direccion_establecimiento: string;
  
  // Contactos opcionales
  dueno_telefono: string;
  dueno_email: string;
  dueno_cumpleanos: string;
  
  encargado_compra_telefono: string;
  encargado_compra_email: string;
  encargado_compra_cumpleanos: string;
  
  encargado_cobranza_telefono: string;
  encargado_cobranza_email: string;
  encargado_cobranza_cumpleanos: string;
  
  // Información adicional
  redes_sociales: string;
  pagina_web: string;
  codigo_sicm: string;
} 