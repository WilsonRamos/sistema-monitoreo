import { IMenuState, IMenuStateManager, IMenuItem } from '../interfaces/menu.interfaces';

/**
 * Single Responsibility Principle (SRP)
 * Esta clase tiene una única responsabilidad: gestionar el estado del menú
 */
export class MenuStateManager implements IMenuStateManager {
  private state: IMenuState = {
    items: [],
    activeItem: null,
    expandedItems: []
  };

  private listeners: Array<(state: IMenuState) => void> = [];

  getState(): IMenuState {
    return { ...this.state };
  }

  setActiveItem(itemId: string): void {
    this.state = {
      ...this.state,
      activeItem: itemId
    };
    this.notifyListeners();
  }

  toggleExpanded(itemId: string): void {
    const expandedItems = [...this.state.expandedItems];
    const index = expandedItems.indexOf(itemId);
    
    if (index === -1) {
      expandedItems.push(itemId);
    } else {
      expandedItems.splice(index, 1);
    }

    this.state = {
      ...this.state,
      expandedItems
    };
    this.notifyListeners();
  }

  updateItems(items: IMenuItem[]): void {
    this.state = {
      ...this.state,
      items: [...items]
    };
    this.notifyListeners();
  }

  subscribe(listener: (state: IMenuState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }
}
