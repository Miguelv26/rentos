import { exportReportToPDF } from '@/services/reporteService';
import { ReportFilters, ReportRow, ReportSummary } from '@/types/reportes';

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

const mockAutoTable = jest.fn();
jest.mock('jspdf-autotable', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockAutoTable(...args),
}));

describe('reporteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // # Esta prueba es la 3 para la HU 4.3
  it('exports report data to PDF', () => {
    const filters: ReportFilters = {
      fechaInicio: '2026-03-01',
      fechaFin: '2026-03-31',
      metodoPago: 'todos',
    };

    const rows: ReportRow[] = [
      {
        id: 'res-1',
        fechaInicio: '2026-03-01',
        fechaFin: '2026-03-02',
        cliente: 'Juan',
        documento: '123',
        vehiculoId: 1,
        totalFinal: 300,
        metodoPago: 'efectivo',
        estadoPago: 'procesado',
        estadoReserva: 'confirmada',
      },
    ];

    const summary: ReportSummary = {
      reservasIncluidas: 1,
      totalFacturado: 300,
      cantidadTransacciones: 1,
      subtotal: 252.1,
      impuestos: 47.9,
      paymentBreakdown: [
        { metodo: 'efectivo', cantidad: 1, total: 300 },
      ],
    };

    exportReportToPDF({
      agencyName: 'RentOS Demo',
      filters,
      rows,
      summary,
    });

    expect(mockSetFontSize).toHaveBeenCalled();
    expect(mockText).toHaveBeenCalledWith('RentOS - Reporte de Ingresos y Facturacion', 14, 16);
    expect(mockAutoTable).toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalled();
  });
});
