import { IMenuItem } from '../interfaces/menu.interfaces';

/**
 * Open/Closed Principle (OCP)
 * Esta factory está abierta para extensión pero cerrada para modificación
 * Podemos agregar nuevos tipos de menú sin modificar el código existente
 */
export abstract class MenuItemFactory {
  public static createMenuItem(
    id: string,
    label: string,
    type: 'dashboard' | 'recursos' | 'reportes' | 'analitica' | 'admin' | 'custom',
    options: Partial<IMenuItem> = {}
  ): IMenuItem {
    const baseItem: IMenuItem = {
      id,
      label,
      ...options
    };

    switch (type) {
      case 'dashboard':
        return this.createDashboardItem(baseItem);
      case 'recursos':
        return this.createRecursosItem(baseItem);
      case 'reportes':
        return this.createReportesItem(baseItem);
      case 'analitica':
        return this.createAnaliticaItem(baseItem);
      case 'admin':
        return this.createAdminItem(baseItem);
      case 'custom':
        return baseItem;
      default:
        throw new Error(`Tipo de menú no soportado: ${type}`);
    }
  }

  private static createDashboardItem(baseItem: IMenuItem): IMenuItem {
    return {
      ...baseItem,
      icon: '📊',
      path: '/dashboard',
      permissions: ['dashboard.view']
    };
  }

  private static createRecursosItem(baseItem: IMenuItem): IMenuItem {
    return {
      ...baseItem,
      icon: '🏗️',
      path: '/recursos',
      permissions: ['recursos.view'],
      children: [
        {
          id: 'recursos-equipos',
          label: 'Equipos',
          icon: '🚚',
          path: '/recursos/equipos',
          permissions: ['equipos.view']
        },
        {
          id: 'recursos-personal',
          label: 'Personal',
          icon: '👥',
          path: '/recursos/personal',
          permissions: ['personal.view']
        }
      ]
    };
  }

  private static createReportesItem(baseItem: IMenuItem): IMenuItem {
    return {
      ...baseItem,
      icon: '📈',
      path: '/reportes',
      permissions: ['reportes.view'],
      children: [
        {
          id: 'reportes-produccion',
          label: 'Producción',
          icon: '⛏️',
          path: '/reportes/produccion',
          permissions: ['reportes.produccion.view']
        },
        {
          id: 'reportes-mantenimiento',
          label: 'Mantenimiento',
          icon: '🔧',
          path: '/reportes/mantenimiento',
          permissions: ['reportes.mantenimiento.view']
        }
      ]
    };
  }

  private static createAnaliticaItem(baseItem: IMenuItem): IMenuItem {
    return {
      ...baseItem,
      icon: '📊',
      path: '/analitica',
      permissions: ['analitica.view']
    };
  }

  private static createAdminItem(baseItem: IMenuItem): IMenuItem {
    return {
      ...baseItem,
      icon: '⚙️',
      path: '/admin',
      permissions: ['admin.view']
    };
  }
}

/**
 * Configuración predefinida del menú basada en la imagen
 */
export class MenuConfigurationFactory {
  public static createDefaultMenuConfiguration(): IMenuItem[] {
    return [
      MenuItemFactory.createMenuItem('dashboard', 'Dashboard', 'dashboard'),
      MenuItemFactory.createMenuItem('recursos', 'Recursos', 'recursos'),
      MenuItemFactory.createMenuItem('reportes', 'Reportes', 'reportes'),
      MenuItemFactory.createMenuItem('analitica', 'Analítica', 'analitica'),
      MenuItemFactory.createMenuItem('admin', 'admin', 'admin')
    ];
  }
}
