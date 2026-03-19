import { useState, useEffect } from 'react';
import { Vehiculo, HU1_VehiculosMock } from '@/data/HU1_VehiculosData';

export const useVehiculos = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('rentos_flota');
    if (saved) {
      setVehiculos(JSON.parse(saved));
    } else {
      setVehiculos(HU1_VehiculosMock);
    }
  }, []);

  const saveToDisk = (nuevaLista: Vehiculo[]) => {
    setVehiculos(nuevaLista);
    localStorage.setItem('rentos_flota', JSON.stringify(nuevaLista));
  };

  return { vehiculos, setVehiculos: saveToDisk };
};