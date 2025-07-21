import React from 'react';
import { IMenuItem } from '../interfaces/menu.interfaces';

interface MenuItemProps {
  item: IMenuItem;
  isActive: boolean;
  isExpanded: boolean;
  level: number;
  onItemClick: (item: IMenuItem) => void;
  onToggleExpand: (itemId: string) => void;
}

/**
 * Single Responsibility Principle (SRP)
 * Este componente tiene una única responsabilidad: renderizar un elemento del menú
 */
export const MenuItem: React.FC<MenuItemProps> = ({
  item,
  isActive,
  isExpanded,
  level,
  onItemClick,
  onToggleExpand
}) => {
  const handleClick = () => {
    if (item.children && item.children.length > 0) {
      onToggleExpand(item.id);
    } else {
      onItemClick(item);
    }
  };

  const hasChildren = item.children && item.children.length > 0;
  const indentClass = `menu-item-level-${level}`;

  return (
    <div className="menu-item-container">
      <div
        className={`menu-item ${isActive ? 'active' : ''} ${indentClass}`}
        onClick={handleClick}
        role="menuitem"
        tabIndex={0}
      >
        <div className="menu-item-content">
          {item.icon && <span className="menu-item-icon">{item.icon}</span>}
          <span className="menu-item-label">{item.label}</span>
          {hasChildren && (
            <span className={`menu-item-arrow ${isExpanded ? 'expanded' : ''}`}>
              ▼
            </span>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="menu-item-children">
          {item.children!.map(child => (
            <MenuItem
              key={child.id}
              item={child}
              isActive={child.id === item.id}
              isExpanded={false}
              level={level + 1}
              onItemClick={onItemClick}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};
