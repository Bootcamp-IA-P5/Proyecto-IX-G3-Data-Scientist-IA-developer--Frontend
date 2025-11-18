import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Users, AlertCircle, Loader2, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { strokeApi } from '../services/api';
import type {
  StatsOverviewResponse,
  RiskDistributionResponse,
  ModelsCompareResponse,
} from '../types/api';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

export function Statistics() {
  const [overview, setOverview] = useState<StatsOverviewResponse | null>(null);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistributionResponse | null>(null);
  const [modelsCompare, setModelsCompare] = useState<ModelsCompareResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const [overviewData, riskData, modelsData] = await Promise.all([
          strokeApi.getStatsOverview(),
          strokeApi.getRiskDistribution(),
          strokeApi.getModelsCompare(),
        ]);
        setOverview(overviewData);
        setRiskDistribution(riskData);
        setModelsCompare(modelsData);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        toast.error('Error al cargar las estadísticas', {
          description: 'Verifica que el servidor esté ejecutándose',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Datos para gráfico Stroke vs No Stroke
  const strokeData = overview
    ? [
        { name: 'Stroke', value: overview.stroke_predictions, color: '#ef4444' },
        { name: 'No Stroke', value: overview.no_stroke_predictions, color: '#10b981' },
      ]
    : [];

  // Datos para gráfico de distribución de riesgos
  const riskData = riskDistribution
    ? [
        { name: 'Bajo', value: riskDistribution.distribution.Low, color: '#10b981' },
        { name: 'Medio', value: riskDistribution.distribution.Medium, color: '#f59e0b' },
        { name: 'Alto', value: riskDistribution.distribution.High, color: '#ef4444' },
      ]
    : [];

  // Datos para gráfico de barras de distribución
  const riskBarData = riskDistribution
    ? [
        { name: 'Bajo', value: riskDistribution.distribution.Low },
        { name: 'Medio', value: riskDistribution.distribution.Medium },
        { name: 'Alto', value: riskDistribution.distribution.High },
      ]
    : [];

  // Datos para comparación de modelos
  const modelsBarData = modelsCompare
    ? Object.entries(modelsCompare.metrics).map(([modelName, metrics]) => ({
        name: modelName.replace('.pkl', '').replace('_', ' '),
        Accuracy: (metrics.accuracy * 100).toFixed(1),
        Precision: (metrics.precision * 100).toFixed(1),
        Recall: (metrics.recall * 100).toFixed(1),
        'F1-Score': (metrics.f1_score * 100).toFixed(1),
        'AUC-ROC': (metrics.auc_roc * 100).toFixed(1),
      }))
    : [];

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-slate-600">Cargando estadísticas...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 shadow-xl">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Panel Estadístico</h1>
            <p className="text-slate-600 text-lg">
              Monitoreo en tiempo real del rendimiento y uso del sistema
            </p>
          </div>
        </div>
      </motion.header>

      {/* Overview KPIs */}
      {overview && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-gradient-to-br from-purple-500 to-blue-500 text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/80 text-xs">Total Predicciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{overview.total_predictions}</div>
              <p className="text-xs text-white/80">Desde el inicio</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-rose-500 text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/80 text-xs">Predicciones Stroke</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{overview.stroke_predictions}</div>
              <p className="text-xs text-white/80">
                {overview.total_predictions > 0
                  ? ((overview.stroke_predictions / overview.total_predictions) * 100).toFixed(1)
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/80 text-xs">Predicciones No Stroke</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{overview.no_stroke_predictions}</div>
              <p className="text-xs text-white/80">
                {overview.total_predictions > 0
                  ? ((overview.no_stroke_predictions / overview.total_predictions) * 100).toFixed(1)
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/80 text-xs">Probabilidad Promedio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{(overview.average_probability * 100).toFixed(1)}%</div>
              <p className="text-xs text-white/80">Riesgo promedio</p>
            </CardContent>
          </Card>
        </motion.section>
      )}

      {/* Charts Section: Stroke vs No Stroke and Risk Distribution */}
      <section className="grid lg:grid-cols-2 gap-6">
        {/* Stroke vs No Stroke Pie Chart */}
        {strokeData.length > 0 && (
          <motion.article
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Distribución Stroke vs No Stroke</CardTitle>
                <CardDescription>Clasificación de todas las predicciones</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={strokeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {strokeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.article>
        )}

        {/* Risk Distribution Pie Chart */}
        {riskData.length > 0 && (
          <motion.article
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Distribución de Riesgos</CardTitle>
                <CardDescription>Clasificación por nivel de riesgo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.article>
        )}
      </section>

      {/* Risk Distribution Bar Chart */}
      {riskBarData.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Distribución de Riesgos - Gráfico de Barras</CardTitle>
              <CardDescription>Visualización detallada por nivel de riesgo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.section>
      )}

      {/* Models Comparison */}
      {modelsCompare && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-6"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Comparación de Modelos
                  </CardTitle>
                  <CardDescription>Rendimiento comparativo de todos los modelos</CardDescription>
                </div>
                {modelsCompare.best_model && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Mejor Modelo: {modelsCompare.best_model.replace('.pkl', '').replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Modelo</TableHead>
                      <TableHead className="font-semibold">Accuracy</TableHead>
                      <TableHead className="font-semibold">Precision</TableHead>
                      <TableHead className="font-semibold">Recall</TableHead>
                      <TableHead className="font-semibold">F1-Score</TableHead>
                      <TableHead className="font-semibold">AUC-ROC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(modelsCompare.metrics).map(([modelName, metrics]) => {
                      const isBest = modelName === modelsCompare.best_model;
                      return (
                        <TableRow
                          key={modelName}
                          className={isBest ? 'bg-green-50' : ''}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {modelName.replace('.pkl', '').replace('_', ' ')}
                              {isBest && (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  Mejor
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{(metrics.accuracy * 100).toFixed(2)}%</TableCell>
                          <TableCell>{(metrics.precision * 100).toFixed(2)}%</TableCell>
                          <TableCell className="font-semibold">
                            {(metrics.recall * 100).toFixed(2)}%
                          </TableCell>
                          <TableCell>{(metrics.f1_score * 100).toFixed(2)}%</TableCell>
                          <TableCell>{(metrics.auc_roc * 100).toFixed(2)}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Models Comparison Bar Chart */}
          {modelsBarData.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Comparación Visual de Métricas</CardTitle>
                <CardDescription>Gráfico comparativo de rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={modelsBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      formatter={(value: string) => `${value}%`}
                    />
                    <Legend />
                    <Bar dataKey="Accuracy" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Precision" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Recall" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="F1-Score" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="AUC-ROC" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </motion.section>
      )}
    </main>
  );
}

