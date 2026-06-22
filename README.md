# CEV - Control de Estudios Virtual

El **Control de Estudios Virtual (CEV)** es una plataforma web integral diseñada para la gestión académica del PNF en Informática. El sistema permite automatizar procesos administrativos, visualización de notas, planificación horaria y gestión de usuarios mediante una arquitectura moderna, desacoplada y escalable.

## 🚀 Características Principales

* **Arquitectura Desacoplada:** Frontend modularizado con un enrutador propio basado en ES6 Modules, evitando dependencias externas innecesarias.
* **Gestión Académica:** Módulos dedicados para el control de evaluaciones y gestión de horarios.
* **Seguridad:** Implementación de autenticación robusta basada en JWT (JSON Web Tokens).
* **Interfaz Responsiva:** Diseño construido con Bootstrap 5, optimizado para cualquier dispositivo.
* **Performance:** Carga de vistas dinámica sin recarga de página (Single Page Application - SPA behavior).

## 🛠 Tecnologías Utilizadas

### Frontend
- **HTML5 & CSS3**
- **JavaScript (ES6+)**
- **Bootstrap 5** (Estilos y Componentes)
- **Bootstrap Icons** (Iconografía)

### Backend & Servidor
- **PHP** (API REST)
- **Apache** (Servidor Web)
- **MySQL** (Base de Datos)

## 📁 Estructura del Proyecto

```text
cev-frontend/
├── assets/          # Imágenes, estilos globales y plugins
├── src/
│   ├── components/  # Componentes reutilizables
│   ├── pages/       # Vistas de la aplicación (Login, Landing, Admin)
│   ├── router/      # Enrutador modular (index, usuarios, bitacora)
│   └── index.js     # Orquestador del router
└── .htaccess        # Configuración para URL amigables