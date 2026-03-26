export interface ClienteIncidente {
  id: string;
  tipo: 'multa' | 'dano' | 'retraso';
  descripcion: string;
  fecha: string;
  monto?: number;
  pagado?: boolean;
  fechaPago?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  tipoDocumento: 'CC' | 'Pasaporte' | 'CE';
  numeroDocumento: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
  licencia: {
    numero: string;
    categoria: string;
    fechaVencimiento: string;
  };
  direccion: string;
  avatar?: string;
  reservasTotales: number;
  totalGastado: number;
  cancelaciones: number;
  score: number;
  incidentes?: ClienteIncidente[];
}

export const ClientesMock: Cliente[] = [
  {
    id: 'cli-001',
    nombre: 'Juan Pérez García',
    tipoDocumento: 'CC',
    numeroDocumento: '1234567890',
    telefono: '+57 300 123 4567',
    email: 'juan.perez@email.com',
    fechaNacimiento: '1990-05-15',
    licencia: {
      numero: 'L-12345678',
      categoria: 'A2',
      fechaVencimiento: '2027-05-15'
    },
    direccion: 'Calle 123 #45-67, Bogotá',
    avatar: 'https://i.pravatar.cc/150?img=12',
    reservasTotales: 8,
    totalGastado: 2400,
    cancelaciones: 1,
    score: 85,
    incidentes: []
  },
  {
    id: 'cli-002',
    nombre: 'María Rodríguez López',
    tipoDocumento: 'CC',
    numeroDocumento: '9876543210',
    telefono: '+57 310 987 6543',
    email: 'maria.rodriguez@email.com',
    fechaNacimiento: '1985-08-22',
    licencia: {
      numero: 'L-87654321',
      categoria: 'A2',
      fechaVencimiento: '2026-08-22'
    },
    direccion: 'Carrera 45 #12-34, Medellín',
    avatar: 'https://i.pravatar.cc/150?img=5',
    reservasTotales: 12,
    totalGastado: 3600,
    cancelaciones: 0,
    score: 100,
    incidentes: []
  },
  {
    id: 'cli-003',
    nombre: 'Carlos Martínez Silva',
    tipoDocumento: 'CC',
    numeroDocumento: '5555555555',
    telefono: '+57 320 555 5555',
    email: 'carlos.martinez@email.com',
    fechaNacimiento: '1992-03-10',
    licencia: {
      numero: 'L-55555555',
      categoria: 'A1',
      fechaVencimiento: '2025-03-10'
    },
    direccion: 'Avenida 68 #23-45, Bogotá',
    avatar: 'https://i.pravatar.cc/150?img=33',
    reservasTotales: 3,
    totalGastado: 900,
    cancelaciones: 2,
    score: 45,
    incidentes: [
      {
        id: 'inc-001',
        tipo: 'multa',
        descripcion: 'Exceso de velocidad en zona urbana',
        fecha: '2026-02-14',
        monto: 180,
        pagado: false,
      },
      {
        id: 'inc-002',
        tipo: 'dano',
        descripcion: 'Raspon lateral reportado en check-out',
        fecha: '2026-01-22',
        monto: 140,
        pagado: false,
      },
    ]
  },
  {
    id: 'cli-004',
    nombre: 'Ana Gómez Torres',
    tipoDocumento: 'CE',
    numeroDocumento: 'CE-123456',
    telefono: '+57 315 111 2222',
    email: 'ana.gomez@email.com',
    fechaNacimiento: '1988-11-30',
    licencia: {
      numero: 'L-11112222',
      categoria: 'A2',
      fechaVencimiento: '2028-11-30'
    },
    direccion: 'Calle 50 #30-20, Cali',
    avatar: 'https://i.pravatar.cc/150?img=9',
    reservasTotales: 6,
    totalGastado: 1800,
    cancelaciones: 0,
    score: 90,
    incidentes: []
  },
  {
    id: 'cli-005',
    nombre: 'Luis Hernández Díaz',
    tipoDocumento: 'Pasaporte',
    numeroDocumento: 'P-987654',
    telefono: '+57 318 999 8888',
    email: 'luis.hernandez@email.com',
    fechaNacimiento: '1995-07-18',
    licencia: {
      numero: 'L-99998888',
      categoria: 'A2',
      fechaVencimiento: '2026-07-18'
    },
    direccion: 'Carrera 15 #80-50, Barranquilla',
    avatar: 'https://i.pravatar.cc/150?img=15',
    reservasTotales: 1,
    totalGastado: 300,
    cancelaciones: 0,
    score: 75,
    incidentes: []
  }
];