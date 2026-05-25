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
(1, 'Rebeca',             'Godoy',     'Castro',    'godoy@clarus.com',     '6671000001', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(2, 'Diego',              'Velázquez', 'Sanchez',   'diego@clarus.com',     '6671000002', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(2, 'Bruno',              'López',     'Acosta',    'bruno@clarus.com',     '6671000003', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(2, 'Jose Leonardo',      'Zevada',    'Peñuelas',  'leonardo@clarus.com',  '6671000004', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(2, 'Joel',               'Félix',     'Rubio',     'joel@clarus.com',      '6671000005', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(2, 'Samantha Guadalupe', 'González',  'Alvarado',  'samantha@clarus.com',  '6671000006', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(3, 'Santiago',           'Cuan',      'Villalobos','santiago@clarus.com',  '6671000007', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(3, 'Dante Alejandro',    'Bio',       'Coronel',   'dante@clarus.com',     '6671000008', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(4, 'Emmanuel',           'Tizoc',     'Beltran',   'emmanuel@clarus.com',  '6671000009', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(4, 'David',              'Félix',     'Valenzuela','david@clarus.com',     '6671000010', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1),
(4, 'Daniel',             'Hernández', 'Padilla',   'daniel@clarus.com',    '6671000011', '$2b$10$nG9o7XzZk/A/Pk/J8.5U/OwdbxTT33KdHy3bgjGI4OKu3ngc1TIIO', 1);

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
-- ------------------------------------------------------------
INSERT INTO Doctor (id_usuario, especialidad, rfc, cedula_profesional, tarifa_consulta, duracion_consulta) VALUES
(2, 'Medicina General', 'VELD900512AB1', '1234567', 500.00, 30),
(3, 'Cardiología',      'LOBR850318CD2', '7654321', 800.00, 45),
(4, 'Pediatría',        'ZEPL900210AB3', '3456789', 600.00, 30),
(5, 'Neurología',       'FERJ880405CD4', '9876543', 700.00, 45),
(6, 'Ginecología',      'GOAS950712EF5', '5678901', 750.00, 45);

-- ------------------------------------------------------------
-- Recepcionista
-- ------------------------------------------------------------
INSERT INTO Recepcionista (id_usuario, id_sucursal, turno) VALUES
(7, 1, 'Matutino'),
(8, 2, 'Vespertino');

-- ------------------------------------------------------------
-- Paciente
-- ------------------------------------------------------------
INSERT INTO Paciente (id_usuario, fecha_nacimiento, sexo, tipo_sangre, saldo_pendiente) VALUES
(9,  '1992-07-10', 'M', 'O+', 0.00),
(10, '1989-11-25', 'M', 'A+', 0.00),
(11, '2000-03-15', 'M', 'B+', 0.00);

-- ------------------------------------------------------------
-- HorarioDoctor
-- ------------------------------------------------------------
INSERT INTO HorarioDoctor (id_doctor, id_consultorio, dia_semana, hora_inicio, hora_fin, activo) VALUES
(1, 1, 1, '09:00:00', '14:00:00', 1),  -- Diego, Lunes,      Consultorio 101
(1, 1, 3, '09:00:00', '14:00:00', 1),  -- Diego, Miércoles,  Consultorio 101
(1, 1, 5, '09:00:00', '13:00:00', 1),  -- Diego, Viernes,    Consultorio 101
(2, 3, 2, '10:00:00', '15:00:00', 1),  -- Bruno, Martes,     Consultorio 201
(2, 3, 4, '10:00:00', '15:00:00', 1),  -- Bruno, Jueves,     Consultorio 201
(3, 2, 1, '08:00:00', '13:00:00', 1),  -- Jose Leonardo, Lunes,     Consultorio 102
(3, 2, 3, '08:00:00', '13:00:00', 1),  -- Jose Leonardo, Miércoles, Consultorio 102
(4, 4, 2, '14:00:00', '19:00:00', 1),  -- Joel, Martes,  Consultorio 202
(4, 4, 4, '14:00:00', '19:00:00', 1),  -- Joel, Jueves,  Consultorio 202
(5, 2, 2, '09:00:00', '14:00:00', 1),  -- Samantha, Martes,  Consultorio 102
(5, 2, 5, '09:00:00', '13:00:00', 1);  -- Samantha, Viernes, Consultorio 102

-- ------------------------------------------------------------
-- Doctor_Sucursal
-- ------------------------------------------------------------
INSERT INTO Doctor_Sucursal (id_doctor, id_sucursal) VALUES
(1, 1),  -- Diego        → Clarus Sur
(2, 2),  -- Bruno        → Clarus Norte
(3, 1),  -- Jose Leonardo→ Clarus Sur
(4, 2),  -- Joel         → Clarus Norte
(5, 1);  -- Samantha     → Clarus Sur