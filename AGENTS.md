# Instrucciones para agentes de IA

## Mantener el mapa de integración frontend/backend

- Mantén `docs/backend-api-integration.md` actualizado cada vez que una vista, un servicio frontend o un endpoint backend se conecte, cambie, se complete o se retire.
- En la misma tarea, registra la fecha, el estado por vista (Completo, Parcial, Pendiente o Sin API backend), las rutas exactas y lo que queda pendiente.
- No presentes fixtures, mocks ni valores locales como si fueran datos persistidos por el backend. Si no existe API, marca/deshabilita la acción o la vista en vez de fingir éxito.
- No deduzcas que una ruta corresponde a una vista solo por similitud de nombres. Si el mapeo funcional o los campos del contrato no están claros, pregunta antes de implementarlo.
- Al validar, distingue compilación/pruebas del frontend de verificación real contra una API desplegada; incluye bloqueos de CORS/red.
