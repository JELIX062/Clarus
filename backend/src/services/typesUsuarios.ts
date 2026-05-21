// Interfaz principal del usuario en la base de datos
export interface Usuario {
    id_usuario: number;
    id_rol: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string | null;
    correo: string;
    telefono?: string | null;
    contrasena_hash: string;
    activo: number;
    fecha_registro: string;
    ultimo_acceso?: string | null;
}

// Tipo para registrar un nuevo usuario desde el frontend
export type UsuarioNuevo = {
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string | null;
    correo: string;
    telefono?: string | null;
    contraseña: string;
    fecha_nacimiento?: string;
    sexo?: string;
    tipo_sangre?: string;
};

// Tipo para login
export interface UsuarioLogin {
    correo: string;
    contraseña: string;
}

// Interfaz principal del paciente en la base de datos
export interface Paciente {
    id_paciente: number;
    id_usuario: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string | null;
    correo: string;
    telefono?: string | null;
    fecha_nacimiento: string;
    sexo: string;
    tipo_sangre: string;
    saldo_pendiente: number;
}

// Tipo para editar paciente
export type PacienteNuevo = Omit<Paciente, 'id_paciente'>;

// Tipo para editar paciente
export type PacienteEditar = Paciente & {
    contraseña?: string;
};

// Interfaz principal del doctor en la base de datos
export interface Doctor {
    id_doctor:          number
    id_usuario:         number
    nombre:             string
    apellido_paterno:   string
    apellido_materno?:  string | null
    correo:             string
    telefono?:          string | null
    especialidad:       string
    rfc:                string
    cedula_profesional: string
    tarifa_consulta:    number
    duracion_consulta:  number   // ← nuevo
    sucursales:         number[]
}


// Tipo para registrar un nuevo doctor
export type DoctorNuevo = Omit<Doctor, 'id_doctor'> & { 
    contraseña: string 
};

// Tipo para editar doctor
export type DoctorEditar = Doctor & { 
    contraseña?: string
};


// Interfaz principal de la recepcionista en la base de datos
export interface Recepcionista {
    id_recepcionista: number;
    id_usuario: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string | null;
    correo: string;
    telefono?: string | null;
    id_sucursal: number;
    turno: string;
}

// Tipo para registrar una nueva recepcionista
export type RecepcionistaNuevo = Omit<Recepcionista, 'id_recepcionista'> & {
    contraseña: string;
};

// Tipo para editar recepcionista
export type RecepcionistaEditar = Recepcionista & {
    contraseña?: string;
};

// Interfaz principal de la sucursal en la base de datos
export interface Sucursal {
    id_sucursal: number;
    id_administrador: number;
    nombre: string;
    calle: string;
    numero: string;
    colonia: string;
    ciudad: string;
    codigo_postal: string;
    telefono: string;
    correo: string;
    activa: number;
}

// Tipo para registrar una nueva sucursal
export type SucursalNuevo = Omit<Sucursal, 'id_sucursal'>;

// Interfaz principal del consultorio en la base de datos
export interface Consultorio {
    id_consultorio: number;
    id_sucursal: number;
    numero: string;
    piso: string;
    descripcion: string;
    activo: number;
}

// Tipo para registrar un nuevo consultorio
export type ConsultorioNuevo = Omit<Consultorio, 'id_consultorio'>;

// Interfaz principal del expediente en la base de datos
export interface Expediente {
    id_expediente: number;
    id_paciente: number;
    id_doctor: number;
    ant_patologicos?: string;
    medicamentos_actuales?: string;
    alergias?: string;
    fecha_apertura?: string;
}

// Tipo para registrar un nuevo expediente
export type ExpedienteNuevo = Omit<Expediente, 'id_expediente' | 'fecha_apertura'>;

// Tipo para editar un expediente
export type ExpedienteEditar = Omit<Expediente, 'id_doctor' | 'fecha_apertura'>

// Interfaz principal de la cita en la base de datos
export interface Cita {
    id_cita: number;
    id_paciente: number;
    id_doctor: number;
    id_consultorio: number;
    id_recepcionista?: number | null;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    estado: string;
    motivo_consulta: string;
    costo_total: number;
    fecha_registro?: string;
    registrado_por: number;
}

// Tipo para registrar una nueva cita
export type CitaNuevo = Omit<Cita, 'id_cita' | 'fecha_registro'>;

// Interfaz principal del horario del doctor
export interface HorarioDoctor {
    id_horario: number;
    id_doctor: number;
    id_consultorio: number;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    activo: number;
}

export type HorarioDoctorNuevo = Omit<HorarioDoctor, 'id_horario'>;

// Interfaz principal del bloqueo de horario
export interface BloqueoHorario {
    id_bloqueo:   number
    id_doctor:    number
    fecha_inicio: string
    fecha_fin:    string
    hora_inicio:  string
    hora_fin:     string
    motivo:       string
    creado_por:   number
    fecha_registro?: string
}

export type BloqueoHorarioNuevo = Omit<BloqueoHorario, 'id_bloqueo' | 'fecha_registro'>

// Interfaz principal del pago en la base de datos
export interface Pago {
    id_pago: number;
    id_cita: number;
    metodo_pago: string;
    tipo_pago: string;
    monto: number;
    fecha_pago?: string;
    referencia?: string | null;
    registrado_por: number;
    estado: string;
}

// Tipo para registrar un nuevo pago
export type PagoNuevo = Omit<Pago, 'id_pago' | 'fecha_pago'>;

// Interfaz principal del administrador en la base de datos
export interface Administrador {
    id_administrador: number;
    id_usuario: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string | null;
    correo: string;
    telefono?: string | null;
    cargo: string;
}

// Tipo para registrar un nuevo administrador
export type AdministradorNuevo = Omit<Administrador, 'id_administrador'> & {
    contraseña: string;
};

// Tipo para editar administrador
export type AdministradorEditar = Administrador & {
    contraseña?: string;
};

// Interfaz principal de la consulta fisica en la base de datos
export interface ConsultaFisica {
    id_consulta: number;
    id_cita: number;
    id_expediente?: number;
    id_doctor: number;
    motivo_consulta: string;
    peso_kg: number;
    talla_cm: number;
    tension_arterial: string;
    temperatura_c: number;
    frecuencia_cardiaca: number;
    notas_examen_fisico: string;
    notas_clinicas: string;
    tratamiento: string;
    indicaciones: string;
    fecha_consulta?: string;
    firmada: number;
    fecha_firma?: string | null;
}

// Tipo para registrar una nueva consulta fisica
export type ConsultaFisicaNuevo = Omit<ConsultaFisica, 'id_consulta' | 'fecha_consulta' | 'fecha_firma'>;

// Interfaz principal de la notificacion en la base de datos
export interface Notificacion {
    id_notificacion: number;
    id_usuario: number;
    titulo: string;
    mensaje: string;
    leida: number;
    fecha_creacion?: string;
}

// Tipo para crear una nueva notificacion
export type NotificacionNuevo = Omit<Notificacion, 'id_notificacion' | 'fecha_creacion' | 'leida'>;