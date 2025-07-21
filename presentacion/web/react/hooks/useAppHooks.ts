import { useState, useEffect, useCallback } from 'react';
import { IMenuUIState, IMenuUIItem, IAppUIContext } from '../interfaces/IPresentationInterfaces';
import { DomainToUIAdapter } from '../adapters/DomainToUIAdapter';

/**
 * Hook para gestión del estado del menú
 * Single Responsibility Principle (SRP): Solo maneja estado de UI del menú
 * 
 * Se conecta con TU dominio a través del adaptador
 */
export function useMenuUI() {
  const [menuState, setMenuState] = useState<IMenuUIState>({
    activeItemId: null,
    expandedItems: [],
    isLoading: true,
    error: undefined
  });

  const [menuItems, setMenuItems] = useState<IMenuUIItem[]>([]);
  const adapter = new DomainToUIAdapter();

  // Inicializar menú con permisos del usuario
  const initializeMenu = useCallback(async (userPermissions: string[]) => {
    try {
      setMenuState(prev => ({ ...prev, isLoading: true }));
      
      const adaptedItems = adapter.adaptMenuItems(userPermissions);
      setMenuItems(adaptedItems);
      
      setMenuState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: undefined 
      }));
    } catch (error) {
      setMenuState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Error cargando menú' 
      }));
    }
  }, [adapter]);

  // Manejar click en item del menú
  const handleItemClick = useCallback(async (itemId: string, path?: string) => {
    setMenuState(prev => ({ ...prev, activeItemId: itemId }));
    
    if (path) {
      await adapter.handleNavigation(path);
    }
  }, [adapter]);

  // Manejar expansión/colapso de items
  const handleItemExpand = useCallback((itemId: string) => {
    setMenuState(prev => ({
      ...prev,
      expandedItems: prev.expandedItems.includes(itemId)
        ? prev.expandedItems.filter(id => id !== itemId)
        : [...prev.expandedItems, itemId]
    }));
  }, []);

  return {
    menuState,
    menuItems,
    initializeMenu,
    handleItemClick,
    handleItemExpand
  };
}

/**
 * Hook para contexto de la aplicación
 * Conecta con TU sistema de autenticación y permisos del dominio
 */
export function useAppContext() {
  const [appContext, setAppContext] = useState<IAppUIContext>({
    currentUser: {
      role: 'supervisor', // En producción vendría de TU servicio de autenticación
      permissions: []
    },
    currentRoute: '/',
    isAuthenticated: true // En producción vendría de TU dominio
  });

  const adapter = new DomainToUIAdapter();

  // Inicializar contexto
  useEffect(() => {
    // Aquí se conectaría con TU servicio de usuarios del dominio
    const userPermissions = adapter.adaptUserPermissions(appContext.currentUser.role);
    
    setAppContext(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        permissions: userPermissions
      }
    }));
  }, [appContext.currentUser.role, adapter]);

  // Actualizar ruta actual
  const updateCurrentRoute = useCallback((route: string) => {
    setAppContext(prev => ({ ...prev, currentRoute: route }));
  }, []);

  // Cambiar usuario (para testing o cambio de rol)
  const changeUserRole = useCallback((role: string) => {
    setAppContext(prev => ({
      ...prev,
      currentUser: { role, permissions: [] }
    }));
  }, []);

  return {
    appContext,
    updateCurrentRoute,
    changeUserRole
  };
}

/**
 * Hook para conectar con TUS servicios del dominio
 * Interface Segregation Principle (ISP): Cada hook tiene responsabilidad específica
 */
export function useDomainServices() {
  // Aquí se inyectarían TUS servicios reales del dominio
  const [services] = useState({
    // En producción estos vendrían de tu contenedor de DI
    equipoService: null, // Tu EquipoService del dominio
    monitoreoService: null, // Tu MonitoreoService del dominio  
    operacionesService: null, // Tu OperacionesService del dominio
    turnoService: null, // Tu TurnoService del dominio
    usuariosService: null // Tu UsuariosService del dominio
  });

  // Método para inyectar servicios reales
  const injectServices = useCallback((domainServices: any) => {
    // Actualizar con TUS servicios reales
    console.log('🔧 Inyectando servicios del dominio:', domainServices);
  }, []);

  return {
    services,
    injectServices
  };
}

/**
 * Hook principal que orquesta toda la aplicación React
 * Dependency Inversion Principle (DIP): Depende de abstracciones
 */
export function useMainApp() {
  const { appContext, updateCurrentRoute, changeUserRole } = useAppContext();
  const { menuState, menuItems, initializeMenu, handleItemClick, handleItemExpand } = useMenuUI();
  const { services, injectServices } = useDomainServices();

  // Inicializar aplicación
  useEffect(() => {
    if (appContext.currentUser.permissions.length > 0) {
      initializeMenu(appContext.currentUser.permissions);
    }
  }, [appContext.currentUser.permissions, initializeMenu]);

  // Escuchar eventos de navegación
  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      updateCurrentRoute(event.detail.path);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('navigation', handleNavigation as EventListener);
      return () => {
        window.removeEventListener('navigation', handleNavigation as EventListener);
      };
    }
  }, [updateCurrentRoute]);

  return {
    // Estado de la aplicación
    appContext,
    menuState,
    menuItems,
    services,
    
    // Acciones
    handleItemClick,
    handleItemExpand,
    changeUserRole,
    injectServices
  };
}
