export const API_BASE =  'http://localhost:3000/api';
export const STATIC_BASE = 'http://localhost:3000';

export const STATUS_COLORS = {
  AVAILABLE:  { bg: '#EAF3DE', fg: '#27500A' },
  RESERVED:   { bg: '#FAEEDA', fg: '#633806' },
  SOLD:       { bg: '#E6F1FB', fg: '#0C447C' },
  IN_SERVICE: { bg: '#EEEDFE', fg: '#3C3489' },
  PENDING:    { bg: '#FAEEDA', fg: '#633806' },
  CONFIRMED:  { bg: '#E6F1FB', fg: '#0C447C' },
  DELIVERED:  { bg: '#EAF3DE', fg: '#27500A' },
  CANCELLED:  { bg: '#FCEBEB', fg: '#791F1F' },
  REFUNDED:   { bg: '#FBEAF0', fg: '#72243E' },
};

export const BIKE_STATUSES    = ['AVAILABLE', 'RESERVED', 'SOLD', 'IN_SERVICE'];
export const SALE_STATUSES    = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
export const SUPPLIER_TYPES   = ['MANUFACTURER', 'DEALER', 'WHOLESALER', 'RETAILER', 'OTHER'];
export const PAYMENT_TYPES    = ['Full', 'FULL_AND_PENDING', 'DOWN_PAYMENT_AND_FINANCE', 'DOWN_PAYMENT_AND_FINANCE_AND_PENDING', 'OTHER'];
export const PAYMENT_METHODS  = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'CHEQUE', 'NET_BANKING', 'OTHER'];
export const MONTHS           = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

export const fmtINR = (n) =>
  n != null ? '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—';
