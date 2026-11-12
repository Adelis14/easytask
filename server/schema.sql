-- ====================================================================
-- EasyTask: Script DDL PostgreSQL Completo
-- Dominio: Reuniones, Minutas y Compromisos (UI-REQ-01.4)
-- ====================================================================

-- 0. Opcional: Limpieza en orden inverso a dependencias de clave foránea
DROP TABLE IF EXISTS historial_tarjetas CASCADE;
DROP TABLE IF EXISTS tarjetas CASCADE;
DROP TABLE IF EXISTS tableros CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 1. Tabla: usuarios (Control de acceso y perfiles)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    usuario VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(180) NOT NULL UNIQUE,
    telefono VARCHAR(30),
    password VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla: tableros (Minutas / Contenedores de Acuerdos)
CREATE TABLE tableros (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    id_usuario INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tableros_usuario 
        FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id) 
        ON DELETE CASCADE
);

-- 3. Tabla: tarjetas (Compromisos y Acuerdos de Reunión)
-- Restricción de estado con los 4 valores estrictos del flujo
CREATE TABLE tarjetas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    checklist JSONB DEFAULT '[]'::jsonb,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    tablero_id INT NOT NULL,
    fecha_inicio TIMESTAMP,
    fecha_vencimiento TIMESTAMP,
    fecha_culminacion TIMESTAMP,
    CONSTRAINT chk_tarjetas_estado 
        CHECK (estado IN ('Pendiente', 'En Proceso', 'Entregado', 'Verificado')),
    CONSTRAINT fk_tarjetas_tablero 
        FOREIGN KEY (tablero_id) 
        REFERENCES tableros(id) 
        ON DELETE CASCADE
);

-- 4. Tabla: historial_tarjetas (Auditoría inmutable de transiciones de Compromisos)
CREATE TABLE historial_tarjetas (
    id SERIAL PRIMARY KEY,
    tarjeta_id INT NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_tarjeta 
        FOREIGN KEY (tarjeta_id) 
        REFERENCES tarjetas(id) 
        ON DELETE CASCADE
);

-- ====================================================================
-- Índices para optimización de consultas (< 1.2s SLA)
-- ====================================================================
CREATE INDEX idx_tableros_id_usuario ON tableros(id_usuario);
CREATE INDEX idx_tarjetas_tablero_id ON tarjetas(tablero_id);
CREATE INDEX idx_tarjetas_estado ON tarjetas(estado);
CREATE INDEX idx_tarjetas_vencimiento ON tarjetas(fecha_vencimiento);
CREATE INDEX idx_historial_tarjeta_id ON historial_tarjetas(tarjeta_id);

-- ====================================================================
-- 5. Función y Trigger PL/pgSQL: Auditoría Automática de Estado
-- Registra de forma inmutable cada transición de estado en tarjetas
-- ====================================================================

CREATE OR REPLACE FUNCTION trg_auditoria_estado_tarjetas()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar si hubo cambio de estado efectivo
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO historial_tarjetas (
            tarjeta_id,
            estado_anterior,
            estado_nuevo,
            descripcion,
            fecha
        ) VALUES (
            NEW.id,
            OLD.estado,
            NEW.estado,
            CONCAT('Cambio de estado: ', COALESCE(OLD.estado, 'Sin estado previo'), ' -> ', NEW.estado),
            CURRENT_TIMESTAMP
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger asociado a la tabla tarjetas en AFTER UPDATE
DROP TRIGGER IF EXISTS trg_auditoria_estado_tarjetas ON tarjetas;

CREATE TRIGGER trg_auditoria_estado_tarjetas
AFTER UPDATE ON tarjetas
FOR EACH ROW
WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
EXECUTE FUNCTION trg_auditoria_estado_tarjetas();

