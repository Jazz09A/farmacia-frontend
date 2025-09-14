import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PaymentForm } from '../PaymentForm';

// Mock del hook usePayment
const mockUsePayment = {
  createPayment: jest.fn(),
  uploadCaptureFile: jest.fn(),
  getPayments: jest.fn(),
  validatePaymentData: jest.fn(),
  clearValidationErrors: jest.fn(),
  getFieldError: jest.fn(),
  formatAmount: (amount: number) => `$${amount.toLocaleString()}`,
  getMaxAmount: (creditRemaining: number) => Math.min(creditRemaining, 10000),
  loading: false,
  error: null,
  validationErrors: {},
  uploadingFile: false
};

jest.mock('../../../hooks/usePayment', () => ({
  usePayment: () => mockUsePayment
}));

// Mock del componente LoadingSpinner
jest.mock('../../common/LoadingSpinner', () => ({
  LoadingSpinner: ({ size }: { size?: string }) => <div data-testid="loading-spinner">Loading...</div>
}));

const defaultProps = {
  orderId: 'order_123',
  orderTotal: 500,
  creditRemaining: 1000,
  onPaymentCreated: jest.fn(),
  onCancel: jest.fn()
};

describe('PaymentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders payment form correctly', () => {
    render(<PaymentForm {...defaultProps} />);
    
    expect(screen.getByText('💳 Realizar Pago Parcial')).toBeInTheDocument();
    expect(screen.getByText('Total de la Orden: $500')).toBeInTheDocument();
    expect(screen.getByText('Saldo Pendiente: $1,000')).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    const mockPayment = { id: 'payment_123', amount: 200 };
    mockUsePayment.createPayment.mockResolvedValue(mockPayment);
    
    render(<PaymentForm {...defaultProps} />);
    
    const amountInput = screen.getByPlaceholderText('0.00');
    const referenceInput = screen.getByPlaceholderText('Ej: REF123456789');
    const submitButton = screen.getByText('📤 Enviar Pago');
    
    fireEvent.change(amountInput, { target: { value: '200' } });
    fireEvent.change(referenceInput, { target: { value: 'REF123456789' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockUsePayment.createPayment).toHaveBeenCalledWith(
        {
          order_id: 'order_123',
          amount: 200,
          payment_reference: 'REF123456789',
          payment_capture_url: ''
        },
        1000
      );
    });
  });

  test('handles file upload', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    mockUsePayment.uploadCaptureFile.mockResolvedValue({ url: 'http://example.com/image.jpg' });
    
    render(<PaymentForm {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { name: /adjuntar archivo/i });
    fireEvent.click(fileInput);
    
    const input = screen.getByRole('button', { name: /adjuntar archivo/i }).parentElement?.querySelector('input[type="file"]');
    if (input) {
      fireEvent.change(input, { target: { files: [mockFile] } });
    }
    
    await waitFor(() => {
      expect(mockUsePayment.uploadCaptureFile).toHaveBeenCalledWith(mockFile);
    });
  });

  test('shows validation errors', () => {
    mockUsePayment.getFieldError.mockImplementation((field: string) => {
      if (field === 'amount') return 'El monto debe ser mayor a 0';
      return undefined;
    });
    
    render(<PaymentForm {...defaultProps} />);
    
    expect(screen.getByText('El monto debe ser mayor a 0')).toBeInTheDocument();
  });

  test('handles cancel action', () => {
    render(<PaymentForm {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('shows loading state', () => {
    mockUsePayment.loading = true;
    
    render(<PaymentForm {...defaultProps} />);
    
    expect(screen.getByText('Enviando Pago...')).toBeInTheDocument();
  });

  test('shows error message', () => {
    mockUsePayment.error = 'Error al crear pago';
    
    render(<PaymentForm {...defaultProps} />);
    
    expect(screen.getByText('Error al crear pago')).toBeInTheDocument();
  });
});

