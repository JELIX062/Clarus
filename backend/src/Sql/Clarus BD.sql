-- ============================================================
--  Ingieniería de Software - Proyecto Final
--  Base de Datos para Clínica Médica
--  Equipo: 14 clarus
-- ============================================================

-- ------------------------------------------------------------
-- 1. Rol
-- ------------------------------------------------------------
CREATE TABLE Rol (
    id_rol        INT           NOT NULL AUTO_INCREMENT,
    nombre        VARCHAR(50)   NOT NULL,
    descripcion   VARCHAR(200)  NULL,
    PRIMARY KEY (id_rol)
);

-- ------------------------------------------------------------
-- 2. Usuario
-- ------------------------------------------------------------
CREATE TABLE Usuario (
    id_usuario         INT           NOT NULL AUTO_INCREMENT,
    id_rol             INT           NOT NULL,
    nombre             VARCHAR(100)  NOT NULL,
    apellido_paterno   VARCHAR(100)  NOT NULL,
    apellido_materno   VARCHAR(100)  NULL,
    correo             VARCHAR(150)  NOT NULL,
    telefono           VARCHAR(15)   NULL,
    contrasena_hash    VARCHAR(256)  NOT NULL,
    activo             TINYINT(1)    NOT NULL DEFAULT 1,
    fecha_registro     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso      DATETIME      NULL,
    PRIMARY KEY (id_usuario),
    UNIQUE KEY UQ_Usuario_correo (correo),
    CONSTRAINT FK_Usuario_Rol FOREIGN KEY (id_rol)
        REFERENCES Rol (id_rol)
);

-- ------------------------------------------------------------
-- 3. Administrador
-- ------------------------------------------------------------
CREATE TABLE Administrador (
    id_administrador  INT           NOT NULL AUTO_INCREMENT,
    id_usuario        INT           NOT NULL,
    cargo             VARCHAR(100)  NULL,
    PRIMARY KEY (id_administrador),
    CONSTRAINT FK_Administrador_Usuario FOREIGN KEY (id_usuario)
        REFERENCES Usuario (id_usuario)
);

-- ------------------------------------------------------------
-- 4. Sucursal
-- ------------------------------------------------------------
CREATE TABLE Sucursal (
    id_sucursal      INT           NOT NULL AUTO_INCREMENT,
    id_administrador INT           NOT NULL,
    nombre           VARCHAR(100)  NOT NULL,
    calle            VARCHAR(150)  NULL,
    numero           VARCHAR(10)   NULL,
    colonia          VARCHAR(100)  NULL,
    ciudad           VARCHAR(100)  NULL,
    codigo_postal    CHAR(5)       NULL,
    telefono         VARCHAR(15)   NULL,
    correo           VARCHAR(100)  NULL,
    activa           TINYINT(1)    NOT NULL DEFAULT 1,
    fecha_registro   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_sucursal),
    CONSTRAINT FK_Sucursal_Administrador FOREIGN KEY (id_administrador)
        REFERENCES Administrador (id_administrador)
);

-- ------------------------------------------------------------
-- 5. Consultorio
-- ------------------------------------------------------------
CREATE TABLE Consultorio (
    id_consultorio  INT           NOT NULL AUTO_INCREMENT,
    id_sucursal     INT           NOT NULL,
    numero          VARCHAR(10)   NOT NULL,
    piso            VARCHAR(5)    NULL,
    descripcion     VARCHAR(200)  NULL,
    activo          TINYINT(1)    NOT NULL DEFAULT 1,
    PRIMARY KEY (id_consultorio),
    CONSTRAINT FK_Consultorio_Sucursal FOREIGN KEY (id_sucursal)
        REFERENCES Sucursal (id_sucursal)
);

-- ------------------------------------------------------------
-- 6. Doctor
-- ------------------------------------------------------------
CREATE TABLE Doctor (
    id_doctor           INT             NOT NULL AUTO_INCREMENT,
    id_usuario          INT             NOT NULL,
    id_sucursal         INT             NOT NULL,
    especialidad        VARCHAR(100)    NULL,
    rfc                 VARCHAR(13)     NULL,
    cedula_profesional  VARCHAR(20)     NULL,
    tarifa_consulta     DECIMAL(10,2)   NULL,
    PRIMARY KEY (id_doctor),
    CONSTRAINT FK_Doctor_Usuario  FOREIGN KEY (id_usuario)  REFERENCES Usuario  (id_usuario),
    CONSTRAINT FK_Doctor_Sucursal FOREIGN KEY (id_sucursal) REFERENCES Sucursal (id_sucursal)
);

-- ------------------------------------------------------------
-- 7. Paciente
-- ------------------------------------------------------------
CREATE TABLE Paciente (
    id_paciente      INT            NOT NULL AUTO_INCREMENT,
    id_usuario       INT            NOT NULL,
    fecha_nacimiento DATE           NULL,
    sexo             CHAR(1)        NULL,
    tipo_sangre      VARCHAR(5)     NULL,
    saldo_pendiente  DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    PRIMARY KEY (id_paciente),
    CONSTRAINT FK_Paciente_Usuario FOREIGN KEY (id_usuario)
        REFERENCES Usuario (id_usuario)
);

-- ------------------------------------------------------------
-- 8. Recepcionista
-- ------------------------------------------------------------
CREATE TABLE Recepcionista (
    id_recepcionista  INT          NOT NULL AUTO_INCREMENT,
    id_usuario        INT          NOT NULL,
    id_sucursal       INT          NOT NULL,
    turno             VARCHAR(20)  NULL,
    PRIMARY KEY (id_recepcionista),
    CONSTRAINT FK_Recepcionista_Usuario  FOREIGN KEY (id_usuario)  REFERENCES Usuario  (id_usuario),
    CONSTRAINT FK_Recepcionista_Sucursal FOREIGN KEY (id_sucursal) REFERENCES Sucursal (id_sucursal)
);

-- ------------------------------------------------------------
-- 9. HorarioDoctor
-- ------------------------------------------------------------
CREATE TABLE HorarioDoctor (
    id_horario     INT         NOT NULL AUTO_INCREMENT,
    id_doctor      INT         NOT NULL,
    id_consultorio INT         NOT NULL,
    dia_semana     TINYINT     NOT NULL,
    hora_inicio    TIME        NOT NULL,
    hora_fin       TIME        NOT NULL,
    activo         TINYINT(1)  NOT NULL DEFAULT 1,
    PRIMARY KEY (id_horario),
    CONSTRAINT FK_Horario_Doctor      FOREIGN KEY (id_doctor)      REFERENCES Doctor      (id_doctor),
    CONSTRAINT FK_Horario_Consultorio FOREIGN KEY (id_consultorio) REFERENCES Consultorio (id_consultorio)
);

-- ------------------------------------------------------------
-- 10. BloqueoHorario
-- ------------------------------------------------------------
CREATE TABLE BloqueoHorario (
    id_bloqueo      INT           NOT NULL AUTO_INCREMENT,
    id_doctor       INT           NOT NULL,
    fecha_inicio    DATE          NOT NULL,
    fecha_fin       DATE          NOT NULL,
    hora_inicio     TIME          NOT NULL,
    hora_fin        TIME          NOT NULL,
    motivo          VARCHAR(200)  NULL,
    creado_por      INT           NOT NULL,
    fecha_registro  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_bloqueo),
    CONSTRAINT FK_Bloqueo_Doctor    FOREIGN KEY (id_doctor)  REFERENCES Doctor  (id_doctor),
    CONSTRAINT FK_Bloqueo_CreadoPor FOREIGN KEY (creado_por) REFERENCES Usuario (id_usuario)
);

-- ------------------------------------------------------------
-- 11. Cita
-- ------------------------------------------------------------
CREATE TABLE Cita (
    id_cita          INT             NOT NULL AUTO_INCREMENT,
    id_paciente      INT             NOT NULL,
    id_doctor        INT             NOT NULL,
    id_consultorio   INT             NOT NULL,
    id_recepcionista INT             NULL,
    fecha            DATE            NOT NULL,
    hora_inicio      TIME            NOT NULL,
    hora_fin         TIME            NOT NULL,
    estado           VARCHAR(25)     NOT NULL DEFAULT 'Programada',
    motivo_consulta  VARCHAR(500)    NULL,
    costo_total      DECIMAL(10,2)   NULL,
    fecha_registro   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    registrado_por   INT             NOT NULL,
    PRIMARY KEY (id_cita),
    CONSTRAINT FK_Cita_Paciente      FOREIGN KEY (id_paciente)      REFERENCES Paciente      (id_paciente),
    CONSTRAINT FK_Cita_Doctor        FOREIGN KEY (id_doctor)        REFERENCES Doctor        (id_doctor),
    CONSTRAINT FK_Cita_Consultorio   FOREIGN KEY (id_consultorio)   REFERENCES Consultorio   (id_consultorio),
    CONSTRAINT FK_Cita_Recepcionista FOREIGN KEY (id_recepcionista) REFERENCES Recepcionista (id_recepcionista),
    CONSTRAINT FK_Cita_RegistradoPor FOREIGN KEY (registrado_por)   REFERENCES Usuario       (id_usuario)
);

-- ------------------------------------------------------------
-- 12. Cancelacion
-- ------------------------------------------------------------
CREATE TABLE Cancelacion (
    id_cancelacion       INT             NOT NULL AUTO_INCREMENT,
    id_cita              INT             NOT NULL,
    cancelado_por        INT             NOT NULL,
    motivo               VARCHAR(500)    NULL,
    fecha_cancelacion    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    aplica_reembolso     TINYINT(1)      NOT NULL DEFAULT 0,
    porcentaje_reembolso DECIMAL(5,2)    NULL,
    PRIMARY KEY (id_cancelacion),
    CONSTRAINT FK_Cancelacion_Cita         FOREIGN KEY (id_cita)        REFERENCES Cita    (id_cita),
    CONSTRAINT FK_Cancelacion_CanceladoPor FOREIGN KEY (cancelado_por)  REFERENCES Usuario (id_usuario)
);

-- ------------------------------------------------------------
-- 13. Pago
-- ------------------------------------------------------------
CREATE TABLE Pago (
    id_pago        INT             NOT NULL AUTO_INCREMENT,
    id_cita        INT             NOT NULL,
    metodo_pago    VARCHAR(20)     NOT NULL,
    tipo_pago      VARCHAR(15)     NULL,
    monto          DECIMAL(10,2)   NOT NULL,
    fecha_pago     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    referencia     VARCHAR(100)    NULL,
    registrado_por INT             NOT NULL,
    estado         VARCHAR(15)     NOT NULL DEFAULT 'Completado',
    PRIMARY KEY (id_pago),
    CONSTRAINT FK_Pago_Cita          FOREIGN KEY (id_cita)        REFERENCES Cita    (id_cita),
    CONSTRAINT FK_Pago_RegistradoPor FOREIGN KEY (registrado_por) REFERENCES Usuario (id_usuario)
);

-- ------------------------------------------------------------
-- 14. Expediente
-- ------------------------------------------------------------
CREATE TABLE Expediente (
    id_expediente         INT           NOT NULL AUTO_INCREMENT,
    id_paciente           INT           NOT NULL,
    codigo                VARCHAR(20)   NOT NULL,
    ant_patologicos       VARCHAR(1000) NULL,
    medicamentos_actuales VARCHAR(500)  NULL,
    alergias              VARCHAR(500)  NULL,
    fecha_apertura        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_expediente),
    UNIQUE KEY UQ_Expediente_codigo (codigo),
    CONSTRAINT FK_Expediente_Paciente FOREIGN KEY (id_paciente)
        REFERENCES Paciente (id_paciente)
);

-- ------------------------------------------------------------
-- 15. ConsultaFisica
-- ------------------------------------------------------------
CREATE TABLE ConsultaFisica (
    id_consulta           INT             NOT NULL AUTO_INCREMENT,
    id_cita               INT             NOT NULL,
    id_expediente         INT             NOT NULL,
    id_doctor             INT             NOT NULL,
    motivo_consulta       VARCHAR(500)    NULL,
    peso_kg               DECIMAL(5,2)    NULL,
    talla_cm              DECIMAL(5,2)    NULL,
    tension_arterial      VARCHAR(10)     NULL,
    temperatura_c         DECIMAL(4,1)    NULL,
    frecuencia_cardiaca   SMALLINT        NULL,
    notas_examen_fisico   VARCHAR(2000)   NULL,
    notas_clinicas        VARCHAR(2000)   NULL,
    tratamiento           VARCHAR(2000)   NULL,
    indicaciones          VARCHAR(1000)   NULL,
    fecha_consulta        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    firmada               TINYINT(1)      NOT NULL DEFAULT 0,
    fecha_firma           DATETIME        NULL,
    PRIMARY KEY (id_consulta),
    CONSTRAINT FK_Consulta_Cita       FOREIGN KEY (id_cita)       REFERENCES Cita       (id_cita),
    CONSTRAINT FK_Consulta_Expediente FOREIGN KEY (id_expediente) REFERENCES Expediente (id_expediente),
    CONSTRAINT FK_Consulta_Doctor     FOREIGN KEY (id_doctor)     REFERENCES Doctor     (id_doctor)
);


-- ------------------------------------------------------------
-- 16. Notificacion
-- ------------------------------------------------------------
CREATE TABLE Notificacion (
    id_notificacion  INT           NOT NULL AUTO_INCREMENT,
    id_usuario       INT           NOT NULL,
    titulo           VARCHAR(100)  NOT NULL,
    mensaje          VARCHAR(500)  NOT NULL,
    leida            TINYINT(1)    NOT NULL DEFAULT 0,
    fecha_creacion   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_notificacion),
    CONSTRAINT FK_Notificacion_Usuario FOREIGN KEY (id_usuario)
        REFERENCES Usuario (id_usuario)
);