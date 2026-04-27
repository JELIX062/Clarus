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

// Tipo para editar paciente — omite solo el id
export type PacienteNuevo = Omit<Paciente, 'id_paciente'>;