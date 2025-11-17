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
  ResponsiveContainer,
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
        
        let modelNames: string[] = [];
        try {
          const modelsResponse = await strokeApi.getModels();
          modelNames = modelsResponse.models || [];
        } catch (error) {
          console.warn('Endpoint /models no disponible, usando /status como fallback');
          modelNames = statusResponse.available_models || [];
        }

        if (modelNames.length === 0) {
          setModels([]);
          setLoading(false);
          return;
        }

        const modelsWithDetails = await Promise.all(
          modelNames.map(async (modelName) => {
            let detail: ModelDetailResponse | null = null;
            try {
              detail = await strokeApi.getModelDetail(modelName);
            } catch (error) {
              console.warn(`No se pudieron cargar detalles de ${modelName}`);
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

            return {
              ...(detail || {}),
              name: detail?.name || modelName.replace('.pkl', ''),
              isActive,
              icon,
              gradient,
            };
          })
        );

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

  const comparisonData = models
    .filter((m) => m.metrics && m.metrics.accuracy !== undefined)
    .map((model) => ({
      name: model.name || 'Unknown',
      accuracy: model.metrics?.accuracy || 0,
    }));

  const activeModel = models.find((m) => m.isActive) || models[0];
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
      {activeModel && (
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Comparison Chart */}
          {comparisonData.length > 0 && (
            <motion.article
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-600" />
                    Comparación de Accuracy
                  </CardTitle>
                  <CardDescription>Rendimiento comparativo entre modelos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        domain={[0, 100]} 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
                      />
                      <Bar 
                        dataKey="accuracy" 
                        fill="url(#accuracyGradient)" 
                        radius={[8, 8, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
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

          {/* Feature Importance */}
          {featureImportance.length > 0 ? (
            <motion.article
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Importancia de Características
                  </CardTitle>
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
                        domain={[0, 1]}
                      />
                      <YAxis 
                        dataKey="feature" 
                        type="category" 
                        stroke="#64748b" 
                        width={120}
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
          ) : (
            <motion.article
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Importancia de Características
                  </CardTitle>
                  <CardDescription>
                    Información de importancia de características no disponible
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm text-slate-500">
                    Los datos de importancia de características no están disponibles para este modelo
                  </p>
                </CardContent>
              </Card>
            </motion.article>
          )}
        </section>
      )}
    </main>
  );
}
