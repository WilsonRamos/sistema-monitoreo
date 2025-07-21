// Interface Segregation Principle (ISP)
// Separamos las interfaces en contratos específicos y cohesivos

export interface IMenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: IMenuItem[];
  isActive?: boolean;
  permissions?: string[];
}

export interface IMenuItemClickHandler {
  handleClick(item: IMenuItem): void;
}

export interface IMenuRenderer {
  render(items: IMenuItem[]): JSX.Element;
}

export interface IMenuState {
  items: IMenuItem[];
  activeItem: string | null;
  expandedItems: string[];
}

export interface IMenuStateManager {
  getState(): IMenuState;
  setActiveItem(itemId: string): void;
  toggleExpanded(itemId: string): void;
  updateItems(items: IMenuItem[]): void;
  subscribe(listener: (state: IMenuState) => void): () => void;
}

export interface INavigationService {
  navigate(path: string): void;
  getCurrentPath(): string;
}

export interface IPermissionService {
  hasPermission(permission: string): boolean;
  getUserPermissions(): string[];
}

// Liskov Substitution Principle (LSP)
// Las implementaciones deben ser intercambiables
export interface IMenuComponent {
  render(): JSX.Element;
}

export interface IMenuItemComponent extends IMenuComponent {
  item: IMenuItem;
  isActive: boolean;
  onItemClick: IMenuItemClickHandler['handleClick'];
}
