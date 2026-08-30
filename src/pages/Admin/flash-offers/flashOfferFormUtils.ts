import { CreateFlashOfferPayload, FlashOfferWithProduct } from '../../../types';

export type FlashOfferFormValues = {
  productCode: string; // co_art
  desDes: string; // des_des - Descripción de la promoción
  startDate: string; // fecha_ini
  endDate: string; // fecha_fin
  hasta1: string; // hasta1 - Cantidad máxima para primer descuento
  porc1: string; // porc1 - Porcentaje del primer descuento
  hasta2: string; // hasta2 - Cantidad máxima para segundo descuento (opcional)
  porc2: string; // porc2 - Porcentaje del segundo descuento (opcional)
  campo1: string; // campo1 - Observación interna (opcional)
};

export const defaultFormValues: FlashOfferFormValues = {
  productCode: '',
  desDes: 'Promo Web',
  startDate: '',
  endDate: '',
  hasta1: '',
  porc1: '',
  hasta2: '',
  porc2: '',
  campo1: '',
};

export const formatDateForInput = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  const tzOffset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - tzOffset * 60000);
  return local.toISOString().slice(0, 16);
};

export const toIsoString = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
};

export const mapFormValuesToPayload = (values: FlashOfferFormValues): CreateFlashOfferPayload => {
  const payload: CreateFlashOfferPayload = {
    co_art: values.productCode.trim(),
    des_des: values.desDes.trim(),
    fecha_ini: toIsoString(values.startDate) || new Date().toISOString(),
    fecha_fin: toIsoString(values.endDate) || new Date().toISOString(),
    hasta1: Number(values.hasta1),
    porc1: Number(values.porc1),
  };

  if (values.hasta2 && values.porc2) {
    payload.hasta2 = Number(values.hasta2);
    payload.porc2 = Number(values.porc2);
  }

  if (values.campo1.trim()) {
    payload.campo1 = values.campo1.trim();
  }

  return payload;
};

export const mapOfferToFormValues = (offer: FlashOfferWithProduct): FlashOfferFormValues => {
  return {
    productCode: offer.product_id || offer.product?.id || '',
    desDes: 'Promo Web',
    startDate: formatDateForInput(offer.start_time),
    endDate: formatDateForInput(offer.end_time),
    hasta1: offer.max_quantity ? offer.max_quantity.toString() : '',
    porc1: offer.discount_value ? offer.discount_value.toString() : '',
    hasta2: '',
    porc2: '',
    campo1: '',
  };
};

export const getStatusColor = (isActive: boolean, endTime: string) => {
  if (!isActive) return 'gray';
  const isExpired = new Date(endTime) < new Date();
  if (isExpired) return 'red';
  return 'green';
};

export const getStatusText = (isActive: boolean, endTime: string) => {
  if (!isActive) return 'Inactiva';
  const isExpired = new Date(endTime) < new Date();
  if (isExpired) return 'Expirada';
  return 'Activa';
};
