import { createContext, useContext } from 'react';

// Shared with FarmContext.jsx (the provider). The context object and the hook
// live here so the provider file exports only a component - otherwise Fast
// Refresh gives up on the whole context module.
export const FarmContext = createContext(null);

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used within FarmProvider');
  return context;
}
