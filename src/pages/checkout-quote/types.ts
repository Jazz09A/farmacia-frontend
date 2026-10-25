export type Address = {
  id: string;
  recipient_name?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  recipient_phone?: string;
  address_type?: string;
  is_default?: boolean;
  co_tran?: string;
  transport_code?: string;
  label?: string;
  raw_address?: string;
  is_profit_address?: boolean;
};
