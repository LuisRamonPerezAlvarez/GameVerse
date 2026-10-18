# GameVerse 🎮

> **Plataforma Web Full-Stack para el Descubrimiento, Exploración y Colección Personal de Videojuegos**  
> *Proyecto Académico Universitario — Unidad 3: Desarrollo Web, Seguridad, Servicios Web y APIs REST*

---

## 1. Información General del Proyecto

- **Nombre:** GameVerse
- **Propósito:** Ofrecer a los entusiastas de los videojuegos una plataforma interactiva, atractiva y segura para explorar catálogos de títulos globales, consultar fichas técnicas, requisitos de sistema y plataformas, así como almacenar colecciones privadas de favoritos mediante una cuenta de usuario persistente.
- **Enfoque Académico:** Demostración integral de arquitectura cliente-servidor (Full-Stack), consumo seguro de APIs externas, gestión de sesiones sin exponer tokens al cliente, consultas preparadas contra inyecciones SQL y pruebas automatizadas de lógica pura.

---

## 2. Tecnologías Utilizadas

### Frontend
- **React 19:** Biblioteca declarativa para la construcción de interfaces de usuario interactivas por componentes.
- **TypeScript:** Tipado estático estricto para modelos de datos, props y respuestas de red.
- **Vite:** Herramienta de compilación de última generación y servidor de desarrollo ultrarrápido.
- **React Router 7 (`react-router-dom`):** Enrutador para navegación de tipo Single Page Application (SPA).
- **Tailwind CSS v4:** Framework de estilos utilitarios con estética gaming moderna (paleta oscura, acentos violeta e índigo, tipografía nítida y jerarquía visual estricta).
- **Lucide React:** Biblioteca de iconografía vectorial limpia y consistente.
- **Fetch API nativo:** Cliente HTTP con configuración de credenciales automáticas (`credentials: 'include'`).

### Backend
- **Node.js 22:** Entorno de ejecución de JavaScript en el lado del servidor.
- **Express 4:** Framework de servicios web y rutas RESTful.
- **TypeScript & tsx:** Ejecución y tipado estricto del servidor.
- **Zod:** Validación declarativa de esquemas tanto para autenticación como para parámetros de consulta.
- **bcryptjs:** Función de derivación de claves basada en algoritmo de hash criptográfico con 12 rondas de salt.
- **jsonwebtoken (JWT):** Generación y validación de tokens de sesión con firma secreta.
- **cookie-parser:** Gestión segura de cookies firmadas con atributos `HttpOnly` y `SameSite`.
- **Helmet:** Middleware para establecimiento de cabeceras de seguridad HTTP.
- **express-rate-limit:** Mitigación de ataques de fuerza bruta y protección contra abuso de cuotas en endpoints sensibles.

### Base de Datos
- **SQLite (`node:sqlite` nativo en Node 22):** Motor relacional ligero y persistente almacenado en archivo local (`data/gameverse.sqlite`), con activación de claves foráneas (`PRAGMA foreign_keys = ON;`) y eliminación en cascada.
- **Consultas Preparadas (Prepared Statements):** Inmunidad absoluta contra ataques de Inyección SQL (SQL Injection).

---

## 3. Arquitectura del Proyecto

GameVerse implementa una arquitectura desacoplada donde el servidor Express actúa como intermediario seguro (*Backend for Frontend / API Proxy*) entre el navegador del usuario y los servicios web externos:

```text
[ Navegador Web ]  <--- HTTP / JSON + HttpOnly Cookies --->  [ Servidor Express (GameVerse) ]
 (React + Router)                                                  |               |
                                                  [ Base de Datos SQLite ]   [ API Externa REST ]
                                                   (Usuarios y Favoritos)     (RAWG / FreeToGame)
```

### Estructura de Directorios

```text
GameVerse/
├── data/                       # Almacén local de la base de datos SQLite (.gitignore)
├── server/
│   ├── config/
│   │   └── env.ts              # Configuración y validación de variables de entorno
│   ├── database/
│   │   └── db.ts               # Conexión persistente a SQLite y definición de tablas
│   ├── middleware/
│   │   ├── auth.ts             # Extracción de JWT desde cookie HttpOnly o Bearer header
│   │   ├── errorHandler.ts     # Manejo centralizado de respuestas y errores HTTP
│   │   └── security.ts         # Rate limiters para endpoints de autenticación y juegos
│   ├── routes/
│   │   ├── auth.ts             # Rutas /api/auth (register, login, me, logout)
│   │   ├── favorites.ts        # Rutas /api/favorites protegidas por sesión
│   │   ├── games.ts            # Rutas /api/games y /api/genres
│   │   └── health.ts           # Endpoint /api/health de diagnóstico de estado
│   ├── schemas/
│   │   └── authSchemas.ts      # Esquemas de validación Zod
│   ├── services/
│   │   ├── gamesService.ts     # Consumo y normalización de RAWG y FreeToGame API
│   │   └── usersService.ts     # Lógica de registro, bcrypt hash y tokens JWT
│   ├── tests/
│   │   └── api.test.ts         # Pruebas de integración de base de datos y servicios
│   └── .env.example            # Ejemplo de variables de entorno para el servidor
├── src/
│   ├── assets/images/          # Fondos y portadas optimizadas generadas para la app
│   ├── components/             # Componentes modulares reutilizables
│   │   ├── FilterPanel.tsx     # Controles interactivos de género y ordenamiento
│   │   ├── Footer.tsx          # Pie de página académico con atribuciones
│   │   ├── GameCard.tsx        # Tarjeta de juego con portadas y favoritos
│   │   ├── Navbar.tsx          # Barra de navegación con contrato de 3 zonas
│   │   ├── ProtectedRoute.tsx  # Guardián de rutas autenticadas
│   │   ├── SearchBar.tsx       # Búsqueda con debounce y botón de borrado
│   │   ├── SkeletonCard.tsx    # Estados visuales de carga (placeholders)
│   │   └── Toast.tsx           # Sistema de notificaciones no intrusivas
│   ├── context/
│   │   └── AuthContext.tsx     # Contexto global de sesión y colección de favoritos
│   ├── pages/                  # Las 8 pantallas obligatorias de la aplicación
│   │   ├── Explore.tsx         # Pantalla 4: Catálogo con filtros y paginación
│   │   ├── Favorites.tsx       # Pantalla 6: Colección privada de favoritos
│   │   ├── GameDetail.tsx      # Pantalla 5: Ficha técnica y requisitos de PC
│   │   ├── Home.tsx            # Pantalla 1: Portada y títulos destacados
│   │   ├── Login.tsx           # Pantalla 3: Inicio de sesión seguro
│   │   ├── NotFound.tsx        # Pantalla 8: 404 Misión no encontrada
│   │   ├── Profile.tsx         # Pantalla 7: Perfil de usuario y auditoría técnica
│   │   └── Register.tsx        # Pantalla 2: Formulario con reglas en tiempo real
│   ├── services/
│   │   └── api.ts              # Cliente HTTP centralizado del frontend
│   ├── types/
│   │   └── index.ts            # Definiciones TypeScript de entidades y respuestas
│   ├── utils/
│   │   ├── validation.ts       # Lógica pura de validación de contraseñas y texto
│   │   └── validation.test.ts  # Pruebas unitarias de lógica pura con node:test
│   ├── App.tsx                 # Configuración principal de rutas y layout
│   ├── index.css               # Estilos globales y scrollbar gaming
│   └── main.tsx                # Punto de entrada de React en el DOM
├── .env.example                # Plantilla de variables de entorno en la raíz
├── .gitignore                  # Exclusión estricta de secretos, bases de datos y logs
├── package.json                # Scripts y dependencias del proyecto
├── server.ts                   # Servidor principal Express + Vite dev middleware
├── tsconfig.json               # Configuración de compilación TypeScript
└── vite.config.ts              # Configuración de empaquetado Vite
```

---

## 4. Endpoints de la API REST

Todas las respuestas utilizan una estructura JSON predecible:

- **Respuesta de éxito (`200` / `201`):**
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **Respuesta de error (`400`, `401`, `404`, `409`, `429`, `500`):**
  ```json
  {
    "success": false,
    "error": {
      "message": "Descripción clara del error",
      "details": { ... }
    }
  }
  ```

| Método | Endpoint | Descripción | Autenticación | Códigos HTTP |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Registra una cuenta, genera hash bcrypt y asigna sesión | No | `201`, `400`, `409`, `429` |
| `POST` | `/api/auth/login` | Valida credenciales y expide cookie HttpOnly | No | `200`, `400`, `401`, `429` |
| `GET` | `/api/auth/me` | Obtiene el perfil del usuario autenticado | **Sí** | `200`, `401` |
| `POST` | `/api/auth/logout` | Invalida la cookie de sesión del navegador | No | `200` |
| `GET` | `/api/games` | Catálogo con parámetros `search`, `genre`, `page`, `ordering` | No | `200`, `429`, `502`, `504` |
| `GET` | `/api/games/:id` | Ficha técnica completa de un videojuego | No | `200`, `404`, `502`, `504` |
| `GET` | `/api/genres` | Lista de categorías y géneros disponibles | No | `200` |
| `GET` | `/api/favorites` | Colección de favoritos exclusiva del usuario en sesión | **Sí** | `200`, `401` |
| `POST` | `/api/favorites` | Añade un videojuego a los favoritos del usuario | **Sí** | `200`, `201`, `400`, `401` |
| `DELETE` | `/api/favorites/:gameId` | Elimina un videojuego de los favoritos del usuario | **Sí** | `200`, `401`, `404` |
| `GET` | `/api/health` | Estado del backend, base de datos SQLite y servicios | No | `200` |

---

## 5. Medidas de Seguridad Implementadas

1. **Protección de Contraseñas:** Las contraseñas nunca se guardan en texto plano. Se procesan con `bcryptjs` con 12 rondas de salt dinámico. Los hashes de contraseña nunca se transmiten en ninguna respuesta JSON.
2. **Validación Bidireccional:** El frontend proporciona retroalimentación instantánea al usuario (mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número). El backend vuelve a validar estrictamente todos los campos con esquemas Zod antes de ejecutar cualquier consulta.
3. **Mitigación de SQL Injection:** Todas las interacciones con SQLite utilizan sentencias parametrizadas y preparadas (`db.prepare('... WHERE id = ?').get(...)`), lo cual neutraliza inyecciones maliciosas.
4. **Manejo Seguro de Sesiones:** El token de autenticación se almacena prioritariamente en una cookie con bandera `HttpOnly`, lo que impide que código JavaScript malicioso (ataques XSS) pueda robar las credenciales de sesión.
5. **Aislamiento de Privacidad:** En todas las operaciones de favoritos se exige `user_id = req.user.id`. Un usuario autenticado no puede consultar, añadir ni borrar favoritos de otra cuenta.
6. **Limitación de Peticiones (Rate Limiting):** Se aplican limitadores diferenciados con `express-rate-limit`: máximo 20 intentos en 15 minutos para login/registro (prevención de ataques de fuerza bruta) y 150 consultas para endpoints de catálogo.
7. **Cabeceras HTTP de Seguridad:** Implementación de `helmet` para proteger contra ataques de clickjacking, sniffing de tipos MIME y vulnerabilidades de encabezados comunes.
8. **Protección de Secretos y API Keys:** Las claves de APIs externas y secretos JWT residen exclusivamente en variables de entorno del servidor (`server/.env`). Nunca se exponen al navegador ni se colocan en variables con prefijo `VITE_`.
9. **Sanitización de Datos Externos:** Las descripciones recibidas de servicios externos se limpian de etiquetas HTML potencialmente maliciosas antes de su visualización, prescindiendo de `dangerouslySetInnerHTML`.

---

## 6. Integración de la API Externa

GameVerse está diseñado para consumir servicios REST reales de videojuegos:

1. **Modo RAWG Video Games Database:** Si se configura una clave válida `RAWG_API_KEY` en `server/.env`, el backend consulta directamente la API oficial de RAWG (`https://api.rawg.io/api/games`), obteniendo miles de títulos comerciales y sus metadatos.
2. **Modo Abierto FreeToGame REST API (Fallback Automático):** Si no se suministra una clave o si la clave está ausente, el backend conmuta de forma transparente y automática a la API REST abierta de FreeToGame (`https://www.freetogame.com/api`), garantizando que la aplicación funcione al 100% en vivo sin requerir registro previo para la evaluación académica.
3. **Control de Tiempos de Espera (Timeout):** Las llamadas a las APIs externas cuentan con un `AbortController` calibrado a 8 segundos. Si el servicio externo se satura, el backend responde con código `504 Gateway Timeout` y la interfaz presenta un botón de reintento amigable sin romper la aplicación.
4. **Caché en Memoria:** Se almacena en memoria la respuesta de consultas idénticas durante 5 minutos para respetar límites de cuota y optimizar la velocidad de respuesta.

---

## 7. Demostración de los 10 Objetivos de Aprendizaje (Unidad 3)

| # | Concepto Clave | Aplicación Concreta en GameVerse |
| :---: | :--- | :--- |
| **1** | **Frontend Moderno** | Construido con React 19 y TypeScript; navegación fluida por componentes sin recargas completas de página. |
| **2** | **Backend Robusto** | Servidor Express con middleware modular, desacoplando rutas, controladores y servicios. |
| **3** | **API REST Estándar** | Intercambio de datos en formato JSON siguiendo verbos HTTP (`GET`, `POST`, `DELETE`) y códigos de estado semánticos. |
| **4** | **Consumo de APIs Externas** | El servidor consume servicios REST de terceros, normaliza su estructura y filtra la información para el cliente. |
| **5** | **Servicios Web Seguros** | Exposición de endpoints propios (`/api/*`) que operan como puente seguro protegiendo claves secretas. |
| **6** | **Variables de Entorno** | Separación de la configuración y secretos (`.env`) del código fuente, previniendo fugas de credenciales. |
| **7** | **Seguridad Web Integral** | Cifrado bcrypt, tokens JWT, cookies `HttpOnly`, cabeceras `helmet` y limitadores de velocidad. |
| **8** | **Validación en Cliente y Servidor** | Doble anillo de validación: retroalimentación visual en React y rechazo definitivo con Zod en Express. |
| **9** | **Persistencia en Base de Datos** | Almacenamiento relacional en SQLite con tablas `users` y `favorites`, claves foráneas e integridad referencial. |
| **10** | **Manejo Centralizado de Errores** | Middleware unificado que captura excepciones sin filtrar trazas del sistema (stack traces) al usuario. |

---

## 8. Pasos para Instalación y Ejecución Local

### Requisitos Previos
- **Node.js:** Versión 22 o superior instalada.
- **npm** o **bun** instalado en tu terminal.

### Paso 1: Clonar o Descargar el Proyecto
```bash
git clone <url-del-repositorio>
cd GameVerse
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

### Paso 3: Configurar Variables de Entorno
Copia el archivo de ejemplo a tu archivo de configuración local:
```bash
cp .env.example .env
```
*(Opcional)* Si dispones de una clave de RAWG API, agrégala en `.env`:
```env
PORT=3000
NODE_ENV=development
RAWG_API_KEY=tu_clave_de_rawg_aqui
JWT_SECRET=tu_secreto_largo_y_aleatorio_aqui
CLIENT_ORIGIN=http://localhost:3000
DATABASE_PATH=./data/gameverse.sqlite
```
*Nota:* Si no configuras `RAWG_API_KEY`, GameVerse utilizará automáticamente la API abierta de FreeToGame con datos reales de videojuegos sin necesidad de configuración adicional.

### Paso 4: Ejecutar Pruebas Automatizadas
Para verificar que todas las validaciones de seguridad, funciones puras y la base de datos funcionan correctamente:
```bash
npm test
```
*Resultado esperado:* 11 pruebas pasando al 100% (0 fallos).

### Paso 5: Iniciar la Aplicación en Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible inmediatamente en tu navegador en:
👉 **`http://localhost:3000`**

### Paso 6: Compilación para Producción (Verificación)
```bash
npm run build
```

---

## 9. Pruebas Realizadas y Resultados

Durante el desarrollo de GameVerse se aplicó la metodología estricta de Ultra Mode:
1. **Pruebas Unitarias de Lógica Pura (`node:test`):**
   - Validación de fortaleza de contraseña (longitud, mayúsculas, minúsculas, números).
   - Sanitización de parámetros de búsqueda contra scripts y caracteres de escape.
   - Normalización de correos electrónicos.
   - Formateo de puntuaciones y extracción de años de lanzamiento.
2. **Pruebas de Integración de Base de Datos y Backend:**
   - Creación de tablas e integridad de claves foráneas en SQLite.
   - Registro de usuario con verificación de hash bcrypt.
   - Rechazo de duplicados de correo electrónico con código HTTP 409.
   - Verificación de credenciales válidas e inválidas en inicio de sesión.
   - Aislamiento estricto de favoritos entre distintos usuarios.
3. **Pruebas en Navegador Real con Playwright:**
   - Navegación responsive en escritorio (1440x900) y móvil (390x844).
   - Recorrido completo de registro de usuario con verificación de requisitos en tiempo real.
   - Transición de sesión y actualización de contador de favoritos en la barra de navegación.
   - Consulta de catálogo, filtrado por géneros y búsqueda con debounce.
   - Guardado y eliminación de favoritos con persistencia en SQLite comprobada tras reinicio del servidor.
   - Visualización de la ficha técnica individual y de la página 404 personalizada.

---

## 10. Verificación de Seguridad y Git

- El archivo `.gitignore` ha sido configurado para ignorar rigurosamente:
  - Archivos `.env*` (excepto `.env.example`).
  - Archivos de base de datos SQLite (`data/*.sqlite`, `*.sqlite-journal`, `*.sqlite-wal`).
  - Capturas y registros de pruebas (`.playwright-cli/`).
  - Carpetas de compilación y módulos (`node_modules/`, `dist/`).
- Ninguna clave privada, hash o secreto ha sido incluido en el código fuente.
