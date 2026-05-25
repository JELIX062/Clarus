-- ============================================================
--  Datos de prueba: Base de datos clarus
-- ============================================================

-- ------------------------------------------------------------
-- 1. Rol
-- ------------------------------------------------------------
INSERT INTO Rol (nombre, descripcion) VALUES
('Administrador', 'Gestiona sucursales y usuarios del sistema'),
('Doctor',        'Médico que atiende consultas'),
('Recepcionista', 'Registra y gestiona citas'),
('Paciente',      'Usuario que agenda y recibe consultas');

-- ------------------------------------------------------------
-- 2. Usuario
-- ------------------------------------------------------------
INSERT INTO Usuario (id_rol, nombre, apellido_paterno, apellido_materno, correo, telefono, contrasena_hash, activo) VALUES
(1, 'Rebeca',   'Godoy',     'Castro',     'rebeca.godoy@clarus.com',    '6671000001', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(2, 'Diego',    'Velázquez', 'Sanchez',    'diego.velazquez@clarus.com', '6671000002', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(2, 'Bruno',    'López',     'Acosta',     'bruno.lopez@clarus.com',     '6671000003', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(3, 'Santiago', 'Cuan',      'Villalobos', 'santiago.cuan@clarus.com',   '6671000004', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(4, 'Joel',     'Félix',     'Rubio',      'joel.felix@clarus.com',      '6671000005', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(4, 'David',    'Félix',     'Rubio',      'david.felix@clarus.com',     '6671000006', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1);

-- ------------------------------------------------------------
-- 3. Administrador
-- ------------------------------------------------------------
INSERT INTO Administrador (id_usuario, cargo) VALUES
(1, 'Director General');

-- ------------------------------------------------------------
-- 4. Sucursal
-- ------------------------------------------------------------
INSERT INTO Sucursal (id_administrador, nombre, calle, numero, colonia, ciudad, codigo_postal, telefono, correo, activa) VALUES
(1, 'Clarus Sur',   'Álvaro Obregón', '120', 'Villa Bonita', 'Culiacán', '80000', '6677000001', 'centro@clarus.com', 1),
(1, 'Clarus Norte', 'Blvd. Zapata',   '450', 'Las Quintas',  'Culiacán', '80020', '6677000002', 'norte@clarus.com',  1);

-- ------------------------------------------------------------
-- 5. Consultorio
-- ------------------------------------------------------------
INSERT INTO Consultorio (id_sucursal, numero, piso, descripcion, activo) VALUES
(1, '101', '1', 'Consultorio de medicina general', 1),
(1, '102', '1', 'Consultorio de cardiología',      1),
(2, '201', '2', 'Consultorio de medicina general', 1);

-- ------------------------------------------------------------
-- 6. Doctor
-- ------------------------------------------------------------
INSERT INTO Doctor (id_usuario, especialidad, rfc, cedula_profesional, tarifa_consulta, duracion_consulta) VALUES
(2, 'Medicina General', 'VELD900512AB1', '1234567', 500.00, 30),
(3, 'Cardiología',      'LOBR850318CD2', '7654321', 800.00, 45);
-- ------------------------------------------------------------
-- 7. Paciente
-- ------------------------------------------------------------
INSERT INTO Paciente (id_usuario, fecha_nacimiento, sexo, tipo_sangre, saldo_pendiente) VALUES
(5, '1992-07-10', 'M', 'O+', 0.00),
(6, '1989-11-25', 'M', 'A+', 0.00);

-- ------------------------------------------------------------
-- 8. Recepcionista
-- ------------------------------------------------------------
INSERT INTO Recepcionista (id_usuario, id_sucursal, turno) VALUES
(4, 1, 'Matutino');

-- ------------------------------------------------------------
-- 9. HorarioDoctor
-- ------------------------------------------------------------
INSERT INTO HorarioDoctor (id_doctor, id_consultorio, dia_semana, hora_inicio, hora_fin, activo) VALUES
(1, 1, 1, '09:00:00', '14:00:00', 1),  -- Diego, Lunes
(1, 1, 3, '09:00:00', '14:00:00', 1),  -- Diego, Miércoles
(1, 1, 5, '09:00:00', '13:00:00', 1),  -- Diego, Viernes
(2, 3, 2, '10:00:00', '15:00:00', 1),  -- Bruno, Martes
(2, 3, 4, '10:00:00', '15:00:00', 1);  -- Bruno, Jueves

-- ------------------------------------------------------------
-- 10. BloqueoHorario
-- ------------------------------------------------------------
INSERT INTO BloqueoHorario (id_doctor, fecha_inicio, fecha_fin, hora_inicio, hora_fin, motivo, creado_por) VALUES
(1, '2026-04-14', '2026-04-14', '09:00:00', '11:00:00', 'Congreso médico', 1),
(2, '2026-04-15', '2026-04-17', '10:00:00', '15:00:00', 'Vacaciones',      1);

-- ------------------------------------------------------------
-- 11. Cita
-- ------------------------------------------------------------
INSERT INTO Cita (id_paciente, id_doctor, id_consultorio, id_recepcionista, fecha, hora_inicio, hora_fin, estado, motivo_consulta, costo_total, registrado_por) VALUES
(1, 1, 1, 1, '2026-04-16', '09:00:00', '09:30:00', 'Programada', 'Dolor de cabeza frecuente',   500.00, 4),
(2, 2, 3, 1, '2026-04-17', '10:00:00', '10:30:00', 'Programada', 'Revisión cardiológica anual', 800.00, 4);

-- ------------------------------------------------------------
-- 12. Cancelacion
-- ------------------------------------------------------------
INSERT INTO Cancelacion (id_cita, cancelado_por, motivo, aplica_reembolso, porcentaje_reembolso) VALUES
(2, 6, 'El paciente no puede asistir por trabajo', 1, 50.00);

-- ------------------------------------------------------------
-- 13. Pago
-- ------------------------------------------------------------
INSERT INTO Pago (id_cita, metodo_pago, tipo_pago, monto, referencia, registrado_por, estado) VALUES
(1, 'Efectivo', 'Total',    500.00, NULL,        4, 'Completado'),
(2, 'Tarjeta',  'Anticipo', 400.00, 'TXN-00123', 4, 'Completado');

-- ------------------------------------------------------------
-- 14. Expediente
-- CAMBIOS: eliminado 'codigo', agregado 'id_doctor'
-- ------------------------------------------------------------
INSERT INTO Expediente (id_paciente, id_doctor, ant_patologicos, medicamentos_actuales, alergias) VALUES
(1, 1, 'Hipertensión controlada',     'Losartán 50mg', 'Penicilina'),
(2, 2, 'Sin antecedentes relevantes', 'Ninguno',       'Ninguna');

-- ------------------------------------------------------------
-- 15. ConsultaFisica
-- CAMBIOS: id_expediente ahora es opcional (NULL permitido)
-- ------------------------------------------------------------
INSERT INTO ConsultaFisica (id_cita, id_expediente, id_doctor, motivo_consulta, peso_kg, talla_cm, tension_arterial, temperatura_c, frecuencia_cardiaca, notas_examen_fisico, notas_clinicas, tratamiento, indicaciones, firmada) VALUES
(1, 1, 1,
'Dolor de cabeza frecuente',
78.00, 175.00, '120/80', 36.5, 74,
'Paciente consciente, orientado, sin alteraciones aparentes.',
'Cefalea tensional recurrente. Sin signos de alarma.',
'Paracetamol 500mg cada 8 horas por 3 días.',
'Evitar estrés, hidratarse correctamente, descanso adecuado.',
1);

-- ------------------------------------------------------------
-- 16. Doctor_Sucursal
-- ------------------------------------------------------------

INSERT INTO Doctor_Sucursal (id_doctor, id_sucursal) VALUES
(1, 1),  -- Diego trabaja en Clarus Sur
(2, 2);  -- Bruno trabaja en Clarus Norte