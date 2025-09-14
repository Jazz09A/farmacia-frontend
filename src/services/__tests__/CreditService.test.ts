import CreditService from '../CreditService';

// Mock fetch
global.fetch = jest.fn();

describe('CreditService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('authToken', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getCreditInfo', () => {
    test('should fetch credit info successfully', async () => {
      const mockCreditInfo = {
        available_credit: 1000,
        credit_limit: 5000,
        credit_status: 'active'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreditInfo
      });

      const result = await CreditService.getCreditInfo();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/credit/credit/info',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        }
      );

      expect(result).toEqual(mockCreditInfo);
    });

    test('should throw error when request fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized'
      });

      await expect(CreditService.getCreditInfo()).rejects.toThrow(
        'Error al obtener información de crédito: Unauthorized'
      );
    });
  });

  describe('createCreditOrder', () => {
    test('should create credit order successfully', async () => {
      const orderData = {
        shipping_address_id: 'addr_123',
        payment_due_days: 30,
        customer_notes: 'Test order'
      };

      const mockResponse = {
        message: 'Orden de crédito creada exitosamente',
        order_id: 'order_456',
        order_number: 'FP-20240115-1234',
        total: 500.0,
        credit_remaining: 500.0
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await CreditService.createCreditOrder(orderData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/credit/orders/credit',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify(orderData)
        }
      );

      expect(result).toEqual(mockResponse);
    });

    test('should throw error with message when request fails', async () => {
      const orderData = {
        shipping_address_id: 'addr_123',
        payment_due_days: 30,
        customer_notes: 'Test order'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Insufficient credit' })
      });

      await expect(CreditService.createCreditOrder(orderData)).rejects.toThrow(
        'Insufficient credit'
      );
    });
  });

  describe('createPayment', () => {
    test('should create payment successfully', async () => {
      const paymentData = {
        order_id: 'order_123',
        amount: 200,
        payment_reference: 'REF123456789',
        payment_capture_url: 'http://example.com/capture.jpg'
      };

      const mockPayment = {
        id: 'payment_789',
        order_id: 'order_123',
        amount: 200,
        payment_reference: 'REF123456789',
        status: 'pending',
        created_at: '2024-01-15T10:30:00Z'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayment
      });

      const result = await CreditService.createPayment(paymentData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/credit/payments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify(paymentData)
        }
      );

      expect(result).toEqual(mockPayment);
    });
  });

  describe('validateCreditAvailability', () => {
    test('should return true when credit is sufficient', async () => {
      const mockCreditInfo = {
        available_credit: 1000,
        credit_limit: 5000,
        credit_status: 'active'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreditInfo
      });

      const result = await CreditService.validateCreditAvailability(500);

      expect(result).toBe(true);
    });

    test('should return false when credit is insufficient', async () => {
      const mockCreditInfo = {
        available_credit: 100,
        credit_limit: 5000,
        credit_status: 'active'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreditInfo
      });

      const result = await CreditService.validateCreditAvailability(500);

      expect(result).toBe(false);
    });

    test('should return false when request fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await CreditService.validateCreditAvailability(500);

      expect(result).toBe(false);
    });
  });
});

