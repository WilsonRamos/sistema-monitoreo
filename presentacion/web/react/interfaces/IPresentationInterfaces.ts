/**
 * INTERFACES DE PRESENTACIÓN
 * Estas interfaces son SOLO para la capa de presentación
 * NO duplican el dominio - se conectan con él
 */

// Interfaz para el estado de la UI del menú
export interface IMenuUIState {
  activeItemId: string | null;
  expandedItems: string[];
  isLoading: boolean;
  error?: string;
}

// Interfaz para item de menú en la UI (sin lógica de negocio)
export interface IMenuUIItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: IMenuUIItem[];
  isVisible: boolean; // Resultado de evaluación de permisos del dominio
}

// Interfaz para props de componentes React
export interface IMenuComponentProps {
  items: IMenuUIItem[];
  onItemClick: (itemId: string, path?: string) => void;
  onItemExpand: (itemId: string) => void;
  currentState: IMenuUIState;
}

// Interfaz para adaptador que conecta React con TU dominio
export interface IDomainToUIAdapter {
  // Convierte datos del dominio a formato UI
  adaptMenuItems(domainItems: any[]): IMenuUIItem[];
  adaptUserPermissions(userRole: string): string[];
  
  // Maneja eventos de UI hacia el dominio
  handleNavigation(path: string): Promise<void>;
  handleMenuAction(actionType: string, payload: any): Promise<void>;
}

// Interfaz para contexto de la aplicación React
export interface IAppUIContext {
  currentUser: {
    role: string;
    permissions: string[];
  };
  currentRoute: string;
  isAuthenticated: boolean;
}

// Props para contenedor principal
export interface IAppContainerProps {
  domainServices: {
    equipoService: any; // Referencia a TU servicio del dominio
    monitoreoService: any; // Referencia a TU servicio del dominio
    operacionesService: any; // Referencia a TU servicio del dominio
  };
}
