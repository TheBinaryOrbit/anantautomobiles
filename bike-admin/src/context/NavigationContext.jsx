import { createContext, useContext, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const NavigationContext = createContext(null);

// Central Blueprint Repository including strict target module permissions access mapping targets
export const MASTER_NAV_ITEMS = [
  { path: '/dashboard',      label: 'Dashboard',      iconName: 'LayoutDashboard', module: 'dashboard', action: 'view' },
  { path: '/bikes',          label: 'Bikes',          iconName: 'Bike',            module: 'bike',      action: 'view' },
  { path: '/bike-models',    label: 'Bike Models',    iconName: 'Layers',          module: 'bikeModel', action: 'view' },
  { path: '/accessories',    label: 'Accessories',    iconName: 'Wrench',          module: 'accessories', action: 'view' },
  { path: '/customers',      label: 'Customers',      iconName: 'Users',           module: 'customer',  action: 'view' },
  { path: '/suppliers',      label: 'Suppliers',      iconName: 'Building2',       module: 'supplier',  action: 'view' },
  { path: '/purchases',      label: 'Purchases',      iconName: 'Truck',           module: 'purchases', action: 'view' },
  { path: '/sales',          label: 'Sales',          iconName: 'ShoppingCart',    module: 'sales',     action: 'view' },
  { path: '/discounts',      label: 'Discounts',      iconName: 'Tag',             module: 'discounts', action: 'view' },
  { path: '/exchange-bikes', label: 'Exchange Bikes', iconName: 'RefreshCw',       module: 'exchange',  action: 'view' },
  { path: '/inquire-service',label: 'Service Inquiry', iconName: 'MessageCircle',   module: 'serviceInquiry', action: 'view' },
  { path: '/inquire-sales',  label: 'Sales Inquiry',   iconName: 'ShoppingBag',     module: 'salesInquiry', action: 'view' },
  { path: '/users',          label: 'Users',          iconName: 'User',            module: 'users',     action: 'view' },
  { path: '/roles',          label: 'Roles',          iconName: 'KeyRound',        module: 'role',      action: 'manage' },
];

export function NavigationProvider({ children }) {
  const { hasModulePermission, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('Dashboard');

  // Compute allowed menu navigation list options dynamically based on live persistent state array variables
  const allowedNavItems = useMemo(() => {
    if (!isAuthenticated) return [];
    
    return MASTER_NAV_ITEMS.filter(item => {
      // Special dashboard routing visibility rule
      if (item.module === 'dashboard') return true; 
      return hasModulePermission(item.module, item.action);
    });
  }, [hasModulePermission, isAuthenticated]);

  return (
    <NavigationContext.Provider value={{ page: currentPage, setPage: setCurrentPage, navItems: allowedNavItems }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);