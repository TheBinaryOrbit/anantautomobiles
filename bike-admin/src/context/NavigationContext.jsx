import { createContext, useContext, useState } from 'react';

const NavigationContext = createContext(null);

export const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: 'LayoutDashboard' },
  { id: 'bikes',        label: 'Bikes',        icon: 'Bike' },
  { id: 'bike-models',  label: 'Bike Models',  icon: 'Layers' },
  { id: 'accessories',  label: 'Wrench',       icon: 'Wrench' },
  { id: 'customers',    label: 'Customers',    icon: 'Users' },
  { id: 'suppliers',    label: 'Suppliers',    icon: 'Building2' },
  { id: 'sales',        label: 'Sales',        icon: 'ShoppingCart' },
  { id: 'roles',        label: 'Roles',        icon: 'KeyRound' },
  { id: 'permissions',  label: 'Permissions',  icon: 'ShieldCheck' },
];

export function NavigationProvider({ children }) {
  const [page, setPage] = useState('dashboard');

  return (
    <NavigationContext.Provider value={{ page, navigate: setPage, navItems: NAV_ITEMS }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);
