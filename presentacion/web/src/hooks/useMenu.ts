import { useState, useEffect, useCallback } from 'react';
import { IMenuItem, IMenuState, IMenuStateManager } from '../interfaces/menu.interfaces';

/**
 * Single Responsibility Principle (SRP)
 * Este hook tiene una única responsabilidad: gestionar el estado del menú en React
 */
export const useMenuState = (stateManager: IMenuStateManager) => {
  const [menuState, setMenuState] = useState<IMenuState>(stateManager.getState());

  useEffect(() => {
    const unsubscribe = stateManager.subscribe(setMenuState);
    return unsubscribe;
  }, [stateManager]);

  const setActiveItem = useCallback((itemId: string) => {
    stateManager.setActiveItem(itemId);
  }, [stateManager]);

  const toggleExpanded = useCallback((itemId: string) => {
    stateManager.toggleExpanded(itemId);
  }, [stateManager]);

  const updateItems = useCallback((items: IMenuItem[]) => {
    stateManager.updateItems(items);
  }, [stateManager]);

  return {
    menuState,
    setActiveItem,
    toggleExpanded,
    updateItems
  };
};

/**
 * Hook para gestionar la navegación
 */
export const useMenuNavigation = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  }, []);

  return {
    currentPath,
    navigate
  };
};
