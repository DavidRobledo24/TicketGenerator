# Sistema de Validación e Impresión de Tickets

Sistema de validación de códigos con impresión automática de tickets usando Node.js, integración con Google Sheets y gestión de imágenes de Google Drive. Incluye frontend web y scripts de automatización para Windows.

---

## Estado Actual

- **Validación de códigos de estudiantes** en tiempo real contra Google Sheets.
- **Control de horarios** para permitir o denegar el reclamo de alimentación según el tipo (refrigerio, almuerzo, ambos) y la hora del día.
- **Prevención de reclamos duplicados**: Un estudiante no puede reclamar más de una vez por día y tipo.
- **Integración con Google Sheets** para la gestión de estudiantes, tipos de alimentación y registro de reclamos.
- **Gestión y caché de imágenes**: Descarga, redimensiona y almacena imágenes de Google Drive localmente para mejorar el rendimiento.
- **Frontend web**: Permite escanear o ingresar el código, muestra nombre, tipo de alimentación, imagen y alertas visuales con SweetAlert2.
- **Impresión automática de tickets** usando comandos ESC/POS, compatible con impresoras térmicas compartidas en Windows (ejemplo: XP-80C, Zebra ZD230).
- **Palabra del día**: Cada ticket impreso incluye una palabra aleatoria relacionada con alimentos, diferente cada día.
- **Modo de prueba**: Permite simular la impresión de tickets sin enviarlos físicamente a la impresora, útil para desarrollo y pruebas.
- **Automatización en Windows**: Scripts `.bat` para iniciar el servidor, crear acceso directo de inicio automático y desactivar el inicio automático, incluyendo cierre de procesos relacionados.
- **Endpoints REST**: Para validación, impresión, consulta de estado y gestión de imágenes.
- **Mensajes y alertas visuales**: Notificaciones claras para errores, advertencias y confirmaciones tanto en frontend como backend.

---

## Requisitos Previos

- **Node.js** (v14+ recomendado)
- **npm** (incluido con Node.js)
- **Impresora térmica** (ejemplo: XP-80C, Zebra ZD230, configurada y compartida en Windows)
- **Credenciales de Google Cloud Platform** (archivo JSON)
- **Acceso a Google Sheets** (compartir hoja con el email del servicio de Google)
- **Permisos de escritura en la carpeta del proyecto**
- **Windows** (para scripts de automatización e impresión)

---

## Instalación y Primer Uso

1. **Clona o copia el proyecto completo** en el nuevo equipo.
2. **Coloca el archivo de credenciales** `bd-restaurante-455516-0e578bc4c013.json` en la raíz del proyecto.
3. **Instala las dependencias** ejecutando en terminal:
   ```bash
   npm install
   ```
   Si ves un error de permisos en PowerShell, ejecuta:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
4. **Configura la impresora**:
   - Instala y comparte la impresora con el nombre exacto usado en el código (`XP-80C` o el que corresponda).
   - Asegúrate de que el usuario tenga permisos de impresión.
5. **Verifica la conexión a Google Sheets**:
   - Comparte la hoja con el email del servicio (lo encuentras en el JSON de credenciales).
6. **Inicia el servidor**:
   - Puedes usar el script `iniciar_servidor.bat` o ejecutar manualmente:
     ```bash
     npm run dev
     ```
7. **Abre el frontend**:
   - Navega a `Principal/index.html` en tu navegador.

---

## Estructura del Proyecto

```
Restaurant/
├── server.js                    # Servidor principal Node.js
├── validarComida.js             # Lógica de validación y Google Sheets
├── package.json                 # Configuración de dependencias
├── cache/                       # Caché local de imágenes
├── bd-restaurante-455516-0e578bc4c013.json # Credenciales Google
├── iniciar_servidor.bat         # Script para iniciar el servidor
├── crear_acceso_directo.bat     # Script para crear acceso directo de inicio automático
├── desactivar_inicio_automatico.bat # Script para eliminar inicio automático
├── Principal/                   # Frontend web
│   ├── index.html
│   ├── main.js
│   ├── styles.css
│   └── particles.js
└── README.md
```

---

## Scripts de Automatización

- `iniciar_servidor.bat`: Inicia el servidor Node.js.
- `crear_acceso_directo.bat`: Crea acceso directo en la carpeta de inicio de Windows para arranque automático.
- `desactivar_inicio_automatico.bat`: Elimina el acceso directo y detiene procesos de Node/Python.

---

## Endpoints Principales

- `GET /test` - Verifica conexión con el backend.
- `POST /toggleTestMode` - Activa/desactiva modo de prueba (no imprime físicamente).
- `GET /testMode` - Consulta el estado del modo de prueba.
- `POST /verificar` - Valida código, devuelve datos del estudiante y control de horarios.
- `GET /proxy-image?id=ID` - Devuelve imagen de Google Drive (con caché y redimensionamiento).
- `POST /imprimir` - Imprime ticket con datos y palabra del día.

---

## Características

- **Validación en tiempo real** contra Google Sheets.
- **Control de horarios** para refrigerio y almuerzo.
- **Prevención de reclamos duplicados** por día.
- **Gestión y caché de imágenes** de Google Drive.
- **Impresión automática** con comandos ESC/POS.
- **Frontend amigable** con alertas y visualización de datos.
- **Modo de prueba** para desarrollo sin impresora.
- **Automatización de inicio** en Windows.

---

## Solución de Problemas Comunes

1. **Error de permisos en PowerShell al usar npm**
   - Ejecuta: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
2. **Error de impresión**
   - Verifica que la impresora esté instalada, compartida y con el nombre correcto.
   - Prueba el modo de prueba para descartar problemas de software.
3. **Error de Google Sheets**
   - Verifica que el archivo de credenciales esté presente y la hoja esté compartida con el email del servicio.
   - Revisa el rango y formato de la hoja.
4. **Error de imágenes**
   - Borra la carpeta `/cache` si hay problemas de visualización.
   - Verifica permisos de escritura en la carpeta.
5. **No reconoce códigos**
   - Asegúrate de que el código esté en la hoja de cálculo, sin espacios extra.
   - Revisa los logs del backend para ver qué código llega y cómo se busca.

---

## Recomendaciones para correr en otro equipo

- Copia todo el proyecto, incluyendo subcarpetas y archivos ocultos.
- Instala Node.js y ejecuta `npm install`.
- Coloca el archivo de credenciales y comparte la hoja de Google.
- Configura la impresora y permisos.
- Usa los scripts `.bat` para facilitar el arranque y automatización.
- Si usas PowerShell, ajusta la política de ejecución como se indica arriba.

---

## Créditos

Desarrollado por David R.  
© 2025

---