export interface Usuario {
  id_usuario: number;
  id_rol: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  correo: string;
  telefono?: string | null;
  activo: number;
  fecha_registro: string;
  ultimo_acceso?: string | null;
}

export type UsuarioNuevo = Omit<
  Usuario,
  'id_usuario' | 'id_rol' | 'activo' | 'fecha_registro' | 'ultimo_acceso'
> & {
  contraseña: string;
};

export interface UsuarioLogin {
  correo: string;
  contraseña: string;
}

export type UsuarioEditar = Partial<
  Omit<Usuario, 'id_usuario' | 'id_rol' | 'activo' | 'fecha_registro' | 'ultimo_acceso'>
>;