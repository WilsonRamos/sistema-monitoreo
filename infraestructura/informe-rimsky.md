- comentario 01: Equipo no se puede implementar su CRUD porque es una clase Abstracta que será implementadas en Volquete y Excavadora (por ahora)

- Cuestión 01: en submódulo monitoreo, Equipo se debe crear y guardar en db la tabla Equipo y con dos campos para cada uno de sus heredados (SLI)? o por tablas separadas que serían 3 en total (TPT)?

opción 1: 
model Equipo {
  id             String       @id @default(uuid())
  codigo         String       @unique
  tipo           TipoEquipo   // <- Este campo indica si es VOLQUETE o EXCAVADORA
  estado         EstadoEquipo @default(DISPONIBLE)

  capacidadCarga Float?       // solo si tipo = VOLQUETE
  cargaActual    Float?

  tipoExcavacion String?      // solo si tipo = EXCAVADORA
  horasOperacion Int?
}
opción 2: <= (opción tomada por ahora 07/07)
model Equipo {
  id             String       @id @default(uuid())
  codigo         String       @unique
  tipo           TipoEquipo   // <- Este campo indica si es VOLQUETE o EXCAVADORA
  estado         EstadoEquipo @default(DISPONIBLE)

  capacidadCarga Float?       // solo si tipo = VOLQUETE
  cargaActual    Float?

  tipoExcavacion String?      // solo si tipo = EXCAVADORA
  horasOperacion Int?
}

- Cuestión 02: habrá confrictos si creo un enum de TipoEquipo? solo hay dos

- comentario 02: en el modelado de la arquitectura, el atributo operadorAsignado no fue declarado en la nueva implementacion hecha anteriormente

- comentario 03: crear enum para estado

- advertencia Sonar 01: en clase volquete, pide que maximo tenga 7 parametros en constructor