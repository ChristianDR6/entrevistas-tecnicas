# Preparador de entrevistas técnicas

Herramienta para practicar entrevistas técnicas de programación. 144
preguntas con respuesta de referencia, en español e inglés, ordenadas por
temática.

Funciona abriendo un archivo. No necesita internet, ni instalación, ni
servidor. Todo el procesamiento ocurre en tu navegador.

## Para qué sirve

Las respuestas de referencia están escritas en primera persona y explican
decisiones de diseño con su motivo: por qué se eligió un patrón y no otro,
qué problema resuelve, y qué se rompe si no se hace así.

Después de leer la respuesta de referencia, podés escribir la tuya y
comprobarla.

## Cómo usarlo

**Desde internet:** <https://christiandr6.github.io/entrevistas-tecnicas/>

**Desde tu disco:** descargá el ZIP, descomprimilo y abrí `index.html`. Los
cuatro archivos tienen que quedar juntos en la misma carpeta.

Pasos:

1. Abrí `index.html` en el navegador.
2. Elegí la temática y la dificultad.
3. Presioná **Iniciar**.
4. Leé la pregunta, compará con la referencia de arriba.
5. Escribí lo que responderías de verdad y presioná **Comprobar**.

Atajos: `Espacio` o `Siguiente` para otra pregunta, `Enter` para iniciar,
`R` para reiniciar.

Las preguntas no se repiten hasta agotar el banco completo. Después se
barajan de nuevo.

## Temáticas

| Temática | Qué cubre |
|---|---|
| Lenguajes y datos | SQL, modelado, migraciones, fechas, concurrencia en base |
| Arquitectura | capas, multi-tenant, idempotencia, outbox, integraciones |
| Ciberseguridad | sesiones, tokens, contraseñas, cookies, CORS, fuerza bruta |
| Diseño DDD | contextos acotados, agregados, eventos, invariantes |
| Ingeniería general | pruebas, proceso, documentación, límites del trabajo |

## Las dos formas de evaluar

**Sin conexión (por defecto).** Compara tu respuesta con la de referencia y
calcula qué porcentaje de los conceptos clave mencionaste. No necesita
internet.

Esta evaluación mide **cobertura de contenido**, no comprensión. Tiene un
límite importante: si explicás con tus propias palabras sin compartir
vocabulario con la referencia, podés puntuar bajo aunque lo entiendas
bien. Por eso el detalle te muestra *qué conceptos te faltaron*: esa es la
parte accionable.

**Con IA (opcional).** Consulta un modelo de OpenAI para que juzgue si tu
respuesta *explica lo mismo* que la de referencia, aunque uses otras
palabras. Requiere tu propia clave de API y envía lo que escribas a
OpenAI.

## Estructura

```
index.html         estructura de la página
entrevistas.css    estilos
entrevistas.js     banco de preguntas, filtros y navegación
analisis.js        motor de evaluación de respuestas
```

El archivo tiene que llamarse `index.html` porque GitHub Pages publica
automáticamente ese nombre. Si lo cambiás, el sitio deja de funcionar.

No hay build ni dependencias. Para modificar las preguntas, editá el array
`BANCO` en `entrevistas.js`.

## Cómo agregar preguntas

Cada pregunta es un objeto en el array `BANCO`:

```javascript
{
  area: "arquitectura",        // la temática del filtro
  areaTema: "arquitectura",    // el subtema que sale como etiqueta
  nivel: "medio",              // basico | medio | avanzado
  es: { q: "...", a: "..." },
  en: { q: "...", a: "..." }
}
```

Las cinco áreas válidas son `lenguajes`, `arquitectura`,
`ciberseguridad`, `ddd` e `it-general`.

Las dos versiones de idioma son obligatorias: el evaluador construye su
índice de conceptos por separado para cada una, así que una respuesta
faltante deja esa pregunta sin nada que evaluar.

La respuesta de referencia es lo que determina la evaluación: de ella se
extraen los términos distintivos y de ahí sale la nota. Si es demasiado
corta, la pregunta tendrá pocos conceptos que buscar y la nota será poco
significativa. Lo útil son respuestas de dos o tres frases que expliquen la
decisión y su motivo.

## Licencia

MIT. Ver `LICENSE`.