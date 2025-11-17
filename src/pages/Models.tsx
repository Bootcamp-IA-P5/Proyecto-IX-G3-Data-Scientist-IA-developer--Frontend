import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { motion } from 'framer-motion';
import { BarChart3, Activity, TrendingUp, Zap, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { strokeApi } from '../services/api';
import type { ModelDetailResponse } from '../types/api';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

interface ModelWithDetails extends ModelDetailResponse {
  isActive?: boolean;
  icon: typeof Activity;
  gradient: string;
}

export function Models() {
  const [models, setModels] = useState<ModelWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        
        const statusResponse = await strokeApi.getStatus();
        console.log('Status response:', statusResponse);
        
        let modelNames: string[] = [];
        try {
          const modelsResponse = await strokeApi.getModels();
          modelNames = modelsResponse.models || [];
          console.log('Models from /models endpoint:', modelNames);
        } catch (error) {
          console.warn('Endpoint /models no disponible, usando /status como fallback');
          modelNames = statusResponse.available_models || [];
          console.log('Models from /status fallback:', modelNames);
        }

        if (modelNames.length === 0) {
          console.warn('No se encontraron modelos');
          setModels([]);
          setLoading(false);
          return;
        }

        console.log(`Cargando detalles para ${modelNames.length} modelos:`, modelNames);

        const modelsWithDetails = await Promise.all(
          modelNames.map(async (modelName) => {
            let detail: ModelDetailResponse | null = null;
            try {
              detail = await strokeApi.getModelDetail(modelName);
              console.log(`Detalles cargados para ${modelName}:`, detail);
            } catch (error) {
              console.warn(`No se pudieron cargar detalles de ${modelName}:`, error);
            }
            
            const isActive = statusResponse.available_models.includes(modelName);
            
            let icon = Activity;
            let gradient = 'from-purple-500 to-blue-500';
            
            const modelNameLower = modelName.toLowerCase();
            if (modelNameLower.includes('random') || modelNameLower.includes('forest')) {
              icon = Activity;
              gradient = 'from-purple-500 to-blue-500';
            } else if (modelNameLower.includes('gradient') || modelNameLower.includes('boost') || modelNameLower.includes('xgboost')) {
              icon = TrendingUp;
              gradient = 'from-blue-500 to-cyan-500';
            } else if (modelNameLower.includes('neural') || modelNameLower.includes('network')) {
              icon = Zap;
              gradient = 'from-cyan-500 to-teal-500';
            } else if (modelNameLower.includes('logistic')) {
              icon = Activity;
              gradient = 'from-emerald-500 to-teal-500';
            }

            // Asegurar que siempre tengamos un nombre, incluso sin detalles
            const displayName = detail?.name || modelName.replace('.pkl', '').replace('_', ' ');

            return {
              ...(detail || {}),
              name: displayName,
              isActive,
              icon,
              gradient,
            };
          })
        );

        console.log('Modelos finales cargados:', modelsWithDetails);
        setModels(modelsWithDetails);
      } catch (error: any) {
        console.error('Error al cargar modelos:', error);
        
        const isCorsError = 
          error.message?.includes('CORS') || 
          error.message?.includes('Network Error') ||
          error.status === 500 && !error.response;
        
        if (isCorsError) {
          toast.error('Error de CORS', {
            description: 'El backend no permite peticiones desde este puerto. Configura CORS en el backend para permitir localhost:5174 o usa el puerto 5173',
            duration: 6000,
          });
        } else {
          toast.error('Error al cargar los modelos', {
            description: 'Verifica que el servidor esté ejecutándose',
          });
        }
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  // Preparar datos para comparación de todas las métricas
  const comparisonData = [
    {
      metric: 'Accuracy',
      ...models.reduce((acc, model) => {
        if (model.metrics?.accuracy !== undefined) {
          acc[model.name || 'Unknown'] = model.metrics.accuracy;
        }
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: 'Precision',
      ...models.reduce((acc, model) => {
        if (model.metrics?.precision !== undefined) {
          acc[model.name || 'Unknown'] = model.metrics.precision;
        }
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: 'Recall',
      ...models.reduce((acc, model) => {
        if (model.metrics?.recall !== undefined) {
          acc[model.name || 'Unknown'] = model.metrics.recall;
        }
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: 'F1-Score',
      ...models.reduce((acc, model) => {
        if (model.metrics?.f1_score !== undefined) {
          acc[model.name || 'Unknown'] = model.metrics.f1_score;
        }
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: 'AUC-ROC',
      ...models.reduce((acc, model) => {
        if (model.metrics?.auc_roc !== undefined) {
          acc[model.name || 'Unknown'] = model.metrics.auc_roc;
        }
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  // Datos para el gráfico radar del modelo activo
  const activeModel = models.find((m) => m.isActive) || models[0];
  const radarData = activeModel?.metrics
    ? [
        { metric: 'Accuracy', value: activeModel.metrics.accuracy || 0 },
        { metric: 'Precision', value: activeModel.metrics.precision || 0 },
        { metric: 'Recall', value: activeModel.metrics.recall || 0 },
        { metric: 'F1-Score', value: activeModel.metrics.f1_score || 0 },
        { metric: 'AUC-ROC', value: activeModel.metrics.auc_roc || 0 },
      ]
    : [];

  const featureImportance = activeModel?.feature_importance || [];

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-slate-600">Cargando modelos...</p>
        </div>
      </main>
    );
  }

  if (models.length === 0) {
    return (
      <main className="max-w-7xl mx-auto space-y-8">
        <header>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-600 shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Comparación de Modelos</h1>
              <p className="text-slate-600">Análisis de rendimiento y métricas de los modelos de ML</p>
            </div>
          </div>
        </header>
        <section>
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No hay modelos disponibles</p>
            </CardContent>
          </Card>
        </section>
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
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-600 shadow-xl">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Comparación de Modelos</h1>
            <p className="text-slate-600 text-lg">
              Análisis de rendimiento y métricas de los modelos de Machine Learning
            </p>
          </div>
        </div>
      </motion.header>

      {/* Models Cards */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {models.map((model, index) => (
          <motion.article
            key={model.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card
              className={`${
                model.isActive
                  ? 'ring-2 ring-purple-500 shadow-xl border-purple-200'
                  : 'hover:shadow-lg border-slate-200'
              } transition-all overflow-hidden`}
            >
              {/* Gradient Header */}
              <div className={`h-2 bg-gradient-to-r ${model.gradient}`} />
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-br ${model.gradient} shadow-lg`}
                  >
                    <model.icon className="w-7 h-7 text-white" />
                  </div>
                  {model.isActive && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Activo
                    </Badge>
                  )}
                </div>
                
                <CardTitle className="text-xl mb-2">{model.name}</CardTitle>
                <CardDescription className="text-sm">
                  {model.type || 'Machine Learning'} • {model.version || 'N/A'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {model.metrics ? (
                  <>
                    {model.metrics.accuracy !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 font-medium">Accuracy</span>
                          <span className="text-slate-900 font-bold text-lg">
                            {model.metrics.accuracy.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={model.metrics.accuracy} className="h-2" />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      {model.metrics.precision !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">Precision</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {model.metrics.precision.toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {model.metrics.recall !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">Recall</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {model.metrics.recall.toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {model.metrics.f1_score !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">F1-Score</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {model.metrics.f1_score.toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {model.metrics.auc_roc !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">AUC-ROC</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {model.metrics.auc_roc.toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm text-slate-500">Métricas no disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.article>
        ))}
      </motion.section>

      {/* Charts Section */}
      <section className="space-y-6">
        {/* Top Row: Comparison and Radar Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Comparison Chart - Todas las métricas */}
          {comparisonData.length > 0 && comparisonData[0] && Object.keys(comparisonData[0]).length > 1 && (
            <motion.article
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Comparación de Métricas</CardTitle>
                  <CardDescription>Rendimiento comparativo entre modelos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="metric" 
                        stroke="#64748b" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        domain={[0, 100]} 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                      />
                      <Legend />
                      {models.map((model, index) => {
                        const colors = ['#8b5cf6', '#3b82f6', '#06b6d4'];
                        return (
                          <Bar
                            key={model.name}
                            dataKey={model.name}
                            fill={colors[index % colors.length]}
                            radius={[8, 8, 0, 0]}
                          />
                        );
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.article>
          )}

          {/* Radar Chart - Modelo Activo */}
          {radarData.length > 0 && activeModel && (
            <motion.article
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Radar de Métricas - Modelo Activo</CardTitle>
                  <CardDescription>
                    Visualización holística del {activeModel.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis 
                        dataKey="metric" 
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <PolarRadiusAxis 
                        domain={[0, 100]} 
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <Radar
                        name={activeModel.name}
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.article>
          )}
        </div>

        {/* Bottom Row: Feature Importance */}
        {featureImportance.length > 0 && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Importancia de Características</CardTitle>
                <CardDescription>
                  Features más relevantes en la predicción del modelo activo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={featureImportance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      type="number" 
                      stroke="#64748b" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      domain={[0, 'dataMax']}
                    />
                    <YAxis 
                      dataKey="feature" 
                      type="category" 
                      stroke="#64748b" 
                      width={150}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                    />
                    <Bar 
                      dataKey="importance" 
                      fill="url(#featureGradient)" 
                      radius={[0, 8, 8, 0]}
                    />
                    <defs>
                      <linearGradient id="featureGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.article>
        )}
      </section>
    </main>
  );
}
