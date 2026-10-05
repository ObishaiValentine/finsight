import { useState } from 'react';
import { NavigationContext } from './NavigationContext';

export function NavigationProvider({ children }) {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <NavigationContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </NavigationContext.Provider>
  );
}