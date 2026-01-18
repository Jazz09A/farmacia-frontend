import emailjs from '@emailjs/browser';

// Validar y obtener variables de entorno
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEI;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

// Validar que las variables de entorno estén definidas
if (!PUBLIC_KEY) {
  console.error('Error: VITE_EMAILJS_PUBLIC_KEY no está definida en las variables de entorno');
  throw new Error('Configuración de EmailJS incompleta: falta VITE_EMAILJS_PUBLIC_KEI');
}

if (!SERVICE_ID) {
  console.error('Error: VITE_EMAILJS_SERVICE_ID no está definida en las variables de entorno');
  throw new Error('Configuración de EmailJS incompleta: falta VITE_EMAILJS_SERVICE_ID');
}

if (!TEMPLATE_ID) {
  console.error('Error: VITE_EMAILJS_TEMPLATE_ID no está definida en las variables de entorno');
  throw new Error('Configuración de EmailJS incompleta: falta VITE_EMAILJS_TEMPLATE_ID');
}

// Inicializar EmailJS con validación
try {
  emailjs.init(PUBLIC_KEY);
} catch (error) {
  console.error('Error al inicializar EmailJS:', error);
  throw new Error('Error al inicializar el servicio de EmailJS. Verifica la configuración.');
}

class EmailService {
  private serviceId: string;
  private templateId: string;

  constructor() {
    // Asignar valores validados
    this.serviceId = SERVICE_ID;
    this.templateId = TEMPLATE_ID;
  }

  /**
   * Envía un formulario de contacto/alianza usando EmailJS
   */
  async sendContactForm(data: {
    title: string;
    name: string;
    apellido: string;
    farmacia_nombre: string;
    user_email: string;
    phone: string | number;
    estado: string;
    direccion: string;
    email: string;
    mensaje: string;
  }): Promise<void> {
    // Validar que los IDs estén definidos antes de enviar
    if (!this.serviceId || !this.templateId) {
      throw new Error('Configuración de EmailJS incompleta. Verifica las variables de entorno.');
    }

    try {
      await emailjs.send(this.serviceId, this.templateId, {
        title: data.title || '',
        name: data.name || '',
        apellido: data.apellido || '',
        farmacia_nombre: data.farmacia_nombre || '',
        user_email: data.user_email || '',
        phone: data.phone || '',
        estado: data.estado || '',
        direccion: data.direccion || '',
        email: data.email || '',
        message: data.mensaje || '',
      });
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Proporcionar mensajes de error más específicos
      if (error instanceof Error) {
        if (error.message.includes('Invalid public key')) {
          throw new Error('La clave pública de EmailJS no es válida. Verifica VITE_EMAILJS_PUBLIC_KEY.');
        }
        if (error.message.includes('Invalid service ID')) {
          throw new Error('El ID del servicio de EmailJS no es válido. Verifica VITE_EMAILJS_SERVICE_ID.');
        }
        if (error.message.includes('Invalid template ID')) {
          throw new Error('El ID del template de EmailJS no es válido. Verifica VITE_EMAILJS_TEMPLATE_ID.');
        }
      }
      
      throw new Error('Error al enviar el formulario. Por favor, intenta nuevamente.');
    }
  }
}

export const emailService = new EmailService();
