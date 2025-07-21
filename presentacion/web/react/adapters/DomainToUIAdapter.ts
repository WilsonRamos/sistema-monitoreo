import { IDomainToUIAdapter, IMenuUIItem, IAppUIContext } from '../interfaces/IPresentationInterfaces';

/**
 * ADAPTADOR - Patrón Adapter
 * Conecta React (presentación) con TU arquitectura DDD existente
 * 
 * Single Responsibility Principle (SRP): 
 * Solo adapta datos entre dominio y presentación
 */
export class DomainToUIAdapter implements IDomainToUIAdapter {
  
  private readonly menuConfiguration = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      path: '/dashboard',
      permissions: ['view_dashboard']
    },
    {
      id: 'monitoreo',
      label: 'Monitoreo',
      icon: 'fas fa-eye',
      permissions: ['view_monitoring'],
      children: [
        {
          id: 'equipos',
          label: 'Equipos',
          icon: 'fas fa-truck',
          path: '/monitoreo/equipos',
          permissions: ['view_equipment']
        },
        {
          id: 'ubicacion-tiempo-real',
          label: 'Ubicación Tiempo Real',
          icon: 'fas fa-map-marker-alt',
          path: '/monitoreo/ubicacion',
          permissions: ['view_real_time_location']
        },
        {
          id: 'estado-equipos',
          label: 'Estado de Equipos',
          icon: 'fas fa-cogs',
          path: '/monitoreo/estado',
          permissions: ['view_equipment_status']
        }
      ]
    },
    {
      id: 'operaciones',
      label: 'Operaciones',
      icon: 'fas fa-industry',
      permissions: ['view_operations'],
      children: [
        {
          id: 'ciclo-transporte',
          label: 'Ciclo de Transporte',
          icon: 'fas fa-sync-alt',
          path: '/operaciones/ciclo-transporte',
          permissions: ['view_transport_cycle']
        },
        {
          id: 'operacion-cargue',
          label: 'Operación de Cargue',
          icon: 'fas fa-upload',
          path: '/operaciones/cargue',
          permissions: ['view_loading_operations']
        },
        {
          id: 'kpis',
          label: 'KPIs',
          icon: 'fas fa-chart-bar',
          path: '/operaciones/kpis',
          permissions: ['view_kpis']
        }
      ]
    },
    {
      id: 'mina',
      label: 'Gestión de Mina',
      icon: 'fas fa-mountain',
      permissions: ['view_mine_management'],
      children: [
        {
          id: 'frentes',
          label: 'Frentes de Trabajo',
          icon: 'fas fa-hard-hat',
          path: '/mina/frentes',
          permissions: ['view_work_fronts']
        },
        {
          id: 'zonas',
          label: 'Zonas',
          icon: 'fas fa-map',
          path: '/mina/zonas',
          permissions: ['view_zones']
        }
      ]
    },
    {
      id: 'turnos',
      label: 'Gestión de Turnos',
      icon: 'fas fa-clock',
      permissions: ['view_shift_management'],
      children: [
        {
          id: 'turnos-activos',
          label: 'Turnos Activos',
          icon: 'fas fa-play-circle',
          path: '/turnos/activos',
          permissions: ['view_active_shifts']
        },
        {
          id: 'ciclos',
          label: 'Ciclos',
          icon: 'fas fa-repeat',
          path: '/turnos/ciclos',
          permissions: ['view_cycles']
        }
      ]
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: 'fas fa-users',
      permissions: ['view_user_management'],
      children: [
        {
          id: 'lista-usuarios',
          label: 'Lista de Usuarios',
          icon: 'fas fa-list',
          path: '/usuarios/lista',
          permissions: ['view_users']
        }
      ]
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: 'fas fa-file-alt',
      permissions: ['view_reports'],
      children: [
        {
          id: 'reporte-produccion',
          label: 'Reporte de Producción',
          icon: 'fas fa-chart-line',
          path: '/reportes/produccion',
          permissions: ['view_production_reports']
        }
      ]
    }
  ];

  /**
   * Adapta items de menú según permisos del usuario
   * Conecta con TU sistema de permisos del dominio
   */
  adaptMenuItems(userPermissions: string[]): IMenuUIItem[] {
    return this.menuConfiguration
      .map(item => this.adaptMenuItem(item, userPermissions))
      .filter(item => item.isVisible);
  }

  private adaptMenuItem(item: any, userPermissions: string[]): IMenuUIItem {
    // Verificar si el usuario tiene permiiso para ver este item
    const hasPermission = item.permissions?.some((permission: string) => 
      userPermissions.includes(permission) || userPermissions.includes('admin')
    ) ?? true;

    const adaptedItem: IMenuUIItem = {
      id: item.id,
      label: item.label,
      icon: item.icon,
      path: item.path,
      isVisible: hasPermission,
      children: item.children 
        ? item.children
            .map((child: any) => this.adaptMenuItem(child, userPermissions))
            .filter((child: IMenuUIItem) => child.isVisible)
        : undefined
    };

    // Si no tiene hijos visibles y no tiene path propio, no es visible
    if (!adaptedItem.path && (!adaptedItem.children || adaptedItem.children.length === 0)) {
      adaptedItem.isVisible = false;
    }

    return adaptedItem;
  }

  /**
   * Adapta permisos según rol de usuario
   * En producción, esto vendría de TU servicio de usuarios del dominio
   */
  adaptUserPermissions(userRole: string): string[] {
    const rolePermissions: { [key: string]: string[] } = {
      admin: ['admin'],
      supervisor: [
        'view_dashboard',
        'view_monitoring',
        'view_equipment',
        'view_real_time_location',
        'view_equipment_status',
        'view_operations',
        'view_transport_cycle',
        'view_loading_operations',
        'view_kpis',
        'view_mine_management',
        'view_work_fronts',
        'view_zones',
        'view_shift_management',
        'view_active_shifts',
        'view_cycles',
        'view_user_management',
        'view_users',
        'view_reports',
        'view_production_reports'
      ],
      operator: [
        'view_dashboard',
        'view_monitoring',
        'view_equipment',
        'view_real_time_location',
        'view_equipment_status',
        'view_operations',
        'view_transport_cycle',
        'view_loading_operations'
      ],
      viewer: [
        'view_dashboard',
        'view_monitoring',
        'view_equipment',
        'view_real_time_location'
      ]
    };

    return rolePermissions[userRole] || rolePermissions.viewer;
  }

  /**
   * Maneja navegación - se conecta con TU sistema de rutas
   */
  async handleNavigation(path: string): Promise<void> {
    console.log(`🧭 Navegando a: ${path}`);
    
    // Aquí se conectaría con TU sistema de routing del dominio
    // Por ejemplo: this.navigationService.navigate(path);
    
    // Actualizar URL del navegador
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', path);
    }

    // Emitir evento para componentes que lo necesiten
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('navigation', { 
        detail: { path } 
      }));
    }
  }

  /**
   * Maneja acciones del menú - se conecta con TUS casos de uso
   */
  async handleMenuAction(actionType: string, payload: any): Promise<void> {
    console.log(`⚡ Acción de menú: ${actionType}`, payload);
    
    // Aquí se conectarían con TUS casos de uso del dominio
    switch (actionType) {
      case 'LOAD_EQUIPOS':
        // await this.equipoService.obtenerEquipos();
        break;
      case 'START_MONITORING':
        // await this.monitoreoService.iniciarMonitoreo();
        break;
      case 'GENERATE_REPORT':
        // await this.reporteService.generarReporte(payload.type);
        break;
      default:
        console.warn(`Acción no manejada: ${actionType}`);
    }
  }
}
