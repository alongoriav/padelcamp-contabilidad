# Padel Camp - Sistema de Contabilidad

Sistema de contabilidad multi-usuario para Padel Camp S.A. de C.V.

**Stack:** Next.js 15 · React 19 · Supabase · Tailwind CSS · TypeScript · Vercel

---

## 🚀 Guía de Deploy

### Prerrequisitos

- ✅ Cuenta GitHub (con repo `padelcamp-contabilidad` creado)
- ✅ Cuenta Vercel (vinculada a GitHub)
- ✅ Cuenta Supabase con proyecto creado y schema cargado
- ✅ Datos migrados a Supabase (script `migrate_v4.py` ejecutado)

---

### Paso 1: Subir el código a GitHub

1. **Crea el repositorio en GitHub:**
   - Ve a [github.com/new](https://github.com/new)
   - Nombre: `padelcamp-contabilidad`
   - Privacidad: **Private** (recomendado, son datos contables)
   - **NO marques** "Initialize with README"
   - Click **Create repository**

2. **Sube el código:**
   - Descarga este proyecto completo
   - Abre Terminal en la carpeta del proyecto
   - Ejecuta:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/padelcamp-contabilidad.git
   git push -u origin main
   ```

   Reemplaza `TU-USUARIO` con tu usuario de GitHub real.

---

### Paso 2: Conectar con Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Click **"Import"** junto al repo `padelcamp-contabilidad`
3. **NO le des Deploy todavía** — primero configura las variables de entorno:

#### Variables de entorno en Vercel

En la pantalla de configuración del proyecto, agrega estas 3 variables:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Tu Project URL (ej: `https://abc123.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu Publishable key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu Secret key (`sb_secret_...`) |

⚠️ **Importante:** El `NEXT_PUBLIC_SUPABASE_URL` debe ser **sin `/rest/v1/` al final**.

4. Click **Deploy**
5. Espera ~2-3 minutos

---

### Paso 3: Probar el deploy

1. Vercel te dará una URL tipo `padelcamp-contabilidad.vercel.app`
2. Ábrela en tu navegador
3. Te debe llevar al login
4. Inicia sesión con el email y contraseña que creaste en Supabase Authentication
5. Verás los movimientos cargados desde Supabase 🎉

---

## 🛠️ Desarrollo local (opcional)

Si quieres correr el sistema localmente:

```bash
# Instalar dependencias
npm install

# Crear archivo de variables
cp .env.example .env.local
# Edita .env.local con tus credenciales reales

# Iniciar servidor
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📋 Funcionalidades Sesión 2 (entrega actual)

- ✅ Login con email/contraseña
- ✅ Logout
- ✅ Sidebar de navegación con info del usuario
- ✅ Tabla de movimientos
- ✅ Filtros (mes, cuenta, estado)
- ✅ Búsqueda por descripción
- ✅ Edición inline de concepto + unidad
- ✅ Stats cards (total, pendientes, validados, ingresos, egresos)
- ✅ Auto-guardado en Supabase

---

## 🔜 Próximas Sesiones

- **Sesión 3:** Estado de Resultados + Cuadre + Detective de Diferencia
- **Sesión 4:** Proveedores + Clientes + Buscador universal (Cmd+K)
- **Sesión 5:** Subida de facturas (PDF/XML) + Conciliación
- **Sesión 6:** Multi-usuario + Permisos + Refinamientos

---

## 🆘 Solución de problemas

### Error al hacer login: "Invalid login credentials"
- Verifica que el usuario existe en Supabase → Authentication → Users
- Verifica que el email/contraseña son correctos

### No aparece nada en movimientos
- Verifica que el script `migrate_v4.py` se corrió correctamente
- Verifica que la tabla `movimientos` en Supabase tiene filas
- Revisa la consola del navegador (Cmd+Option+J en Chrome) por errores

### Error de variables de entorno en Vercel
- Verifica que las 3 variables están configuradas en Settings → Environment Variables
- Re-deploya después de agregar variables (Deployments → ... → Redeploy)

---

## 📞 Contacto

Sistema desarrollado para Padel Camp S.A. de C.V.
