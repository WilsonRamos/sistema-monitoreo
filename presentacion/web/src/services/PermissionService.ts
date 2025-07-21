import { IPermissionService } from '../interfaces/menu.interfaces';

/**
 * Single Responsibility Principle (SRP)
 * Esta clase tiene una única responsabilidad: gestionar permisos
 */
export class PermissionService implements IPermissionService {
  private userPermissions: string[] = [];

  constructor(userPermissions: string[] = []) {
    this.userPermissions = userPermissions;
  }

  hasPermission(permission: string): boolean {
    return this.userPermissions.includes(permission) || 
           this.userPermissions.includes('admin');
  }

  getUserPermissions(): string[] {
    return [...this.userPermissions];
  }

  setUserPermissions(permissions: string[]): void {
    this.userPermissions = [...permissions];
  }
}
