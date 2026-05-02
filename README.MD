# Defensa básica contra abuso y ataques tipo DDoS
## Trabajo Práctico N° 1 de la materia Prácticas Profesionalizantes III
 
**Equipo de desarrollo:** Augusto Rodríguez y Rolando Villegas

Para cumplir con este trabajo hemos utilizado el Sistema de Gestión de Guardias Médicas Versión 01, que desarrollamos para la materia Prácticas Profesionalizantes II durante 2025.

Esta aplicación tiene los endpoints necesarios para implementar una defensa contra ataques DDoS, además de contar con un registro de eventos (logging) corriendo con RabbitMQ para registrar las operaciones de la API.


# Sobre el SGGM – Sistema de Gestión de Guardias Médicas Versión 01 
Backend desarrollado por **Rolando Villegas** y **Augusto Rodríguez** para la materia Práctica Profesionalizante II, de la carrera Técnico Superior en Desarrollo de Software Full Stack del Instituto Técnico Superior Cipolletti (ITS).

---

## Descripción general

SGGM es un backend desarrollado en Node.js y diseñado para gestionar de forma integral las guardias médicas de los servicios de una institución de salud.

Incluye servicios de autenticación, autorización por roles, manejo de profesionales, especialidades, registros de guardias, usuarios y un sistema de auditoría/logging integrado mediante **RabbitMQ**. Respeta las buenas prácticas de arquitectura modular, validación, seguridad y documentación, recomendadas en el desarrollo de aplicaciones.

---

## Tecnologías utilizadas

- **Node.js + Express**
- **TypeORM**
- **MySQL**
- **RabbitMQ** (para auditoría y registro de eventos)
- **JWT + Passport**
- **Joi** (validación de datos)
- **Docker / Docker Compose** (solo en VPS, no se incluye en el repositorio)
- **dotenv**
- **Nodemon** (en modo desarrollo)

---

## Estructura del proyecto

```
sggm/
├── public/                         # Archivos estáticos (si aplica)
├── src/
│   ├── app.js                      # Configuración principal de Express (middlewares globales, rutas)
│   ├── index.js                    # Punto de entrada: levanta el servidor HTTP
│   ├── configuration/              # Configuración de entorno y autenticación
│   │   ├── envs.js                 # Carga y validación de variables de entorno
│   │   └── passport.js             # Estrategia JWT para Passport
│   ├── logging/                    # Integración con el módulo de logging / RabbitMQ
│   │   └── logger.js
│   ├── middlewares/                # Middlewares reutilizables
│   │   ├── audit-logger.js         # Auditoría de requests (envío de eventos al ingestor)
│   │   ├── auth.middleware.js      # Autenticación (verifica el token)
│   │   ├── authorize.middleware.js # Autorización por rol / permisos
│   │   └── validator.middleware.js # Validación de datos con Joi
│   ├── modules/                    # Módulos de dominio (vertical slice)
│   │   ├── profesional/            # Módulo Profesional
│   │   │   ├── profesional.controller.js
│   │   │   ├── profesional.route.js
│   │   │   ├── entity/
│   │   │   │   └── profesional.entity.js
│   │   │   └── schema/
│   │   │       └── profesional.schema.js
│   │   ├── usuario/                # Módulo Usuario y sus archivos
│   │   ├── novedad/                # Módulo Novedad y sus archivos
│   │   ├── servicio/               # Módulo Servicio y sus archivos
│   │   └── servicioDTT/             # Módulo Servicio Datatech y sus archivos
│   ├── providers/                  # Acceso a infraestructura
│   │   ├── datasource.provider.js  # Configuración y creación de DataSource (TypeORM)
│   │   └── rabbitmq.provider.js    # Conexión al broker RabbitMQ
│   └── utils/
│       └── client-ip.js            # Utilidad para obtener IP del cliente
├── .env.template                   # Plantilla de variables de entorno
├── package.json
└── package-lock.json
```
**Nota**: elegimos desarrollar la aplicación siguiendo una estructura modular (vertical slice). Cada entidad está encapsulada en un módulo, con todo lo que necesita para funcionar. En cada módulo programamos las entidades, los controladores y las rutas asociadas, para así obtener un código más fácil de mantener y escalar.

---

## Diagrama de entidades (ERD)

El siguiente diagrama representa el modelo de datos utilizado. Incluye las entidades **Usuario**, **Profesional**, **Servicio**, **ServicioDtt** y **Novedad**, junto con sus relaciones lógicas.


![Diagrama ERD del SGGM](/docs/sggm_erd.png)

---

## Seguridad

El proyecto implementa:

- JWT para acceso seguro
- Passport.js para validar tokens
- Middlewares:
  - `auth.middleware.js`
  - `authorize.middleware.js`
  - `validator.middleware.js`
  - `audit-logger.js` (envío automático de logs al ingestor)

Todos los endpoints protegidos requieren token.

---

## Módulos principales

### Usuario

- Login (JWT)
- ABM de usuarios
- Roles y permisos
- Validación con Joi

### Profesional

- Gestión de profesionales del sanatorio
- ABM
- Integración conceptual con Sistema Datatech
- Validación con Joi

### Servicio

- Gestión de los servicios médicos del sanatorio
- ABM
- Coordinador del servicio asignado por usuario
- Soporte de borrado lógico

### ServicioDTT

- Catálogo de servicios provenientes de Datatech
- Consulta por código y descripción
- ABM básico
- Mantiene sincronización conceptual con el ERP

### Novedad

- Registro de asistencias de guardia
- Fecha/hora de inicio y fin de cada turno
- Relación con profesional y servicio
- Campos de auditoría y borrado lógico

### Auditoría / Logging

- Middleware que registra operaciones clave
- Envío de eventos a RabbitMQ
- Obtención de IP del cliente
- Integración con ingestor externo de logs

---
## Instalación

### 1. Clonar este repositorio

### 2. Crear archivo `.env`

Utilizar como base el archivo ```.env.template``` y completar las variables necesarias:

```
PORT=3001
JWT_SECRET=mi_secreto
DB_HOST=mysql
DB_USER=root
DB_PASS=123456
DB_NAME=sggm
RABBIT_URL=amqp://guest:guest@rabbitmq:5672
```

### 3. Instalar dependencias

```
npm install
```

### 4. Modo desarrollo

```
npm run dev
```

### 5. Modo producción

```
npm start
```

---
## Documentación de la API (Postman)

La documentación oficial de la API del SGGM está disponible en:

https://documenter.getpostman.com/view/44031312/2sB3WtsJmx

Incluye ejemplos, parámetros, esquemas de validación y todas las respuestas posibles.

Adicionalmente, este repositorio incluye los archivos necesarios para realizar pruebas locales con Postman:

```
/postman/SGGM.postman_collection.json
/postman/SGGM.postman_environment.json
```

- `SGGM.postman_collection.json`: contiene todos los endpoints del sistema, organizados por módulo.
- `SGGM.postman_environment.json`: incluye variables útiles para pruebas, como BASE_URL, credenciales de ejemplo y el TOKEN que se obtiene luego de iniciar sesión.
