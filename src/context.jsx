import { createContext, useContext } from 'react';

/**
 * AppContext provides theme (T), computed styles (ss), font, and nav()
 * to every component tree without prop-drilling.
 *
 * Usage:
 *   const { T, ss, font, nav } = useApp();
 */
export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);
