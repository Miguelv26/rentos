export interface RegistroMantenimiento {
  id: string;
  fecha: string;
  descripcion: string;
  costo: number;
  tipo: 'Correctivo' | 'Preventivo';
}

export interface Vehiculo {
  id: number;
  modelo: string;
  marca: string;
  anio: number;
  placa: string;
  kilometraje: number; 
  proximoMantenimiento: number; 
  estado: 'available' | 'maintenance' | 'rented';
  tipo: 'Sport' | 'Adventure' | 'Naked' | 'Cruiser';
  precioDia: number;
  foto: string;
  historial?: RegistroMantenimiento[];
}

export const HU1_VehiculosMock: Vehiculo[] = [
  { 
    id: 1, 
    marca: "Yamaha",
    modelo: "MT-03", 
    anio: 2023,
    placa: "KTC-112", 
    kilometraje: 15400, 
    proximoMantenimiento: 500,
    estado: "available", 
    tipo: "Naked",
    precioDia: 45,
    foto: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=400" 
  },
  { 
    id: 2, 
    marca: "Honda",
    modelo: "CB650R", 
    anio: 2022,
    placa: "LMN-657", 
    kilometraje: 5200, 
    proximoMantenimiento: 1200,
    estado: "maintenance", 
    tipo: "Naked",
    precioDia: 60,
    foto: "https://images.unsplash.com/photo-1615172282427-9a5752d358cd?q=80&w=400" 
  },
  { 
    id: 3, 
    marca: "BMW",
    modelo: "G310 GS", 
    anio: 2023,
    placa: "BMW-990", 
    kilometraje: 8100, 
    proximoMantenimiento: 900,
    estado: "available", 
    tipo: "Adventure",
    precioDia: 55,
    foto: "https://images.unsplash.com/photo-1622185135505-2d795003994a?q=80&w=400" 
  },
  { 
    id: 4, 
    marca: "Ducati",
    modelo: "Scrambler", 
    anio: 2021,
    placa: "DUC-777", 
    kilometraje: 1200, 
    proximoMantenimiento: 4000,
    estado: "rented", 
    tipo: "Cruiser",
    precioDia: 85,
    foto: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=400" 
  },
  { 
    id: 5, 
    marca: "Kawasaki",
    modelo: "Ninja 400", 
    anio: 2023,
    placa: "KWK-400", 
    kilometraje: 3500, 
    proximoMantenimiento: 1500,
    estado: "available", 
    tipo: "Sport",
    precioDia: 50,
    foto: "https://images.unsplash.com/photo-1547933134-2475097486f0?q=80&w=400" 
  },
  { 
    id: 6, 
    marca: "KTM",
    modelo: "Duke 390", 
    anio: 2022,
    placa: "KTM-390", 
    kilometraje: 9800, 
    proximoMantenimiento: 200,
    estado: "maintenance", 
    tipo: "Naked",
    precioDia: 48,
    foto: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=400" 
  },
  { 
    id: 7, 
    marca: "Royal Enfield",
    modelo: "Himalayan", 
    anio: 2023,
    placa: "REH-001", 
    kilometraje: 12400, 
    proximoMantenimiento: 600,
    estado: "available", 
    tipo: "Adventure",
    precioDia: 40,
    foto: "https://images.unsplash.com/photo-1635334796321-4122d17c7674?q=80&w=400" 
  },
  { 
    id: 8, 
    marca: "Suzuki",
    modelo: "V-Strom 650", 
    anio: 2022,
    placa: "SUZ-650", 
    kilometraje: 18000, 
    proximoMantenimiento: 1000,
    estado: "rented", 
    tipo: "Adventure",
    precioDia: 65,
    foto: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400" 
  }
];