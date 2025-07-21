import React from 'react';
import { MenuItem } from './MenuItem';
import { IMenuComponentProps } from '../interfaces/IPresentationInterfaces';

/**
 * Componente Menu Principal
 * Single Responsibility Principle (SRP): Solo renderiza la estructura del menú
 * Liskov Substitution Principle (LSP): Puede recibir cualquier implementación de props
 */
export const Menu: React.FC<IMenuComponentProps> = ({
  items,
  onItemClick,
  onItemExpand,
  currentState
}) => {
  if (currentState.isLoading) {
    return (
      <nav className="main-menu loading" role="navigation" aria-label="Menú principal">
        <div className="menu-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Cargando menú...</span>
        </div>
      </nav>
    );
  }

  if (currentState.error) {
    return (
      <nav className="main-menu error" role="navigation" aria-label="Menú principal">
        <div className="menu-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{currentState.error}</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="main-menu" role="navigation" aria-label="Menú principal">
      <div className="menu-header">
        <h2>📊 Sistema Monitoreo</h2>
      </div>
      
      <ul className="menu-list" role="menubar">
        {items.map(item => (
          <MenuItem
            key={item.id}
            item={item}
            isActive={currentState.activeItemId === item.id}
            isExpanded={currentState.expandedItems.includes(item.id)}
            onItemClick={onItemClick}
            onItemExpand={onItemExpand}
          />
        ))}
      </ul>
    </nav>
  );
};
