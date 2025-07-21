import React from 'react';
import { Menu } from './components/Menu';
import { MenuConfigurationFactory } from './factories/MenuFactory';
import { ServiceContainer } from './services/ServiceContainer';
import './styles/Menu.css';

/**
 * Aplicación principal que implementa todos los principios SOLID
 * 
 * Dependency Inversion Principle (DIP) - Usa inyección de dependencias
 * Single Responsibility Principle (SRP) - Solo se encarga de orquestar la aplicación
 */
const App: React.FC = () => {
  // Inyección de dependencias usando el contenedor
  const serviceContainer = ServiceContainer.getInstance();
  const permissionService = serviceContainer.getPermissionService();
  const stateManager = serviceContainer.getMenuStateManager();

  // Configuración del menú usando Factory
  const menuItems = MenuConfigurationFactory.createDefaultMenuConfiguration();

  return (
    <div className="app">
      <Menu 
        items={menuItems}
        permissionService={permissionService}
        stateManager={stateManager}
      />
      <main className="main-content">
        <div className="content-area">
          <h1>Sistema de Monitoreo Minero</h1>
          <p>Selecciona una opción del menú para navegar</p>
        </div>
      </main>
    </div>
  );
};

export default App;
