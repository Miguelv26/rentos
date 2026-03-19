import { generateDamageReportPDF } from '@/services/checkinReportService';

const mockSave = jest.fn();
const mockText = jest.fn();
const mockSetFontSize = jest.fn();

jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    setFontSize: mockSetFontSize,
    text: mockText,
    save: mockSave,
  })),
}));

describe('checkinReportService (HU 2.3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // # Esta prueba es la 3 para la HU 2.3
  it('creates and downloads damage report PDF', () => {
    generateDamageReportPDF({
      reserva: {
        id: 'res-1',
        vehiculoId: 1,
        cliente: 'Juan',
        documento: '123',
        fechaInicio: '2026-03-01',
        fechaFin: '2026-03-02',
        desglose: { dias: 1, precioDia: 80, totalExtras: 0, deposito: 16 },
        totalFinal: 80,
        estado: 'finalizada',
        pago: { metodoPago: 'efectivo', estado: 'procesado', fechaOperacion: '2026-03-01' },
      },
      vehiculo: {
        id: 1,
        marca: 'Yamaha',
        modelo: 'MT-03',
        anio: 2024,
        placa: 'ABC123',
        kilometraje: 1000,
        proximoMantenimiento: 500,
        estado: 'available',
        tipo: 'Naked',
        precioDia: 80,
        foto: 'x',
      },
      checkOut: {
        id: 'check-out-1',
        reservaId: 'res-1',
        vehiculoId: 1,
        tipo: 'check-out',
        kilometraje: 1200,
        nivelCombustible: 40,
        checklist: {
          llantas: true,
          frenos: false,
          luces: true,
          espejos: true,
          carroceria: false,
        },
        fotos: [],
        observaciones: 'Golpe lateral',
        fechaRegistro: '2026-03-02',
      },
    });

    expect(mockSetFontSize).toHaveBeenCalled();
    expect(mockText).toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalledWith('reporte-danos-res-1.pdf');
  });
});
