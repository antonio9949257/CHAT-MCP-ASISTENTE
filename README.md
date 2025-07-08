# Proyecto MCP Real: Gemini con Next.js y Tool Calling

Este proyecto es una demostración de cómo implementar el patrón Model-Client-Proxy (MCP) utilizando Next.js (para frontend y backend) y el SDK oficial de Google Gemini para la funcionalidad de `tool calling` (llamada a herramientas).

## 🚀 Propósito del Proyecto

El objetivo principal es ilustrar cómo un modelo de lenguaje (Gemini) puede interactuar con funciones personalizadas (herramientas) definidas en tu backend para obtener información o realizar acciones que el modelo por sí mismo no puede hacer. Esto simula un "servidor MCP" donde tu aplicación ejecuta las llamadas a herramientas solicitadas por el modelo.

## ✨ Funcionalidades Implementadas

El asistente de chat en este proyecto puede:

1.  **Obtener Información de Productos:** Consulta datos de productos ficticios (precio, stock) usando la herramienta `getProductInfo`.
    *   Ej: "¿Cuánto cuesta laptop-01?", "Dime el stock de mouse-02."
2.  **Sumar Números:** Realiza operaciones matemáticas básicas usando la herramienta `addNumbers`.
    *   Ej: "Suma 5 y 3.", "¿Cuánto es 100 más 20?"
3.  **Obtener Información del Sistema Operativo:** Extrae datos reales y detallados del sistema donde se ejecuta el servidor (plataforma, arquitectura, memoria, CPU, hostname, usuario, etc.) usando la herramienta `getSystemInfo`.
    *   Ej: "¿Qué sistema operativo estás usando?", "Dime el nombre de host.", "¿Quién es el usuario actual?", "Dame toda la información del sistema."
4.  **Obtener Hora y Fecha Actual:** Consulta la hora y fecha real del sistema usando la herramienta `getCurrentTime`.
    *   Ej: "¿Qué hora es?", "Dime la fecha de hoy."

## 🛠️ Tecnologías Utilizadas

*   **Next.js 14+:** Framework de React para el desarrollo full-stack (App Router).
*   **TypeScript:** Para un desarrollo más robusto y con tipado estático.
*   **Tailwind CSS:** Para estilos rápidos y responsivos.
*   **daisyUI:** Plugin de Tailwind CSS para componentes de UI pre-estilizados.
*   **Google Gemini API (`@google/generative-ai`):** SDK oficial para interactuar con los modelos de Gemini.

## ⚙️ Configuración y Ejecución

Sigue estos pasos para poner el proyecto en marcha:

### 1. Clonar el Repositorio (o crear la estructura si lo hiciste manualmente)

Si estás siguiendo los pasos de creación manual, asegúrate de tener la estructura de archivos y el `package.json` configurados como se indicó.

### 2. Instalar Dependencias

Navega al directorio raíz del proyecto (`mcp_real`) e instala las dependencias:

```bash
npm install
```

### 3. Configurar la Clave de API de Google Gemini

Necesitas una clave de API de Google Gemini. Si no tienes una, puedes generarla en [Google AI Studio](https://aistudio.google.com/).

Crea un archivo `.env.local` en la raíz del proyecto (`mcp_real/`) y añade tu clave:

```
GOOGLE_API_KEY="TU_CLAVE_API_DE_GEMINI"
```

**¡Importante!** Reemplaza `TU_CLAVE_API_DE_GEMINI` con tu clave real.

### 4. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`. Abre esta URL en tu navegador para interactuar con el asistente de chat.

## 📂 Estructura del Proyecto

```
mcp_real/
├── .env.local
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── app/
    │   ├── api/
    │   │   └── chat/
    │   │       └── route.ts  # Backend: Maneja la lógica de Gemini y tool calling
    │   ├── globals.css     # Estilos globales de Tailwind
    │   ├── layout.tsx      # Layout principal de Next.js
    │   └── page.tsx        # Frontend: Interfaz de usuario del chat
    └── lib/
        └── tools.ts      # Implementación de las funciones (herramientas) del backend
```

## 💡 Cómo Funciona el Tool Calling (MCP)

1.  **Definición de Herramientas:** En `src/app/api/chat/route.ts`, se definen las herramientas (`getProductInfo`, `addNumbers`, `getSystemInfo`, `getCurrentTime`) con su nombre, descripción y parámetros esperados. Estas definiciones se pasan al modelo Gemini.
2.  **Intención del Usuario:** El usuario escribe una pregunta en el frontend (ej. "¿Cuánto cuesta laptop-01?").
3.  **Envío al Backend:** El frontend envía la pregunta (y el historial del chat) a la API de Next.js (`/api/chat`).
4.  **Razonamiento del Modelo:** El modelo Gemini recibe la pregunta y el historial. Si determina que una de las herramientas definidas puede responder a la pregunta, genera un `tool_call` (una instrucción para llamar a una función específica con ciertos parámetros).
5.  **Ejecución de la Herramienta (MCP):** El backend intercepta este `tool_call`. En lugar de que el modelo ejecute la función directamente, el backend (simulando el "servidor MCP") llama a la implementación real de esa función (definida en `src/lib/tools.ts`).
6.  **Respuesta de la Herramienta:** La función ejecutada devuelve un resultado (ej. `{ price: 1200 }`).
7.  **Reenvío al Modelo:** El backend envía este resultado de vuelta al modelo Gemini como un `functionResponse`.
8.  **Generación de Respuesta Final:** Con la información de la herramienta, el modelo genera una respuesta en lenguaje natural para el usuario (ej. "La laptop-01 cuesta $1200.").
9.  **Visualización en Frontend:** El backend envía esta respuesta final al frontend para que se muestre al usuario.

Este flujo permite que el modelo extienda sus capacidades más allá de su conocimiento entrenado, interactuando con sistemas externos de manera controlada y segura.
