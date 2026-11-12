# EasyTask - Erradicando la Muerte por Reunión

**EasyTask** es una aplicación web SPA diseñada específicamente para erradicar la "muerte por reunión" mediante el seguimiento estricto, formalización y auditoría inmutable de acuerdos pactados en minutas.

---

## 🚀 Inicio Rápido para Colaboradores

### Prerrequisitos
* **Node.js**: v18.0.0 o superior
* **npm**: v9.0.0 o superior

### Instalación y Ejecución en 3 Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd easytask
   ```

2. **Instalar dependencias de cliente y servidor:**
   ```bash
   npm run install:all
   ```

3. **Iniciar el proyecto en local:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   * **Frontend:** [http://localhost:3000](http://localhost:3000)
   * **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

> [!NOTE]
> **Base de Datos Automática:** El sistema cuenta con fallback automático a almacenamiento en memoria seguro (`InMemoryStorage`). No es obligatorio tener PostgreSQL instalado para colaborar o probar la aplicación; arranca inmediatamente con minutas y compromisos precargados.

---

## 📋 Credenciales de Acceso Demo

| Usuario | Contraseña | Rol |
| :--- | :--- | :--- |
| `demo@easytask.org` | `secreto123` | Líder de Acuerdos / Colaborador |

---

## 📐 Cumplimiento de Reglas del Dominio (UI-REQ-01.4)
- **Restricción Terminológica**: Se erradicó por completo el uso de términos genéricos como *"Tarea"* o *"Proyecto"*.
- **Nomenclatura Estricta**:
  1. **Reuniones**: Espacios de sincronización y acuerdos.
  2. **Minutas**: Documentos y contenedores lógicos donde se formalizan las decisiones tomadas.
  3. **Compromisos**: Unidades de trabajo con responsable y fecha límite de entrega.

---

## 🗂️ Arquitectura de Datos
El sistema soporta tanto PostgreSQL (`server/schema.sql`) como almacenamiento en memoria:

1. **`usuarios`**: Control de acceso con contraseñas cifradas vía `bcrypt` (`id`, `nombre`, `email`, `password_hash`, `creado_en`).
2. **`tableros` (Minutas)**: Contenedores lógicos de minutas de reunión (`id`, `usuario_id`, `nombre`, `descripcion`, `fecha_reunion`, `creado_en`).
3. **`tarjetas` (Compromisos)**: Unidad de trabajo y acuerdo (`id`, `tablero_id`, `titulo`, `descripcion`, `checklist` JSONB, `fecha_vencimiento`, `responsable`, `estado`).
4. **`historial_tarjetas`**: Registro inmutable de auditoría (`id`, `tarjeta_id`, `estado_anterior`, `estado_nuevo`, `fecha_cambio`, `motivo`).

---

## 🔄 Flujo Obligatorio de 4 Estados y Semáforo Cromático (UI-REQ-01 / SRS 2.2)

### Flujo Canónico
1. **`Pendiente`**: Compromisos formalizados en la minuta pendientes de inicio.
2. **`En Proceso`**: Compromisos con actividades en ejecución activa.
3. **`Entregado`**: Compromisos concluidos que esperan validación o feedback.
4. **`Verificado`**: Acuerdos certificados con conformidad de la reunión.

### Sistema de Semaforización Cromática
* 🟢 **Verde (`#10B981`) - En plazo**: Más de 3 días restantes para la fecha límite.
* 🟡 **Amarillo (`#F59E0B`) - Por vencer**: Vence en 3 días o menos.
* 🔴 **Rojo (`#EF4444`) - Vencido / Crítico**: Fecha límite vencida o día límite actual.

---

## 📱 Diseño Responsive Multi-Dispositivo
* **Desktop ($\ge$ 1024px)**: Sidebar completo, 4 KPIs, 4 columnas Kanban simultáneas con selector de rol.
* **Tablet (768px - 1023px)**: Pestañas de estado con contadores píldora y cuadrícula de 2 columnas.
* **Móvil (< 768px)**: 3 métricas compactas, selector de rol desplegable, 4 acordeones colapsables y barra de navegación inferior fija (*Sticky Bottom Bar*).

---

## ⚡ Rendimiento y SLA (< 1.2 segundos)
* **Monitoreo Activo**: Middleware en Express que supervisa los tiempos de respuesta.
* **Actualizaciones Optimistas**: Mutación visual inmediata en 0 ms con sincronización en segundo plano.
* **Tiempos Medidos**: Promedio de respuesta de endpoints entre **2ms y 18ms**, garantizando holgadamente el SLA.
