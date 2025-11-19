import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { motion } from 'framer-motion';
import { Activity, Loader2, BarChart3, Users, Heart, TrendingUp, AlertTriangle } from 'lucide-react';
import {
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
  DatasetOverviewResponse,
  DemographicsResponse,
  ClinicalStatsResponse,
  CorrelationsResponse,
  HighRiskProfilesResponse,
} from '../types/api';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  const [datasetOverview, setDatasetOverview] = useState<DatasetOverviewResponse | null>(null);
  const [demographics, setDemographics] = useState<DemographicsResponse | null>(null);
  const [clinicalStats, setClinicalStats] = useState<ClinicalStatsResponse | null>(null);
  const [correlations, setCorrelations] = useState<CorrelationsResponse | null>(null);
  const [highRiskProfiles, setHighRiskProfiles] = useState<HighRiskProfilesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const [
          overviewData,
          riskData,
          modelsData,
          datasetData,
          demographicsData,
          clinicalData,
          correlationsData,
          profilesData,
        ] = await Promise.all([
          strokeApi.getStatsOverview().catch(() => null),
          strokeApi.getRiskDistribution().catch(() => null),
          strokeApi.getModelsCompare().catch(() => null),
          strokeApi.getDatasetOverview().catch(() => null),
          strokeApi.getDemographics().catch(() => null),
          strokeApi.getClinicalStats().catch(() => null),
          strokeApi.getCorrelations().catch(() => null),
          strokeApi.getHighRiskProfiles().catch(() => null),
        ]);
        setOverview(overviewData);
        setRiskDistribution(riskData);
        setModelsCompare(modelsData);
        setDatasetOverview(datasetData);
        setDemographics(demographicsData);
        setClinicalStats(clinicalData);
        setCorrelations(correlationsData);
        setHighRiskProfiles(profilesData);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        toast.error('Error al cargar las estadísticas', {
          description: 'Algunos datos pueden no estar disponibles',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

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
              Análisis completo del dataset y rendimiento del sistema
            </p>
          </div>
        </div>
      </motion.header>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="demographics">Demografía</TabsTrigger>
          <TabsTrigger value="clinical">Clínicos</TabsTrigger>
          <TabsTrigger value="correlations">Correlaciones</TabsTrigger>
          <TabsTrigger value="profiles">Alto Riesgo</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Dataset Overview KPIs */}
          {datasetOverview && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card className="bg-gradient-to-br from-purple-500 to-blue-500 text-white border-0 shadow-xl">
                <CardHeader className="pb-2">
                  <CardDescription className="text-white/80 text-xs">Total Muestras</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{datasetOverview.total_samples.toLocaleString()}</div>
                  <p className="text-xs text-white/80">Pacientes en el dataset</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-rose-500 text-white border-0 shadow-xl">
                <CardHeader className="pb-2">
                  <CardDescription className="text-white/80 text-xs">Casos de Stroke</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{datasetOverview.stroke_cases.toLocaleString()}</div>
                  <p className="text-xs text-white/80">
                    {datasetOverview.class_balance.stroke.toFixed(1)}% del total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl">
                <CardHeader className="pb-2">
                  <CardDescription className="text-white/80 text-xs">Sin Stroke</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{datasetOverview.no_stroke_cases.toLocaleString()}</div>
                  <p className="text-xs text-white/80">
                    {datasetOverview.class_balance.no_stroke.toFixed(1)}% del total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white border-0 shadow-xl">
                <CardHeader className="pb-2">
                  <CardDescription className="text-white/80 text-xs">Características</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{datasetOverview.total_features}</div>
                  <p className="text-xs text-white/80">Variables analizadas</p>
                </CardContent>
              </Card>
            </motion.section>
          )}

          {/* Class Balance Chart */}
          {datasetOverview && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Balance de Clases</CardTitle>
                  <CardDescription>Distribución de casos con y sin stroke</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Stroke', value: datasetOverview.class_balance.stroke, color: '#ef4444' },
                          { name: 'No Stroke', value: datasetOverview.class_balance.no_stroke, color: '#10b981' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#ef4444" />
                        <Cell fill="#10b981" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.section>
          )}

          {/* Prediction Stats (if available) */}
          {overview && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Predicciones del Sistema</CardTitle>
                  <CardDescription>Estadísticas de uso del modelo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total Predicciones:</span>
                      <span className="font-bold text-lg">{overview.total_predictions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Predicciones Stroke:</span>
                      <span className="font-bold text-red-600">{overview.stroke_predictions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Predicciones No Stroke:</span>
                      <span className="font-bold text-green-600">{overview.no_stroke_predictions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Probabilidad Promedio:</span>
                      <span className="font-bold text-blue-600">
                        {(overview.average_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {riskDistribution && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Distribución de Riesgos</CardTitle>
                    <CardDescription>Clasificación por nivel de riesgo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { name: 'Bajo', value: riskDistribution.distribution.Low },
                        { name: 'Medio', value: riskDistribution.distribution.Medium },
                        { name: 'Alto', value: riskDistribution.distribution.High },
                      ]}>
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
              )}
            </motion.section>
          )}
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          {demographics ? (
            <>
              {/* Age Distribution */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Distribución por Edad
                    </CardTitle>
                    <CardDescription>
                      Edad media: {demographics.age.mean.toFixed(1)} años | Mediana: {demographics.age.median.toFixed(1)} años
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={demographics.age.distribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="range" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#8b5cf6" name="Cantidad" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="stroke_rate" fill="#ef4444" name="Tasa Stroke (%)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Gender Distribution */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Distribución por Género</CardTitle>
                    <CardDescription>Análisis de casos por género</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Hombres', value: demographics.gender.Male.count, stroke_rate: demographics.gender.Male.stroke_rate },
                            { name: 'Mujeres', value: demographics.gender.Female.count, stroke_rate: demographics.gender.Female.stroke_rate },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#ec4899" />
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
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Hombres - Tasa Stroke:</span>
                        <span className="font-semibold">{demographics.gender.Male.stroke_rate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Mujeres - Tasa Stroke:</span>
                        <span className="font-semibold">{demographics.gender.Female.stroke_rate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Estado Civil</CardTitle>
                    <CardDescription>Distribución por estado marital</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[
                        { name: 'Casados', count: demographics.marital_status.Yes.count, stroke_rate: demographics.marital_status.Yes.stroke_rate },
                        { name: 'Solteros', count: demographics.marital_status.No.count, stroke_rate: demographics.marital_status.No.stroke_rate },
                      ]}>
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
                        <Legend />
                        <Bar dataKey="count" fill="#8b5cf6" name="Cantidad" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="stroke_rate" fill="#ef4444" name="Tasa Stroke (%)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.section>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">No hay datos demográficos disponibles</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Clinical Stats Tab */}
        <TabsContent value="clinical" className="space-y-6">
          {clinicalStats ? (
            <>
              {/* Hypertension and Heart Disease */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      Hipertensión
                    </CardTitle>
                    <CardDescription>Impacto de la hipertensión en el riesgo de stroke</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-red-900">Con Hipertensión</span>
                          <Badge className="bg-red-100 text-red-700">
                            {clinicalStats.hypertension.present.stroke_rate.toFixed(1)}% tasa stroke
                          </Badge>
                        </div>
                        <p className="text-sm text-red-700">
                          {clinicalStats.hypertension.present.count.toLocaleString()} casos
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-green-900">Sin Hipertensión</span>
                          <Badge className="bg-green-100 text-green-700">
                            {clinicalStats.hypertension.absent.stroke_rate.toFixed(1)}% tasa stroke
                          </Badge>
                        </div>
                        <p className="text-sm text-green-700">
                          {clinicalStats.hypertension.absent.count.toLocaleString()} casos
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      Enfermedad Cardíaca
                    </CardTitle>
                    <CardDescription>Impacto de la enfermedad cardíaca en el riesgo de stroke</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-red-900">Con Enfermedad Cardíaca</span>
                          <Badge className="bg-red-100 text-red-700">
                            {clinicalStats.heart_disease.present.stroke_rate.toFixed(1)}% tasa stroke
                          </Badge>
                        </div>
                        <p className="text-sm text-red-700">
                          {clinicalStats.heart_disease.present.count.toLocaleString()} casos
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-green-900">Sin Enfermedad Cardíaca</span>
                          <Badge className="bg-green-100 text-green-700">
                            {clinicalStats.heart_disease.absent.stroke_rate.toFixed(1)}% tasa stroke
                          </Badge>
                        </div>
                        <p className="text-sm text-green-700">
                          {clinicalStats.heart_disease.absent.count.toLocaleString()} casos
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Glucose Level */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Nivel de Glucosa Promedio</CardTitle>
                    <CardDescription>
                      Media: {clinicalStats.avg_glucose_level.mean.toFixed(1)} mg/dL | Mediana: {clinicalStats.avg_glucose_level.median.toFixed(1)} mg/dL
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={clinicalStats.avg_glucose_level.distribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="range" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#8b5cf6" name="Cantidad" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="stroke_rate" fill="#ef4444" name="Tasa Stroke (%)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.section>

              {/* BMI Categories */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Índice de Masa Corporal (BMI)</CardTitle>
                    <CardDescription>Media: {clinicalStats.bmi.mean.toFixed(1)} kg/m²</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={clinicalStats.bmi.categories}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={100} />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#8b5cf6" name="Cantidad" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="stroke_rate" fill="#ef4444" name="Tasa Stroke (%)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Estado de Fumador</CardTitle>
                    <CardDescription>Distribución por hábito de fumar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { name: 'Nunca', count: clinicalStats.smoking_status['never smoked'].count, stroke_rate: clinicalStats.smoking_status['never smoked'].stroke_rate },
                        { name: 'Ex-fumador', count: clinicalStats.smoking_status['formerly smoked'].count, stroke_rate: clinicalStats.smoking_status['formerly smoked'].stroke_rate },
                        { name: 'Fumador', count: clinicalStats.smoking_status.smokes.count, stroke_rate: clinicalStats.smoking_status.smokes.stroke_rate },
                      ]}>
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
                        <Legend />
                        <Bar dataKey="count" fill="#8b5cf6" name="Cantidad" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="stroke_rate" fill="#ef4444" name="Tasa Stroke (%)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.section>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">No hay datos clínicos disponibles</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Correlations Tab */}
        <TabsContent value="correlations" className="space-y-6">
          {correlations ? (
            <>
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      Top Factores de Riesgo
                    </CardTitle>
                    <CardDescription>Variables con mayor correlación con stroke</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead className="font-semibold">Variable</TableHead>
                            <TableHead className="font-semibold">Correlación</TableHead>
                            <TableHead className="font-semibold">Importancia</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {correlations.top_risk_factors.map((factor, index) => (
                            <TableRow key={factor.feature}>
                              <TableCell className="font-medium">
                                {index + 1}. {factor.feature.replace(/_/g, ' ')}
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-blue-600">
                                  {factor.correlation > 0 ? '+' : ''}{factor.correlation.toFixed(3)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    factor.importance === 'High'
                                      ? 'bg-red-100 text-red-700 border-red-200'
                                      : factor.importance === 'Medium'
                                      ? 'bg-orange-100 text-orange-700 border-orange-200'
                                      : 'bg-green-100 text-green-700 border-green-200'
                                  }
                                >
                                  {factor.importance}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Correlation Matrix Visualization */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Matriz de Correlación</CardTitle>
                    <CardDescription>Correlaciones entre variables clave</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Object.entries(correlations.correlation_matrix)
                        .filter(([key]) => key.includes('stroke'))
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="p-4 rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 to-purple-50"
                          >
                            <p className="text-xs text-slate-600 mb-1">
                              {key.replace(/_/g, ' ').replace('stroke', 'Stroke')}
                            </p>
                            <p className="text-lg font-bold text-blue-600">
                              {value > 0 ? '+' : ''}{value.toFixed(3)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">No hay datos de correlaciones disponibles</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* High Risk Profiles Tab */}
        <TabsContent value="profiles" className="space-y-6">
          {highRiskProfiles && highRiskProfiles.profiles.length > 0 ? (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-2 gap-6"
            >
              {highRiskProfiles.profiles.map((profile) => (
                <Card key={profile.id} className="shadow-lg border-2 border-red-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          {profile.name}
                        </CardTitle>
                        <CardDescription className="mt-2">{profile.criteria}</CardDescription>
                      </div>
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        Alto Riesgo
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-slate-50">
                          <p className="text-xs text-slate-600 mb-1">Casos Identificados</p>
                          <p className="text-2xl font-bold text-slate-900">{profile.count}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-red-50">
                          <p className="text-xs text-red-600 mb-1">Tasa de Stroke</p>
                          <p className="text-2xl font-bold text-red-600">{profile.stroke_rate.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
                        <p className="text-xs text-slate-600 mb-1">Score de Riesgo Promedio</p>
                        <p className="text-xl font-bold text-purple-600">
                          {(profile.avg_risk_score * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.section>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">No hay perfiles de alto riesgo disponibles</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Models Comparison (always visible at bottom) */}
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
        </motion.section>
      )}
    </main>
  );
}
