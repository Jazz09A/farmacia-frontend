import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreditInfoCard } from '../CreditInfoCard';
import { CreditProvider } from '../../../contexts/CreditContext';

// Mock del contexto de crédito
const mockCreditContext = {
  creditInfo: {
    available_credit: 1000,
    credit_limit: 5000,
    credit_status: 'active'
  },
  loading: false,
  error: null,
  refreshCreditInfo: jest.fn(),
  refreshDashboard: jest.fn(),
  createCreditOrder: jest.fn(),
  createPayment: jest.fn(),
  getOrderPayments: jest.fn()
};

// Mock del hook useCreditValidation
jest.mock('../../../hooks/useCreditValidation', () => ({
  useCreditValidation: () => ({
    getCreditStatusInfo: () => ({
      status: 'success',
      message: 'Crédito disponible',
      color: 'green',
      icon: '✅'
    }),
    getCreditUsagePercentage: () => 20
  })
}));

// Mock del componente LoadingSpinner
jest.mock('../../common/LoadingSpinner', () => ({
  LoadingSpinner: ({ size }: { size?: string }) => <div data-testid="loading-spinner">Loading...</div>
}));

const CreditInfoCardWithProvider = (props: any) => (
  <CreditProvider>
    <CreditInfoCard {...props} />
  </CreditProvider>
);

describe('CreditInfoCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders credit information correctly', () => {
    render(<CreditInfoCardWithProvider />);
    
    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  test('calls onRefresh when refresh button is clicked', () => {
    const mockOnRefresh = jest.fn();
    render(<CreditInfoCardWithProvider onRefresh={mockOnRefresh} />);
    
    const refreshButton = screen.getByTitle('Actualizar información');
    fireEvent.click(refreshButton);
    
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  test('shows loading state when loading', () => {
    const loadingContext = {
      ...mockCreditContext,
      loading: true,
      creditInfo: null
    };
    
    jest.doMock('../../../contexts/CreditContext', () => ({
      useCredit: () => loadingContext
    }));
    
    render(<CreditInfoCardWithProvider />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('shows error state when no credit info', () => {
    const errorContext = {
      ...mockCreditContext,
      creditInfo: null
    };
    
    jest.doMock('../../../contexts/CreditContext', () => ({
      useCredit: () => errorContext
    }));
    
    render(<CreditInfoCardWithProvider />);
    
    expect(screen.getByText('No se pudo cargar la información de crédito')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <CreditInfoCardWithProvider className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

