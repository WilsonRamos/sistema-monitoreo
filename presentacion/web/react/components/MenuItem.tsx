import React from 'react';
import { IMenuUIItem } from '../interfaces/IPresentationInterfaces';

interface MenuItemProps {
  item: IMenuUIItem;
  isActive: boolean;
  isExpanded: boolean;
  onItemClick: (itemId: string, path?: string) => void;
  onItemExpand: (itemId: string) => void;
  level?: number;
}

/**
 * Componente MenuItem
 * Single Responsibility Principle (SRP): Solo renderiza un item de menú
 * Open/Closed Principle (OCP): Extensible via props, cerrado para modificación
 */
export const MenuItem: React.FC<MenuItemProps> = ({
  item,
  isActive,
  isExpanded,
  onItemClick,
  onItemExpand,
  level = 0
}) => {
  // No renderizar si no es visible (permisos ya evaluados en el adaptador)
  if (!item.isVisible) {
    return null;
  }

  const hasChildren = item.children && item.children.length > 0;
  const indentClass = `menu-level-${level}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (hasChildren) {
      onItemExpand(item.id);
    } else {
      onItemClick(item.id, item.path);
    }
  };

  return (
    <li className={`menu-item ${indentClass} ${isActive ? 'active' : ''}`}>
      <a 
        href={item.path || '#'} 
        className={`menu-link ${hasChildren ? 'has-children' : ''}`}
        onClick={handleClick}
        aria-expanded={hasChildren ? isExpanded : undefined}
        role={hasChildren ? 'button' : 'link'}
      >
        {item.icon && (
          <i className={`menu-icon ${item.icon}`} aria-hidden="true"></i>
        )}
        <span className="menu-label">{item.label}</span>
        {hasChildren && (
          <i 
            className={`menu-arrow ${isExpanded ? 'expanded' : 'collapsed'}`}
            aria-hidden="true"
          >
            {isExpanded ? '▼' : '▶'}
          </i>
        )}
      </a>
      
      {hasChildren && isExpanded && item.children && (
        <ul className="submenu" role="menu">
          {item.children.map(child => (
            <MenuItem
              key={child.id}
              item={child}
              isActive={false} // Se puede mejorar con lógica de path matching
              isExpanded={false} // Los submenús empiezan colapsados
              onItemClick={onItemClick}
              onItemExpand={onItemExpand}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
