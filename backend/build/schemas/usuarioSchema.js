import { z } from 'zod';
// ============================================================
// REGISTRO
// ============================================================
// Paciente
export const pacienteSchema = z.object({
    nombre: z.string().min(2).max(100),
    apellido_paterno: z.string().min(2).max(100),
    apellido_materno: z.string().min(2).max(100).nullable().optional(),
    correo: z.string().email(),
    telefono: z.string().min(10).max(15).nullable().optional(),
    contraseña: z.string().min(6).max(256),
    fecha_nacimiento: z.string().optional(),
    sexo: z.enum(['M', 'F']).optional(),
    tipo_sangre: z.string().max(5).optional()
});
// Login
export const loginSchema = z.object({
    correo: z.string().email(),
    contraseña: z.string().min(6)
});
// Doctor
export const doctorSchema = z.object({
    nombre: z.string().min(2).max(100),
    apellido_paterno: z.string().min(2).max(100),
    apellido_materno: z.string().min(2).max(100).nullable().optional(),
    correo: z.string().email(),
    telefono: z.string().min(10).max(15).nullable().optional(),
    contraseña: z.string().min(6).max(256),
    id_sucursal: z.number().int().positive(),
    especialidad: z.string().min(2).max(100),
    rfc: z.string().min(12).max(13),
    cedula_profesional: z.string().min(5).max(20),
    tarifa_consulta: z.number().positive()
});
// Recepcionista
export const recepcionistaSchema = z.object({
    nombre: z.string().min(2).max(100),
    apellido_paterno: z.string().min(2).max(100),
    apellido_materno: z.string().min(2).max(100).nullable().optional(),
    correo: z.string().email(),
    telefono: z.string().min(10).max(15).nullable().optional(),
    contraseña: z.string().min(6).max(256),
    id_sucursal: z.number().int().positive(),
    turno: z.string().min(2).max(20)
});
// Administrador
export const administradorSchema = z.object({
    nombre: z.string().min(2).max(100),
    apellido_paterno: z.string().min(2).max(100),
    apellido_materno: z.string().min(2).max(100).nullable().optional(),
    correo: z.string().email(),
    telefono: z.string().min(10).max(15).nullable().optional(),
    contraseña: z.string().min(6).max(256),
    cargo: z.string().min(2).max(100)
});
// Sucursal
export const sucursalSchema = z.object({
    id_administrador: z.number().int().positive(),
    nombre: z.string().min(2).max(100),
    calle: z.string().min(2).max(150),
    numero: z.string().max(10),
    colonia: z.string().min(2).max(100),
    ciudad: z.string().min(2).max(100),
    codigo_postal: z.string().length(5),
    telefono: z.string().min(10).max(15),
    correo: z.string().email()
});
// Consultorio
export const consultorioSchema = z.object({
    id_sucursal: z.number().int().positive(),
    numero: z.string().min(1).max(10),
    piso: z.string().max(5).optional(),
    descripcion: z.string().max(200).optional()
});
// Cita
export const citaSchema = z.object({
    id_paciente: z.number().int().positive(),
    id_doctor: z.number().int().positive(),
    id_consultorio: z.number().int().positive(),
    id_recepcionista: z.number().int().positive().nullable().optional(),
    fecha: z.string(),
    hora_inicio: z.string(),
    hora_fin: z.string(),
    motivo_consulta: z.string().min(2).max(500),
    costo_total: z.number().positive(),
    registrado_por: z.number().int().positive(),
    metodo_pago: z.string().min(2).max(20),
    referencia: z.string().max(100).nullable().optional()
});
// Expediente
export const expedienteSchema = z.object({
    id_paciente: z.number().int().positive(),
    codigo: z.string().min(2).max(20),
    ant_patologicos: z.string().max(1000).optional(),
    medicamentos_actuales: z.string().max(500).optional(),
    alergias: z.string().max(500).optional()
});
// Consulta Fisica
export const consultaFisicaSchema = z.object({
    id_cita: z.number().int().positive(),
    id_expediente: z.number().int().positive(),
    id_doctor: z.number().int().positive(),
    motivo_consulta: z.string().min(2).max(500),
    peso_kg: z.number().positive(),
    talla_cm: z.number().positive(),
    tension_arterial: z.string().max(10),
    temperatura_c: z.number(),
    frecuencia_cardiaca: z.number().int().positive(),
    notas_examen_fisico: z.string().max(2000),
    notas_clinicas: z.string().max(2000),
    tratamiento: z.string().max(2000),
    indicaciones: z.string().max(1000)
});
// Horario Doctor
export const horarioDoctorSchema = z.object({
    id_doctor: z.number().int().positive(),
    id_consultorio: z.number().int().positive(),
    dia_semana: z.number().int().min(0).max(6),
    hora_inicio: z.string(),
    hora_fin: z.string()
});
// Bloqueo Horario
export const bloqueoHorarioSchema = z.object({
    id_doctor: z.number().int().positive(),
    fecha: z.string(),
    hora_inicio: z.string(),
    hora_fin: z.string(),
    motivo: z.string().max(200).optional(),
    creado_por: z.number().int().positive()
});
// Pago Final
export const pagoFinalSchema = z.object({
    id_cita: z.number().int().positive(),
    metodo_pago: z.string().min(2).max(20),
    referencia: z.string().max(100).nullable().optional(),
    registrado_por: z.number().int().positive()
});
// Notificacion
export const notificacionSchema = z.object({
    id_usuario: z.number().int().positive(),
    titulo: z.string().min(2).max(100),
    mensaje: z.string().min(2).max(500)
});
// ============================================================
// EDITAR
// ============================================================
// Editar Paciente
export const editarPacienteSchema = z.object({
    id_paciente: z.number().int().positive(),
    id_usuario: z.number().int().positive(),
    nombre: z.string().min(2).max(100),
    apellido_paterno: z.string().min(2).max(100),
    apellido_materno: z.string().min(2).max(100).nullable().optional(),
    correo: z.string().email(),
    telefono: z.string().min(10).max(15).nullable().optional(),
    contraseña: z.string().min(6).max(256).optional(),
    fecha_nacimiento: z.string().optional(),
    sexo: z.enum(['M', 'F']).optional(),
    tipo_sangre: z.string().max(5).optional(),
    saldo_pendiente: z.number().optional()
});
// Editar Doctor
export const editarDoctorSchema = z.object({
    id_doctor: z.number().int().positive(),
    id_usuario: z.number().int().positive(),
    nombre: z.string().min(2).max(100),
    apellido_paterno: z.string().min(2).max(100),
    apellido_materno: z.string().min(2).max(100).nullable().optional(),
    correo: z.string().email(),
    telefono: z.string().min(10).max(15).nullable().optional(),
    contraseña: z.string().min(6).max(256).optional(),
    id_sucursal: z.number().int().positive(),
    especialidad: z.string().min(2).max(100),
    rfc: z.string().min(12).max(13),
    cedula_profesional: z.string().min(5).max(20),
    tarifa_consulta: z.number().positive()
});
// Editar Recepcionista
export const editarRecepcionistaSchema = z.object({
    id_recepcionista: z.number().int().positive(),
    id_usuario: z.number().int().positive(),
    nombre: z.string().min(2).max(100),
    apellido_paterno: z.string().min(2).max(100),
    apellido_materno: z.string().min(2).max(100).nullable().optional(),
    correo: z.string().email(),
    telefono: z.string().min(10).max(15).nullable().optional(),
    contraseña: z.string().min(6).max(256).optional(),
    id_sucursal: z.number().int().positive(),
    turno: z.string().min(2).max(20)
});
// Editar Administrador
export const editarAdministradorSchema = z.object({
    id_administrador: z.number().int().positive(),
    id_usuario: z.number().int().positive(),
    nombre: z.string().min(2).max(100),
    apellido_paterno: z.string().min(2).max(100),
    apellido_materno: z.string().min(2).max(100).nullable().optional(),
    correo: z.string().email(),
    telefono: z.string().min(10).max(15).nullable().optional(),
    contraseña: z.string().min(6).max(256).optional(),
    cargo: z.string().min(2).max(100)
});
// Editar Sucursal
export const editarSucursalSchema = z.object({
    id_sucursal: z.number().int().positive(),
    id_administrador: z.number().int().positive(),
    nombre: z.string().min(2).max(100),
    calle: z.string().min(2).max(150),
    numero: z.string().max(10),
    colonia: z.string().min(2).max(100),
    ciudad: z.string().min(2).max(100),
    codigo_postal: z.string().length(5),
    telefono: z.string().min(10).max(15),
    correo: z.string().email(),
    activa: z.number().int().min(0).max(1)
});
// Editar Consultorio
export const editarConsultorioSchema = z.object({
    id_consultorio: z.number().int().positive(),
    id_sucursal: z.number().int().positive(),
    numero: z.string().min(1).max(10),
    piso: z.string().max(5).optional(),
    descripcion: z.string().max(200).optional(),
    activo: z.number().int().min(0).max(1)
});
// Editar Cita
export const editarCitaSchema = z.object({
    id_cita: z.number().int().positive(),
    id_paciente: z.number().int().positive(),
    id_doctor: z.number().int().positive(),
    id_consultorio: z.number().int().positive(),
    id_recepcionista: z.number().int().positive().nullable().optional(),
    fecha: z.string(),
    hora_inicio: z.string(),
    hora_fin: z.string(),
    estado: z.string().max(25),
    motivo_consulta: z.string().min(2).max(500),
    costo_total: z.number().positive(),
    registrado_por: z.number().int().positive()
});
// Editar Expediente
export const editarExpedienteSchema = z.object({
    id_expediente: z.number().int().positive(),
    id_paciente: z.number().int().positive(),
    codigo: z.string().min(2).max(20),
    ant_patologicos: z.string().max(1000).optional(),
    medicamentos_actuales: z.string().max(500).optional(),
    alergias: z.string().max(500).optional()
});
// Editar Consulta Fisica
export const editarConsultaFisicaSchema = z.object({
    id_consulta: z.number().int().positive(),
    id_cita: z.number().int().positive(),
    id_expediente: z.number().int().positive(),
    id_doctor: z.number().int().positive(),
    motivo_consulta: z.string().min(2).max(500),
    peso_kg: z.number().positive(),
    talla_cm: z.number().positive(),
    tension_arterial: z.string().max(10),
    temperatura_c: z.number(),
    frecuencia_cardiaca: z.number().int().positive(),
    notas_examen_fisico: z.string().max(2000),
    notas_clinicas: z.string().max(2000),
    tratamiento: z.string().max(2000),
    indicaciones: z.string().max(1000),
    firmada: z.number().int().min(0).max(1)
});
// Editar Horario Doctor
export const editarHorarioDoctorSchema = z.object({
    id_horario: z.number().int().positive(),
    id_doctor: z.number().int().positive(),
    id_consultorio: z.number().int().positive(),
    dia_semana: z.number().int().min(0).max(6),
    hora_inicio: z.string(),
    hora_fin: z.string(),
    activo: z.number().int().min(0).max(1)
});
// Cancelar Cita
export const cancelarCitaSchema = z.object({
    id_cita: z.number().int().positive(),
    motivo: z.string().min(2).max(500),
    cancelado_por: z.number().int().positive()
});
// Cambiar Contraseña
export const cambiarContrasenaSchema = z.object({
    id_usuario: z.number().int().positive(),
    contraseña: z.string().min(6).max(256)
});
