export const API_BASE =  'https://api.anantautomobiles.com/api';
export const STATIC_BASE = 'https://api.anantautomobiles.com';

// export const API_BASE =  'http://localhost:3000/api';
// export const STATIC_BASE = 'http://localhost:3000';

export const STATUS_COLORS = {
  AVAILABLE:  { bg: '#EAF3DE', fg: '#27500A' },
  RESERVED:   { bg: '#FAEEDA', fg: '#633806' },
  SOLD:       { bg: '#E6F1FB', fg: '#0C447C' },
  IN_SERVICE: { bg: '#EEEDFE', fg: '#3C3489' },
  PDI:        { bg: '#E0F2FE', fg: '#0369A1' },
  PENDING:    { bg: '#FAEEDA', fg: '#633806' },
  CONFIRMED:  { bg: '#E6F1FB', fg: '#0C447C' },
  DELIVERED:  { bg: '#EAF3DE', fg: '#27500A' },
  CANCELLED:  { bg: '#FCEBEB', fg: '#791F1F' },
  REFUNDED:   { bg: '#FBEAF0', fg: '#72243E' },
};

export const STOCK_TYPE = {
  IN_STOCK: { bg: '#EAF3DE', fg: '#27500A' },
  PRE_ORDER: { bg: '#FCEBEB', fg: '#791F1F' },
};

export const BIKE_STATUSES    = ['AVAILABLE', 'RESERVED', 'SOLD', 'IN_SERVICE'];
export const STOCK_TYPES      = ['IN_STOCK', 'PRE_ORDER'];
export const SALE_STATUSES    = ['PDI', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
export const SUPPLIER_TYPES   = ['MANUFACTURER', 'DEALER', 'WHOLESALER', 'RETAILER', 'OTHER'];
export const PAYMENT_TYPES    = [
  'FULL_PAYMENT', 
  'PARTIAL_PAYMENT_AND_PENDING', 
  'PARTIAL_PAYMENT_AND_PENDING_AND_FINANCE', 
  'DOWN_PAYMENT_AND_FINANCE', 
  'FULL_FINANCE',
  'OTHER'
];
export const PAYMENT_METHODS  = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'CHEQUE', 'NET_BANKING', 'FINANCE', 'OTHER'];
export const MONTHS           = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

export const fmtINR = (num) => `₹${(num || 0).toLocaleString('en-IN')}`;

export const COLORS = ['Red', 'Black', 'Blue', 'White', 'Silver', 'Grey', 'Yellow', 'Green', 'Other'];

export const VIN_YEAR_MAP = {
  A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016, H: 2017, J: 2018, K: 2019, L: 2020, M: 2021, N: 2022, P: 2023, R: 2024, S: 2025, T: 2026, V: 2027, W: 2028, X: 2029, Y: 2030,
  1: 2001, 2: 2002, 3: 2003, 4: 2004, 5: 2005, 6: 2006, 7: 2007, 8: 2008, 9: 2009,
};
