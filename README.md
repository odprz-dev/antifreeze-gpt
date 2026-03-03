# ❄️ Antifreeze GPT - Zero Kelvin Productivity

**Antifreeze GPT** es una extensión de Chrome diseñada para desarrolladores y power users que llevan las sesiones de ChatGPT al límite. Cuando un chat crece demasiado, el DOM se satura y el navegador experimenta bloqueos masivos (Main Thread Starvation). Antifreeze soluciona esto inyectando un escudo térmico en la interfaz.



## 🚀 El Problema: El Lag de los 48 Segundos
A medida que una conversación en ChatGPT escala, el motor de React debe gestionar miles de nodos HTML, resaltado de sintaxis y fórmulas. Esto puede causar bloqueos de hasta 48 segundos. **Antifreeze GPT** reduce la carga del renderizado ocultando estratégicamente los elementos inactivos sin perder el contexto de la sesión.

## ✨ Características Principales
* **Persistent Shadow DOM UI:** Una interfaz flotante, móvil y persistente que sobrevive a la hidratación de React.
* **Thermal Control Slider:** Ajusta en tiempo real el número de mensajes visibles para equilibrar rendimiento y referencia visual.
* **Session Timer:** Monitoreo en tiempo real del hilo principal del navegador.
* **Panic Mode (Meltdown):** Un interruptor de emergencia para restaurar la visibilidad total instantáneamente.
* **Migration Protocol:** Guía técnica integrada para exportar contextos críticos de chats pesados a sesiones nuevas.

## 🛠️ Tech Stack
* **JavaScript (ES6+):** Lógica de manipulación de DOM y gestión de estado.
* **Chrome Extension API (Manifest v3):** Uso de `storage` para persistencia y `background workers`.
* **Shadow DOM:** Aislamiento total de estilos para evitar conflictos con la UI de OpenAI.
* **MutationObserver:** Vigilancia reactiva para asegurar la integridad del panel frente a actualizaciones de React.

## 📦 Instalación (Desarrolladores)
1. Clona este repositorio: `git clone https://github.com/tu-usuario/antifreeze-gpt.git`
2. Ve a `chrome://extensions/` en tu navegador.
3. Activa el **"Modo de desarrollador"** (Developer mode).
4. Haz clic en **"Cargar extensión sin empaquetar"** (Load unpacked) y selecciona la carpeta del proyecto.

## 📄 Licencia
Este proyecto está bajo la licencia **GPL-3.0**. Eres libre de usarlo, modificarlo y distribuirlo, siempre y cuando cualquier derivado permanezca bajo la misma licencia de código abierto.

---
Desarrollado con ❤️ por [odprz.dev - Ucody](https://odprz.dev)