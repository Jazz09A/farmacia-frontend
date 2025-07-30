// Tipos para autenticación - Solo usuarios jurídicos

export interface JuridicoRegisterData {
  email: string;
  phone: string;
  preferred_currency: 'VES' | 'USD';
  user_type: 'juridico';
  company_name: string;
  rif: string;
  registro_mercantil: string;
  representante_legal_cedula: string;
  representante_legal_nombre: string;
  representantes_adicionales: string[];
  referencia_comercial_proveedor: string;
  referencia_bancaria: string;
  direccion_establecimiento: string;
  dueno_telefono: string;
  dueno_email: string;
  dueno_cumpleanos: string;
  encargado_compra_telefono: string;
  encargado_compra_email: string;
  encargado_compra_cumpleanos: string;
  encargado_cobranza_telefono: string;
  encargado_cobranza_email: string;
  encargado_cobranza_cumpleanos: string;
  redes_sociales: string;
  pagina_web: string;
  codigo_sicm: string;
  fotos_establecimiento: string[];
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    refresh_token?: string;
  };
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  user_type: 'juridico' | 'natural' | 'admin';
  role: 'super_admin' | 'admin' | 'user';
  preferred_currency: 'VES' | 'USD';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  
  // Datos jurídicos (opcionales)
  company_name?: string;
  rif?: string;
  registro_mercantil?: string;
  representante_legal_cedula?: string;
  representante_legal_nombre?: string;
  direccion_establecimiento?: string;

  // Datos naturales (opcionales)
  first_name?: string;
  last_name?: string;
  cedula?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  registerJuridico: (data: JuridicoRegisterData) => Promise<AuthResponse>;
  logout: () => void;
} 