import { INavigationService, IPermissionService, IMenuStateManager } from '../interfaces/menu.interfaces';
import { NavigationService } from '../services/NavigationService';
import { PermissionService } from '../services/PermissionService';
import { MenuStateManager } from '../services/MenuStateManager';

/**
 * Dependency Inversion Principle (DIP)
 * Este contenedor nos permite inyectar dependencias y cambiar implementaciones
 * sin modificar el código cliente
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.registerDefaultServices();
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  public register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  public get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} no está registrado`);
    }
    return service as T;
  }

  public getNavigationService(): INavigationService {
    return this.get<INavigationService>('navigationService');
  }

  public getPermissionService(): IPermissionService {
    return this.get<IPermissionService>('permissionService');
  }

  public getMenuStateManager(): IMenuStateManager {
    return this.get<IMenuStateManager>('menuStateManager');
  }

  private registerDefaultServices(): void {
    // Registrar implementaciones por defecto
    this.register('navigationService', new NavigationService());
    this.register('permissionService', new PermissionService(['dashboard.view', 'recursos.view', 'reportes.view', 'analitica.view']));
    this.register('menuStateManager', new MenuStateManager());
  }

  // Método para cambiar implementaciones en tiempo de ejecución
  public replaceService<T>(key: string, newService: T): void {
    this.services.set(key, newService);
  }
}

/**
 * Factory para crear el contenedor con configuraciones específicas
 */
export class ServiceContainerFactory {
  public static createProductionContainer(): ServiceContainer {
    const container = ServiceContainer.getInstance();
    // Aquí puedes configurar servicios específicos para producción
    return container;
  }

  public static createTestContainer(): ServiceContainer {
    const container = new ServiceContainer();
    // Configurar mocks o servicios de prueba
    container.register('navigationService', new NavigationService());
    container.register('permissionService', new PermissionService(['admin']));
    container.register('menuStateManager', new MenuStateManager());
    return container;
  }
}
