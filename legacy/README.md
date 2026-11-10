# Prototipo anterior (no usar)

Esta carpeta contiene la versión antigua del frontend en un solo archivo
(`index.html`), junto con su `package.json` y `package-lock.json`.

Ese prototipo:

- Guardaba los datos en `localStorage` del navegador.
- Incluía datos de demostración distintos a los de la base de datos real.
- No se conecta a la API ni a MySQL de la misma forma que la aplicación actual.

Se movió aquí únicamente como respaldo histórico. **No es la aplicación del
proyecto.**

La aplicación correcta es la de `frontend/` (React + Vite) y se levanta con
Docker:

```bash
docker compose up -d --build
```

Luego se abre en el navegador:

👉 http://localhost
