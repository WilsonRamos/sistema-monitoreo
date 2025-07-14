# Estilos de Programación Aplicados en `ExcavadoraRepositorio`

Este repositorio aplica diversos estilos de programación en la implementación de la clase `ExcavadoraRepositorio`, responsable de gestionar operaciones CRUD sobre Excavadoras utilizando Prisma como ORM.

Estilos aplicados:

---

## 1. Cookbook Style

El estilo Cookbook organiza las tareas como una receta paso a paso. En el método `guardar`, se observa una clara separación y secuencia de operaciones: primero se crea un `Equipo`, luego se crea la `Excavadora` asociada. Dando claridad y orden lógico que mejora la legibilidad y mantenimiento.

```ts
async guardar(excavadora: Excavadora): Promise<void> {
// 1. Crear equipo asociado
  await prisma.equipo.create({ ... });

  // 2. Crear entidad Excavadora
  await prisma.excavadora.create({ ... });
}
```

---

## 2. Pipeline Style

En el método `listar`, los datos siguen una cadena de transformación (pipeline). Se consulta la base de datos, se mapean los resultados y se construyen objetos de dominio. Favorece un flujo de datos limpio y transformaciones funcionales.

```ts
async listar(): Promise<Excavadora[]> {
  const excavadoras = await prisma.excavadora.findMany({ include: { ... } });

  return excavadoras.map(e => {
    const operador = new Operador(...);
    return new Excavadora(...);
  });
}
```

---

## 3. Persistent Tables Style

El código interactúa con una base de datos relacional (PostgreSQL) utilizando Prisma. Las entidades (`Equipo`, `Excavadora`, `Operador`) se reflejan en tablas persistentes con relaciones entre ellas. Uso estructurado de la persistencia, aprovechando el diseño relacional.


```ts
await prisma.excavadora.create({
  data: {
    id: excavadora.id,
    tipoExcavacion: excavadora.tipo
  }
});
```

---

## 4. Error / Exception Handling (implícito)

Aunque no se usan bloques `try/catch`, se asume que los errores lanzados por Prisma pueden ser capturados en niveles superiores de la aplicación. Esto permite robustez ante fallos sin saturar el repositorio con lógica de errores.

```ts
await prisma.equipo.create({ ... }); // Puede lanzar un error si algo falla
```

**Recomendación futura**:

```ts
try {
  await prisma.equipo.create({ ... });
} catch (error) {
  console.error("Error al guardar:", error);
  throw new Error("Fallo al guardar excavadora");
}
```