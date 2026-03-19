"use client";
import MainLayout from '@/components/MainLayout';
import { Card } from '@/components/ui/Card';
import { useAnalytics } from '@/hooks/useAnalytics';
import { MetricCard } from '@/components/analytics/MetricCard';
import { ComparisonBadge } from '@/components/analytics/ComparisonBadge';
import { RevenueBarChart } from '@/components/analytics/RevenueBarChart';
import { FleetStatusPieChart } from '@/components/analytics/FleetStatusPieChart';
import { useConfig } from '@/context/ConfigContext';

export default function DashboardPage() {
  const analytics = useAnalytics();
  const { t } = useConfig();

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black italic uppercase mb-2">{t('analytics', 'title')}</h1>
          <p className="text-gray-500">{t('analytics', 'subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricCard
            title={t('analytics', 'ingresosMes')}
            value={`$${analytics.ingresosMesActual.toLocaleString()}`}
            helper={<ComparisonBadge comparison={analytics.comparison} />}
          />

          <MetricCard
            title={t('analytics', 'ingresosMesAnterior')}
            value={`$${analytics.ingresosMesAnterior.toLocaleString()}`}
          />

          <MetricCard
            title={t('analytics', 'roi')}
            value={`${analytics.roiEstimado.toFixed(1)}%`}
            helper={<p className="text-xs text-gray-500">{t('analytics', 'roiHelper')}</p>}
          />

          <MetricCard
            title={t('analytics', 'ocupacion')}
            value={`${analytics.tasaOcupacion.toFixed(1)}%`}
            helper={<p className="text-xs text-gray-500">{analytics.flotaTotal} {t('analytics', 'ocupacionHelper')}</p>}
          />

          <MetricCard
            title={t('analytics', 'clientesRegistrados')}
            value={analytics.clientesTotales.toString()}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-black uppercase mb-4 text-[#00E5FF]">{t('analytics', 'ingresos12m')}</h3>
            <RevenueBarChart data={analytics.monthlyRevenue} ariaLabel={t('analytics', 'ingresosChartAria')} />
          </Card>

          <Card>
            <h3 className="text-sm font-black uppercase mb-4 text-[#00E5FF]">{t('analytics', 'estadoFlota')}</h3>
            <FleetStatusPieChart data={analytics.fleetStatus} ariaLabel={t('analytics', 'estadoFlotaChartAria')} />
            <p className="text-xs text-gray-500 mt-3 text-center">
              {t('analytics', 'estadoFlotaHelper')}
            </p>
          </Card>
        </div>

        <Card>
          <h3 className="text-sm font-black uppercase mb-4 text-[#00E5FF]">{t('analytics', 'topRentables')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.topRentables.map((item) => (
              <div key={item.vehiculo.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <img src={item.vehiculo.foto} alt={item.vehiculo.modelo} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{item.vehiculo.modelo}</p>
                  <p className="text-xs text-gray-500">{item.vehiculo.placa}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#00E5FF]">${item.ganancia.toLocaleString()}</p>
                  <p className="text-[9px] text-gray-500 uppercase">{t('analytics', 'gananciaEstimada')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
