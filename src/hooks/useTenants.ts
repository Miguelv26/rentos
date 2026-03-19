import { useState, useEffect } from 'react';
import { Tenant, TenantsMock } from '@/data/TenantsData';

const TENANTS_STORAGE_KEY = 'rentos_tenants';
const ACTIVE_TENANT_STORAGE_KEY = 'rentos_active_tenant';

const PLAN_LIMITS: Record<Tenant['plan'], number> = {
  basico: 10,
  pro: 50,
  enterprise: 9999
};

const buildTenantId = () => {
  const random = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `TEN-${Date.now().toString(36).toUpperCase()}-${random.toUpperCase()}`;
};

const normalizeTenant = (tenant: Tenant): Tenant => {
  const limitePorPlan = PLAN_LIMITS[tenant.plan] ?? 10;
  return {
    ...tenant,
    tenantId: tenant.tenantId ?? buildTenantId(),
    limiteVehiculos: tenant.limiteVehiculos ?? limitePorPlan,
    fechaCreacion: tenant.fechaCreacion ?? tenant.fechaSuscripcion,
  };
};

export const useTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(TENANTS_STORAGE_KEY);
    if (saved) {
      const parsed = (JSON.parse(saved) as Tenant[]).map(normalizeTenant);
      setTenants(parsed);
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(parsed));
    } else {
      const normalizedMocks = TenantsMock.map(normalizeTenant);
      setTenants(normalizedMocks);
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(normalizedMocks));
    }

    const savedActiveTenantId = localStorage.getItem(ACTIVE_TENANT_STORAGE_KEY);
    if (savedActiveTenantId) {
      setActiveTenantId(savedActiveTenantId);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!tenants.length) return;

    const exists = tenants.some((tenant) => tenant.id === activeTenantId);
    if (!exists) {
      const fallback = tenants.find((tenant) => tenant.estado !== 'suspendido') ?? tenants[0];
      setActiveTenantId(fallback.id);
      localStorage.setItem(ACTIVE_TENANT_STORAGE_KEY, fallback.id);
    }
  }, [tenants, activeTenantId]);

  const saveToStorage = (nuevosTenants: Tenant[]) => {
    setTenants(nuevosTenants);
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(nuevosTenants));
  };

  const createTenant = (tenant: Omit<Tenant, 'id' | 'tenantId' | 'vehiculosRegistrados' | 'ingresosGenerados' | 'fechaCreacion' | 'limiteVehiculos'> & { limiteVehiculos?: number }) => {
    const limiteVehiculos = tenant.limiteVehiculos ?? PLAN_LIMITS[tenant.plan] ?? 10;
    const nuevoTenant: Tenant = {
      ...tenant,
      id: `ten-${Date.now()}`,
      tenantId: buildTenantId(),
      limiteVehiculos,
      fechaCreacion: tenant.fechaSuscripcion,
      vehiculosRegistrados: 0,
      ingresosGenerados: 0
    };

    saveToStorage([...tenants, nuevoTenant]);

    if (!activeTenantId) {
      setActiveTenantId(nuevoTenant.id);
      localStorage.setItem(ACTIVE_TENANT_STORAGE_KEY, nuevoTenant.id);
    }

    return nuevoTenant;
  };

  const updateTenant = (id: string, cambios: Partial<Tenant>) => {
    const nuevosTenants = tenants.map((tenant) => {
      if (tenant.id !== id) return tenant;

      const nextPlan = cambios.plan ?? tenant.plan;
      const nextLimit = cambios.limiteVehiculos ?? tenant.limiteVehiculos ?? PLAN_LIMITS[nextPlan];

      return {
        ...tenant,
        ...cambios,
        plan: nextPlan,
        limiteVehiculos: nextLimit,
      };
    });
    saveToStorage(nuevosTenants);
  };

  const toggleTenantStatus = (id: string) => {
    const tenant = tenants.find((item) => item.id === id);
    if (!tenant) return;

    const newStatus: Tenant['estado'] = tenant.estado === 'suspendido' ? 'activo' : 'suspendido';
    updateTenant(id, { estado: newStatus });
  };

  const suspenderTenant = (id: string) => {
    updateTenant(id, { estado: 'suspendido' });
  };

  const activarTenant = (id: string) => {
    updateTenant(id, { estado: 'activo' });
  };

  const canAddVehicleToTenant = (tenantId: string) => {
    const tenant = tenants.find((item) => item.id === tenantId);
    if (!tenant) return { allowed: false, reason: 'Tenant no encontrado', remaining: 0 };
    if (tenant.estado === 'suspendido') {
      return { allowed: false, reason: 'Tenant suspendido', remaining: 0 };
    }

    const remaining = Math.max(0, tenant.limiteVehiculos - tenant.vehiculosRegistrados);
    return {
      allowed: tenant.vehiculosRegistrados < tenant.limiteVehiculos,
      reason: tenant.vehiculosRegistrados < tenant.limiteVehiculos ? '' : 'Límite de vehículos alcanzado',
      remaining,
    };
  };

  const incrementVehicleCount = (tenantId: string) => {
    const tenant = tenants.find((item) => item.id === tenantId);
    if (!tenant) return false;

    const canAdd = canAddVehicleToTenant(tenantId);
    if (!canAdd.allowed) return false;

    updateTenant(tenantId, { vehiculosRegistrados: tenant.vehiculosRegistrados + 1 });
    return true;
  };

  const decrementVehicleCount = (tenantId: string) => {
    const tenant = tenants.find((item) => item.id === tenantId);
    if (!tenant) return;
    updateTenant(tenantId, { vehiculosRegistrados: Math.max(0, tenant.vehiculosRegistrados - 1) });
  };

  const setActiveTenant = (tenantId: string) => {
    setActiveTenantId(tenantId);
    localStorage.setItem(ACTIVE_TENANT_STORAGE_KEY, tenantId);
  };

  const crearTenant = createTenant;
  const actualizarTenant = updateTenant;

  const calcularMRR = (): number => {
    const precios = { basico: 49, pro: 99, enterprise: 199 };
    return tenants
      .filter(t => t.estado === 'activo')
      .reduce((total, t) => total + precios[t.plan], 0);
  };

  const obtenerEstadisticas = () => {
    const activos = tenants.filter(t => t.estado === 'activo').length;
    const suspendidos = tenants.filter(t => t.estado === 'suspendido').length;
    const prueba = tenants.filter(t => t.estado === 'prueba').length;
    const mrr = calcularMRR();
    
    // Calcular nuevos este mes
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const nuevosEsteMes = tenants.filter(t => new Date(t.fechaSuscripcion) >= inicioMes).length;

    return {
      total: tenants.length,
      activos,
      suspendidos,
      prueba,
      mrr,
      nuevosEsteMes
    };
  };

  return {
    tenants,
    activeTenantId,
    activeTenant: tenants.find((item) => item.id === activeTenantId) ?? null,
    loading,
    createTenant,
    updateTenant,
    toggleTenantStatus,
    canAddVehicleToTenant,
    setActiveTenant,
    incrementVehicleCount,
    decrementVehicleCount,
    crearTenant,
    actualizarTenant,
    suspenderTenant,
    activarTenant,
    calcularMRR,
    obtenerEstadisticas
  };
};
