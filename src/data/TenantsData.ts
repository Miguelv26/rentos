export interface Tenant {
  id: string;
  tenantId: string;
  nombreAgencia: string;
  emailAdmin: string;
  plan: 'basico' | 'pro' | 'enterprise';
  estado: 'activo' | 'suspendido' | 'prueba';
  limiteVehiculos: number;
  fechaSuscripcion: string;
  fechaCreacion: string;
  vehiculosRegistrados: number;
  ingresosGenerados: number;
  pais: string;
  ciudad: string;
  logo?: string;
}

export const TenantsMock: Tenant[] = [
  {
    id: 'ten-001',
    tenantId: 'TEN-001',
    nombreAgencia: 'Moto Rent Bogotá',
    emailAdmin: 'admin@motorentbogota.com',
    plan: 'pro',
    estado: 'activo',
    limiteVehiculos: 50,
    fechaSuscripcion: '2025-01-15',
    fechaCreacion: '2025-01-15',
    vehiculosRegistrados: 25,
    ingresosGenerados: 15000,
    pais: 'Colombia',
    ciudad: 'Bogotá',
    logo: 'https://via.placeholder.com/100x100/00E5FF/000000?text=MRB'
  },
  {
    id: 'ten-002',
    tenantId: 'TEN-002',
    nombreAgencia: 'Rent a Bike Medellín',
    emailAdmin: 'contacto@rentabikemde.com',
    plan: 'basico',
    estado: 'activo',
    limiteVehiculos: 10,
    fechaSuscripcion: '2025-06-20',
    fechaCreacion: '2025-06-20',
    vehiculosRegistrados: 12,
    ingresosGenerados: 6000,
    pais: 'Colombia',
    ciudad: 'Medellín'
  },
  {
    id: 'ten-003',
    tenantId: 'TEN-003',
    nombreAgencia: 'Cali Motos Express',
    emailAdmin: 'info@calimotosexp.com',
    plan: 'pro',
    estado: 'suspendido',
    limiteVehiculos: 50,
    fechaSuscripcion: '2024-11-10',
    fechaCreacion: '2024-11-10',
    vehiculosRegistrados: 18,
    ingresosGenerados: 9000,
    pais: 'Colombia',
    ciudad: 'Cali'
  },
  {
    id: 'ten-004',
    tenantId: 'TEN-004',
    nombreAgencia: 'Cartagena Bike Rental',
    emailAdmin: 'admin@cartagenabike.com',
    plan: 'enterprise',
    estado: 'activo',
    limiteVehiculos: 9999,
    fechaSuscripcion: '2024-08-05',
    fechaCreacion: '2024-08-05',
    vehiculosRegistrados: 45,
    ingresosGenerados: 30000,
    pais: 'Colombia',
    ciudad: 'Cartagena'
  },
  {
    id: 'ten-005',
    tenantId: 'TEN-005',
    nombreAgencia: 'Barranquilla Wheels',
    emailAdmin: 'contact@baqwheels.com',
    plan: 'basico',
    estado: 'prueba',
    limiteVehiculos: 10,
    fechaSuscripcion: '2026-02-28',
    fechaCreacion: '2026-02-28',
    vehiculosRegistrados: 5,
    ingresosGenerados: 500,
    pais: 'Colombia',
    ciudad: 'Barranquilla'
  }
];
