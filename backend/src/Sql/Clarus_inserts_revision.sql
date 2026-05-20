-- ------------------------------------------------------------
-- Rol
-- ------------------------------------------------------------
INSERT INTO Rol (nombre, descripcion) VALUES
('Administrador', 'Gestiona sucursales y usuarios del sistema'),
('Doctor',        'Médico que atiende consultas'),
('Recepcionista', 'Registra y gestiona citas'),
('Paciente',      'Usuario que agenda y recibe consultas');

-- ------------------------------------------------------------
-- Usuario
-- ------------------------------------------------------------
INSERT INTO Usuario (id_rol, nombre, apellido_paterno, apellido_materno, correo, telefono, contrasena_hash, activo) VALUES
(1, 'Rebeca',   'Godoy',     'Castro',     'rebeca.godoy@clarus.com',    '6671000001', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(2, 'Diego',    'Velázquez', 'Sanchez',    'diego.velazquez@clarus.com', '6671000002', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(2, 'Bruno',    'López',     'Acosta',     'bruno.lopez@clarus.com',     '6671000003', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(3, 'Santiago', 'Cuan',      'Villalobos', 'santiago.cuan@clarus.com',   '6671000004', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(4, 'Emmanuel', 'Tizoc',     'Beltran',    'emmanuel.tizoc@clarus.com',  '6671000005', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(4, 'David',    'Félix',     'Valenzuela', 'david.felix@clarus.com',     '6671000006', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1);

-- ------------------------------------------------------------
-- Administrador
-- ------------------------------------------------------------
INSERT INTO Administrador (id_usuario, cargo) VALUES
(1, 'Director General');

-- ------------------------------------------------------------
-- Sucursal
-- ------------------------------------------------------------
INSERT INTO Sucursal (id_administrador, nombre, calle, numero, colonia, ciudad, codigo_postal, telefono, correo, activa) VALUES
(1, 'Clarus Sur',   'Álvaro Obregón', '120', 'Villa Bonita', 'Culiacán', '80000', '6677000001', 'sur@clarus.com',   1),
(1, 'Clarus Norte', 'Blvd. Zapata',   '450', 'Las Quintas',  'Culiacán', '80020', '6677000002', 'norte@clarus.com', 1);

-- ------------------------------------------------------------
-- Consultorio
-- ------------------------------------------------------------
INSERT INTO Consultorio (id_sucursal, numero, piso, descripcion, activo) VALUES
(1, '101', '1', 'Consultorio de medicina general', 1),
(1, '102', '1', 'Consultorio de pediatría',        1),
(2, '201', '2', 'Consultorio de cardiología',      1),
(2, '202', '2', 'Consultorio de neurología',       1);

-- ------------------------------------------------------------
-- Doctor
-- CAMBIOS: eliminado id_sucursal (ahora en Doctor_Sucursal)
-- ------------------------------------------------------------
INSERT INTO Doctor (id_usuario, especialidad, rfc, cedula_profesional, tarifa_consulta) VALUES
(2, 'Medicina General', 'VELD900512AB1', '1234567', 500.00),
(3, 'Cardiología',      'LOBR850318CD2', '7654321', 800.00);

-- ------------------------------------------------------------
-- Recepcionista
-- ------------------------------------------------------------
INSERT INTO Recepcionista (id_usuario, id_sucursal, turno) VALUES
(4, 1, 'Matutino');

-- ------------------------------------------------------------
-- Paciente
-- ------------------------------------------------------------
INSERT INTO Paciente (id_usuario, fecha_nacimiento, sexo, tipo_sangre, saldo_pendiente) VALUES
(5, '1992-07-10', 'M', 'O+', 0.00),
(6, '1989-11-25', 'M', 'A+', 0.00);

-- ------------------------------------------------------------
-- HorarioDoctor
-- ------------------------------------------------------------
INSERT INTO HorarioDoctor (id_doctor, id_consultorio, dia_semana, hora_inicio, hora_fin, activo) VALUES
(1, 1, 1, '09:00:00', '14:00:00', 1),
(1, 1, 3, '09:00:00', '14:00:00', 1),
(1, 1, 5, '09:00:00', '13:00:00', 1),
(2, 3, 2, '10:00:00', '15:00:00', 1),
(2, 3, 4, '10:00:00', '15:00:00', 1);

-- ------------------------------------------------------------
-- Doctor_Sucursal
-- ------------------------------------------------------------
INSERT INTO Doctor_Sucursal (id_doctor, id_sucursal) VALUES
(1, 1),  -- Diego trabaja en Clarus Sur
(2, 2);  -- Bruno trabaja en Clarus Norte