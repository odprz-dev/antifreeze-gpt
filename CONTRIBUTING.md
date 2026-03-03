# 🤝 Contribuyendo a Antifreeze GPT

¡Gracias por interesarte en mejorar la eficiencia de la IA! Antifreeze GPT nació para solucionar problemas críticos de rendimiento en el DOM, y tu ayuda es bienvenida.

## 🛠️ Cómo puedes ayudar
1. **Reportar Bugs:** Abre un *Issue* detallando tu sistema operativo, versión de Chrome y una captura de pantalla del "Lag" si es posible.
2. **Sugerir Funciones:** ¿Tienes una idea para reducir más el uso de CPU? Cuéntanos en la sección de *Discussions*.
3. **Pull Requests (PRs):** Si quieres meter las manos en el código, sigue estos pasos:
   - Haz un *Fork* del proyecto.
   - Crea una rama para tu mejora: `git checkout -b feat/mejor-rendimiento`.
   - Realiza tus cambios asegurándote de no romper la persistencia del Shadow DOM.
   - Envía tu PR hacia la rama `main`.

## 📏 Estándares de Código
- **Shadow DOM:** Toda la UI debe permanecer encapsulada. No inyectes estilos globales que puedan romper ChatGPT.
- **Vanilla JS:** Preferimos mantener la extensión ligera y sin dependencias externas para evitar bloqueos de seguridad (CSP).
- **Commits:** Usa mensajes claros (ej. `feat: add keyboard shortcut for panic mode` o `fix: slider jump on resize`).

## 💬 Comunicación
Si tienes dudas técnicas sobre la arquitectura de inyección, puedes contactar al equipo en [odprz.dev](https://odprz.dev).

---
Al contribuir, aceptas que tus aportes estarán bajo la licencia **GPL-3.0**.