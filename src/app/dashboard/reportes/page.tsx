"use client";
import MainLayout from '@/components/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { useReportes } from '@/hooks/useReportes';
import { MetodoPago } from '@/data/HU3_ReservasData';
import { useConfig } from '@/context/ConfigContext';

export default function ReportesPage() {
  const { filters, setFilters, rows, summary, exportPDF } = useReportes();
  const { t } = useConfig();

  const METODO_LABEL: Record<MetodoPago, string> = {
    efectivo: t('reservas', 'efectivo'),
    tarjeta_credito: t('reservas', 'tarjetaCredito'),
    tarjeta_debito: t('reservas', 'tarjetaDebito'),
    transferencia: t('reservas', 'transferencia'),
    billetera: t('reservas', 'billetera'),
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black italic uppercase mb-2">{t('reportesHu', 'title')}</h1>
          <p className="text-gray-500">{t('reportesHu', 'subtitle')}</p>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label={t('reportesHu', 'fechaInicial')}
              type="date"
              value={filters.fechaInicio}
              onChange={(event) => setFilters((current) => ({ ...current, fechaInicio: event.target.value }))}
            />

            <Input
              label={t('reportesHu', 'fechaFinal')}
              type="date"
              value={filters.fechaFin}
              onChange={(event) => setFilters((current) => ({ ...current, fechaFin: event.target.value }))}
            />

            <div>
              <label htmlFor="metodoPagoFiltro" className="block text-[10px] font-bold uppercase text-gray-500 mb-1 tracking-wider">
                {t('reportesHu', 'metodoPago')}
              </label>
              <select
                id="metodoPagoFiltro"
                className="w-full bg-[#1A1A24] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-[#00E5FF] focus:outline-none"
                value={filters.metodoPago}
                onChange={(event) => setFilters((current) => ({ ...current, metodoPago: event.target.value as MetodoPago | 'todos' }))}
              >
                <option value="todos">{t('reportesHu', 'todos')}</option>
                <option value="efectivo">{METODO_LABEL.efectivo}</option>
                <option value="tarjeta_credito">{METODO_LABEL.tarjeta_credito}</option>
                <option value="tarjeta_debito">{METODO_LABEL.tarjeta_debito}</option>
                <option value="transferencia">{METODO_LABEL.transferencia}</option>
                <option value="billetera">{METODO_LABEL.billetera}</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button className="w-full" onClick={() => exportPDF(t('reportesHu', 'agenciaDemo'))} aria-label={t('reportesHu', 'ariaExportar')}>
                {t('reportesHu', 'exportarPdf')}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">{t('reportesHu', 'totalReservas')}</p>
            <p className="text-3xl font-black text-white">{summary.reservasIncluidas}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">{t('reportesHu', 'totalFacturado')}</p>
            <p className="text-3xl font-black text-[#00E5FF]">${summary.totalFacturado.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">{t('reportesHu', 'transacciones')}</p>
            <p className="text-3xl font-black text-white">{summary.cantidadTransacciones}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">{t('reportesHu', 'subtotal')}</p>
            <p className="text-2xl font-black text-white">${Math.round(summary.subtotal).toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">{t('reportesHu', 'impuestos')}</p>
            <p className="text-2xl font-black text-white">${Math.round(summary.impuestos).toLocaleString()}</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-sm font-black uppercase mb-4 text-[#00E5FF]">{t('reportesHu', 'resumenMetodo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {summary.paymentBreakdown.length === 0 && (
              <p className="text-sm text-gray-500">{t('reportesHu', 'sinTransacciones')}</p>
            )}
            {summary.paymentBreakdown.map((item) => (
              <div key={item.metodo} className="rounded-lg bg-white/5 p-3 border border-white/10">
                <p className="text-xs uppercase text-gray-500 font-bold">{METODO_LABEL[item.metodo]}</p>
                <p className="text-lg font-black text-white">{item.cantidad}</p>
                <p className="text-xs text-[#00E5FF] font-bold">${item.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="bg-[#1E1E1E] border border-gray-800 rounded-xl overflow-hidden">
          <Table caption={t('reportesHu', 'tablaCaption')}>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>{t('reportesHu', 'reserva')}</TableHead>
                <TableHead>{t('reportesHu', 'cliente')}</TableHead>
                <TableHead>{t('reportesHu', 'periodo')}</TableHead>
                <TableHead>{t('reportesHu', 'metodoPagoCol')}</TableHead>
                <TableHead>{t('reportesHu', 'estado')}</TableHead>
                <TableHead>{t('reportesHu', 'monto')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <p className="font-bold">{row.cliente}</p>
                    <p className="text-xs text-gray-500">{row.documento}</p>
                  </TableCell>
                  <TableCell>
                    {row.fechaInicio} - {row.fechaFin}
                  </TableCell>
                  <TableCell>{METODO_LABEL[row.metodoPago]}</TableCell>
                  <TableCell>{row.estadoReserva}</TableCell>
                  <TableCell className="font-black text-[#00E5FF]">${row.totalFinal.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell className="text-gray-500" colSpan={6}>
                    {t('reportesHu', 'sinResultados')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
