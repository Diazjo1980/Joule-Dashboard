# Joule × Ariba — Activation Dashboard

Dashboard interactivo para el proceso de activación y configuración de **SAP Joule para SAP Ariba**.

## 🚀 Deploy en Netlify (3 pasos)

### Opción A — Drag & Drop (más rápido)
1. Ejecuta `npm run build` en esta carpeta
2. Ve a [netlify.com/drop](https://app.netlify.com/drop)
3. Arrastra la carpeta `/build` generada → Listo ✅

### Opción B — GitHub + Netlify (recomendado)
1. Sube este proyecto a un repositorio GitHub
2. En Netlify → "Add new site" → "Import an existing project"
3. Conecta tu repo → Netlify detecta automáticamente la config

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `build` |
| Node version | 18 |

## 💻 Desarrollo local

```bash
npm install
npm start
# Abre http://localhost:3000
```

## 📦 Estructura del proyecto

```
joule-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx        # Componente principal + todas las secciones
│   ├── i18n.js        # Traducciones ES/EN
│   ├── data.js        # Datos por defecto + colores
│   └── index.js       # Entry point
├── netlify.toml       # Config de deploy
└── package.json
```

## 💾 Persistencia de datos

Todos los datos se guardan en **localStorage** del navegador. No requiere backend ni base de datos.

Para migrar a un backend real en el futuro, reemplaza las funciones `store.get()` y `store.set()` en `App.jsx` con llamadas a tu API.

## 🌐 Idiomas

Cambia entre **ES** / **EN** con el toggle en la esquina superior derecha. La preferencia de idioma también se guarda localmente.

## 📋 Secciones

- **Resumen / Overview** — Métricas, pilares del proceso, progreso por fase
- **Checklist** — Pasos de activación agrupados por fase con barra de progreso
- **Tareas / Tasks** — Tracker de tareas con prioridad, estado, fecha y responsable
- **Recursos / Resources** — Links, URLs y screenshots categorizados con búsqueda
