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
    id_doctor: number;
    id_usuario: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string | null;
    correo: string;
    telefono?: string | null;
    especialidad: string;
    rfc: string;
    cedula_profesional: string;
    tarifa_consulta: number;
    id_sucursal: number;
}

// Tipo para registrar un nuevo doctor
export type DoctorNuevo = Omit<Doctor, 'id_doctor'> & {
    contraseña: string;
};

// Tipo para editar doctor
export type DoctorEditar = Doctor & {
    contraseña?: string;
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
    codigo: string;
    ant_patologicos: string;
    medicamentos_actuales: string;
    alergias: string;
    fecha_apertura?: string;
}

// Tipo para registrar un nuevo expediente
export type ExpedienteNuevo = Omit<Expediente, 'id_expediente' | 'fecha_apertura'>;

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