import React from 'react';
import { IMenuItem, IPermissionService } from '../interfaces/menu.interfaces';
import { MenuItem } from './MenuItem';
import { useMenuState, useMenuNavigation } from '../hooks/useMenu';
import { MenuStateManager } from '../services/MenuStateManager';

interface MenuProps {
  items: IMenuItem[];
  permissionService: IPermissionService;
  stateManager: MenuStateManager;
}

/**
 * Single Responsibility Principle (SRP)
 * Este componente tiene una única responsabilidad: renderizar el menú completo
 * 
 * Dependency Inversion Principle (DIP)
 * Depende de abstracciones (interfaces) no de implementaciones concretas
 */
export const Menu: React.FC<MenuProps> = ({ items, permissionService, stateManager }) => {
  const { menuState, setActiveItem, toggleExpanded } = useMenuState(stateManager);
  const { navigate } = useMenuNavigation();

  React.useEffect(() => {
    // Filtrar elementos basado en permisos
    const filteredItems = filterMenuItemsByPermissions(items, permissionService);
    stateManager.updateItems(filteredItems);
  }, [items, permissionService, stateManager]);

  const handleItemClick = (item: IMenuItem) => {
    setActiveItem(item.id);
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleToggleExpand = (itemId: string) => {
    toggleExpanded(itemId);
  };

  return (
    <nav className="menu-container" role="navigation" aria-label="Main menu">
      <div className="menu-header">
        <h2>Sistema de Monitoreo</h2>
      </div>
      <div className="menu-items">
        {menuState.items.map(item => (
          <MenuItem
            key={item.id}
            item={item}
            isActive={menuState.activeItem === item.id}
            isExpanded={menuState.expandedItems.includes(item.id)}
            level={0}
            onItemClick={handleItemClick}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </div>
    </nav>
  );
};

/**
 * Open/Closed Principle (OCP)
 * Esta función está abierta para extensión, podemos agregar nuevas reglas de filtrado
 */
function filterMenuItemsByPermissions(
  items: IMenuItem[],
  permissionService: IPermissionService
): IMenuItem[] {
  return items
    .filter(item => {
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }
      return item.permissions.some(permission => 
        permissionService.hasPermission(permission)
      );
    })
    .map(item => ({
      ...item,
      children: item.children 
        ? filterMenuItemsByPermissions(item.children, permissionService)
        : undefined
    }));
}
