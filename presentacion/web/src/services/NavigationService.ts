import { INavigationService } from '../interfaces/menu.interfaces';

/**
 * Single Responsibility Principle (SRP)
 * Esta clase tiene una única responsabilidad: manejar la navegación
 */
export class NavigationService implements INavigationService {
  private currentPath: string = '/';

  navigate(path: string): void {
    this.currentPath = path;
    // En una implementación real, aquí usarías React Router
    window.history.pushState({}, '', path);
  }

  getCurrentPath(): string {
    return this.currentPath || window.location.pathname;
  }
}
