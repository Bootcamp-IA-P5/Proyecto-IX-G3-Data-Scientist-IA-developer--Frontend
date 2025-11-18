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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface ModelWithDetails extends ModelDetailResponse {
  isActive?: boolean;
  icon: typeof Activity;
  gradient: string;
}

export function Models() {
  const [models, setModels] = useState<ModelWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModelName, setSelectedModelName] = useState<string | null>(null);

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
              // Intentar cargar detalles, pero si falla (CORS u otro error), continuamos sin detalles
              detail = await strokeApi.getModelDetail(modelName);
              console.log(`Detalles cargados para ${modelName}:`, detail);
              // Debug: verificar hiperparámetros
              if (detail?.hyperparameters) {
                console.log(`Hiperparámetros para ${modelName}:`, detail.hyperparameters);
                console.log(`Número de hiperparámetros: ${Object.keys(detail.hyperparameters).length}`);
              } else {
                console.log(`No hay hiperparámetros para ${modelName}`);
              }
              // Debug: verificar feature importance
              if (detail?.feature_importance) {
                console.log(`Feature Importance RAW para ${modelName}:`, detail.feature_importance);
                console.log(`Primeros 3 items:`, detail.feature_importance.slice(0, 3));
                console.log(`Tipos de datos:`, detail.feature_importance.map((item: any) => ({
                  feature: item.feature,
                  importance: item.importance,
                  type: typeof item.importance,
                  isNull: item.importance === null,
                  isUndefined: item.importance === undefined,
                })).slice(0, 3));
              } else {
                console.log(`No hay feature_importance para ${modelName}`);
              }
              // Debug: verificar confusion matrix
              if (detail?.confusion_matrix) {
                console.log(`Confusion Matrix RAW para ${modelName}:`, detail.confusion_matrix);
                console.log(`Tipo:`, Array.isArray(detail.confusion_matrix) ? 'Array' : 'Object');
              } else {
                console.log(`No hay confusion_matrix para ${modelName}`);
              }
            } catch (error: any) {
              // Silenciar errores de CORS, Network Error, o errores 500/404/400
              // Si el backend está funcionando correctamente, estos errores no deberían aparecer
              const isSilentError = 
                error.message?.includes('CORS') || 
                error.message?.includes('Network Error') ||
                error.status === 500 ||
                error.status === 404 ||
                error.status === 400;
              
              // Solo loguear si no es un error silencioso esperado
              if (!isSilentError) {
                console.warn(`No se pudieron cargar detalles de ${modelName}:`, error);
              } else {
                // Log informativo en desarrollo
                console.debug(`Detalles no disponibles para ${modelName} (error silenciado)`);
              }
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
            // Si el backend devuelve un nombre, usarlo; si no, limpiar el nombre del archivo
            const displayName = detail?.name 
              ? detail.name.replace('.pkl', '').replace(/_/g, ' ')
              : modelName.replace('.pkl', '').replace(/_/g, ' ');

            // Construir el objeto del modelo preservando TODOS los datos del backend
            // Hacer spread primero, luego sobrescribir solo lo necesario
            const modelData: ModelWithDetails = {
              // Primero hacer spread de detail para preservar TODOS los campos del backend
              ...(detail || {}),
              // Luego sobrescribir solo los campos que necesitamos transformar
              name: displayName,
              type: detail?.type || detail?.model_type || 'Machine Learning',
              isActive,
              icon,
              gradient,
              // Asegurar que estos campos se preserven explícitamente (por si acaso)
              feature_importance: detail?.feature_importance,
              confusion_matrix: detail?.confusion_matrix,
              optimal_threshold: detail?.optimal_threshold,
            };
            
            console.log(`Modelo procesado ${modelName}:`, {
              name: modelData.name,
              hasFeatureImportance: !!modelData.feature_importance,
              featureImportanceLength: modelData.feature_importance?.length || 0,
              hasConfusionMatrix: !!modelData.confusion_matrix,
              hasOptimalThreshold: modelData.optimal_threshold !== undefined,
            });
            
            return modelData;
          })
        );

        console.log('Modelos finales cargados:', modelsWithDetails);
        setModels(modelsWithDetails);
        // Establecer el modelo seleccionado por defecto (el activo o el primero)
        if (modelsWithDetails.length > 0) {
          const defaultModel = modelsWithDetails.find(m => m.isActive) || modelsWithDetails[0];
          setSelectedModelName(defaultModel.name);
        }
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

  // Helper para normalizar métricas (convertir 0-1 a 0-100 si es necesario)
  const normalizeMetric = (value: number): number => {
    return value > 1 ? value : value * 100;
  };

  // Preparar datos para comparación de todas las métricas
  const comparisonData = [
    {
      metric: 'Accuracy',
      ...models.reduce((acc, model) => {
        if (model.metrics?.accuracy !== undefined) {
          acc[model.name || 'Unknown'] = normalizeMetric(model.metrics.accuracy);
        }
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: 'Precision',
      ...models.reduce((acc, model) => {
        if (model.metrics?.precision !== undefined) {
          acc[model.name || 'Unknown'] = normalizeMetric(model.metrics.precision);
        }
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: 'Recall',
      ...models.reduce((acc, model) => {
        if (model.metrics?.recall !== undefined) {
          acc[model.name || 'Unknown'] = normalizeMetric(model.metrics.recall);
        }
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: 'F1-Score',
      ...models.reduce((acc, model) => {
        if (model.metrics?.f1_score !== undefined) {
          acc[model.name || 'Unknown'] = normalizeMetric(model.metrics.f1_score);
        }
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: 'AUC-ROC',
      ...models.reduce((acc, model) => {
        if (model.metrics?.auc_roc !== undefined) {
          acc[model.name || 'Unknown'] = normalizeMetric(model.metrics.auc_roc);
        }
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  // Obtener el modelo seleccionado (o el activo por defecto)
  const selectedModel = selectedModelName 
    ? models.find((m) => m.name === selectedModelName) 
    : models.find((m) => m.isActive) || models[0];
  
  // Debug: verificar qué modelo está seleccionado y qué datos tiene
  console.log('=== DEBUG SELECTED MODEL ===');
  console.log('Modelo seleccionado:', selectedModelName);
  console.log('Selected Model objeto:', selectedModel?.name);
  console.log('Selected Model feature_importance existe:', !!selectedModel?.feature_importance);
  console.log('Selected Model feature_importance es array:', Array.isArray(selectedModel?.feature_importance));
  if (selectedModel?.feature_importance) {
    console.log('Selected Model feature_importance length:', selectedModel.feature_importance.length);
  }
  console.log('========================');
  const radarData = selectedModel?.metrics
    ? [
        { metric: 'Accuracy', value: normalizeMetric(selectedModel.metrics.accuracy || 0) },
        { metric: 'Precision', value: normalizeMetric(selectedModel.metrics.precision || 0) },
        { metric: 'Recall', value: normalizeMetric(selectedModel.metrics.recall || 0) },
        { metric: 'F1-Score', value: normalizeMetric(selectedModel.metrics.f1_score || 0) },
        { metric: 'AUC-ROC', value: normalizeMetric(selectedModel.metrics.auc_roc || 0) },
      ]
    : [];

  // Procesar feature importance: ordenar por importancia y tomar top 25
  let featureImportance: Array<{ feature: string; importance: number }> = [];
  
  if (selectedModel?.feature_importance) {
    console.log('Processing feature importance from selectedModel:', {
      isArray: Array.isArray(selectedModel.feature_importance),
      length: Array.isArray(selectedModel.feature_importance) ? selectedModel.feature_importance.length : 'N/A',
      firstItem: Array.isArray(selectedModel.feature_importance) && selectedModel.feature_importance.length > 0 
        ? selectedModel.feature_importance[0] 
        : 'N/A',
    });
    
    if (Array.isArray(selectedModel.feature_importance) && selectedModel.feature_importance.length > 0) {
      featureImportance = [...selectedModel.feature_importance]
        .map((item: any) => {
          // Manejar diferentes formatos de feature importance
          // Formato 1: {feature: "risk_score", importance: 109.0} (XGBoost, Random Forest)
          // Formato 2: {feature: "age", coefficient: 1.87, abs_coefficient: 1.87, odds_ratio: 6.51} (Logistic Regression)
          let importanceValue: number = 0;
          
          if (item.importance !== null && item.importance !== undefined) {
            // Formato estándar con 'importance'
            importanceValue = typeof item.importance === 'number' 
              ? item.importance 
              : Number(item.importance) || 0;
          } else if (item.abs_coefficient !== null && item.abs_coefficient !== undefined) {
            // Formato Logistic Regression: usar abs_coefficient como importancia
            importanceValue = typeof item.abs_coefficient === 'number'
              ? item.abs_coefficient
              : Number(item.abs_coefficient) || 0;
          } else if (item.coefficient !== null && item.coefficient !== undefined) {
            // Fallback: usar valor absoluto del coefficient
            const coeff = typeof item.coefficient === 'number'
              ? item.coefficient
              : Number(item.coefficient) || 0;
            importanceValue = Math.abs(coeff);
          }
          
          return {
            feature: String(item.feature || ''),
            importance: importanceValue,
          };
        })
        .filter(item => item.feature && item.importance > 0) // Filtrar solo items válidos
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 25);
      
      console.log('Feature importance after processing:', {
        count: featureImportance.length,
        firstThree: featureImportance.slice(0, 3),
      });
    } else {
      console.warn('Feature importance is not a valid array:', selectedModel.feature_importance);
    }
  } else {
    console.warn('No feature_importance in selectedModel:', selectedModel);
  }

  // Debug: log para verificar datos
  console.log('Selected Model:', selectedModel?.name);
  console.log('Feature Importance RAW:', selectedModel?.feature_importance);
  console.log('Feature Importance Processed:', featureImportance);
  console.log('Confusion Matrix:', selectedModel?.confusion_matrix);

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
                            {(model.metrics.accuracy > 1 ? model.metrics.accuracy : model.metrics.accuracy * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={model.metrics.accuracy > 1 ? model.metrics.accuracy : model.metrics.accuracy * 100} 
                          className="h-2" 
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      {model.metrics.precision !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">Precision</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {(model.metrics.precision > 1 ? model.metrics.precision : model.metrics.precision * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {model.metrics.recall !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">Recall</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {(model.metrics.recall > 1 ? model.metrics.recall : model.metrics.recall * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {model.metrics.f1_score !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">F1-Score</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {(model.metrics.f1_score > 1 ? model.metrics.f1_score : model.metrics.f1_score * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {model.metrics.auc_roc !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">AUC-ROC</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {(model.metrics.auc_roc > 1 ? model.metrics.auc_roc : model.metrics.auc_roc * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Optimal Threshold */}
                    {model.optimal_threshold !== undefined && model.optimal_threshold !== null && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Threshold Óptimo:</span>
                          <span className="text-slate-900 font-semibold">
                            {typeof model.optimal_threshold === 'number' 
                              ? model.optimal_threshold.toFixed(3) 
                              : String(model.optimal_threshold)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Hiperparámetros */}
                    {model.hyperparameters && Object.keys(model.hyperparameters).length > 0 && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-600 mb-2">Hiperparámetros</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {Object.entries(model.hyperparameters).slice(0, 5).map(([key, value]) => {
                            // Formatear el valor según su tipo
                            let displayValue: string;
                            if (value === null || value === undefined) {
                              displayValue = 'N/A';
                            } else if (typeof value === 'number') {
                              displayValue = value.toFixed(3);
                            } else if (typeof value === 'boolean') {
                              displayValue = value ? 'True' : 'False';
                            } else if (Array.isArray(value)) {
                              displayValue = `[${value.length} items]`;
                            } else if (typeof value === 'object') {
                              // Si es un objeto, intentar serializarlo de forma legible
                              try {
                                const objStr = JSON.stringify(value);
                                if (objStr.length > 50) {
                                  displayValue = '{...}';
                                } else {
                                  displayValue = objStr;
                                }
                              } catch {
                                displayValue = '{object}';
                              }
                            } else {
                              displayValue = String(value);
                            }

                            return (
                              <div key={key} className="flex justify-between text-xs">
                                <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="text-slate-900 font-medium">{displayValue}</span>
                              </div>
                            );
                          })}
                          {Object.keys(model.hyperparameters).length > 5 && (
                            <p className="text-xs text-slate-400 italic">
                              +{Object.keys(model.hyperparameters).length - 5} más
                            </p>
                          )}
                        </div>
                      </div>
                    )}
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

          {/* Radar Chart - Modelo Seleccionado */}
          {radarData.length > 0 && selectedModel && (
            <motion.article
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <CardTitle>Radar de Métricas</CardTitle>
                      <CardDescription>
                        Visualización holística del modelo seleccionado
                      </CardDescription>
                    </div>
                    <Select
                      value={selectedModelName || ''}
                      onValueChange={(value) => setSelectedModelName(value)}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Seleccionar modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model.name} value={model.name}>
                            <div className="flex items-center gap-2">
                              <span>{model.name}</span>
                              {model.isActive && (
                                <Badge variant="outline" className="text-xs">
                                  Activo
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                             name={selectedModel.name}
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
        {selectedModel && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <CardTitle>Importancia de Características</CardTitle>
                    <CardDescription>
                      Features más relevantes en la predicción del modelo seleccionado
                    </CardDescription>
                  </div>
                  <Select
                    value={selectedModelName || ''}
                    onValueChange={(value) => setSelectedModelName(value)}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Seleccionar modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          <div className="flex items-center gap-2">
                            <span>{model.name}</span>
                            {model.isActive && (
                              <Badge variant="outline" className="text-xs">
                                Activo
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {featureImportance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={Math.max(300, featureImportance.length * 20)}>
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
                        width={180}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: number) => {
                          // Los valores pueden venir como porcentajes (0-100) o como valores absolutos
                          // Si el valor es > 1, asumimos que ya es un porcentaje o valor absoluto
                          return value > 1 ? value.toFixed(2) : `${(value * 100).toFixed(2)}%`;
                        }}
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
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-slate-500">No hay datos de importancia de características disponibles para este modelo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.article>
        )}

        {/* Confusion Matrix */}
        {(selectedModel?.confusion_matrix_info || selectedModel?.confusion_matrix) && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Matriz de Confusión</CardTitle>
                <CardDescription>
                  Clasificación de predicciones del {selectedModel.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Priorizar confusion_matrix_info (nuevo formato), fallback a confusion_matrix (legacy)
                  const matrixInfo = selectedModel.confusion_matrix_info;
                  const legacyMatrix = selectedModel.confusion_matrix;
                  
                  let values: number[][] = [];
                  let labels: { predicted: string[]; actual: string[] } = {
                    predicted: ['No Ictus', 'Ictus'],
                    actual: ['No Ictus', 'Ictus'],
                  };
                  let metrics: {
                    accuracy?: number;
                    precision?: number;
                    recall?: number;
                    f1_score?: number;
                    specificity?: number;
                  } = {};
                  
                  // Normalizar labels: asegurar que siempre sea un objeto con predicted y actual
                  const normalizeLabels = (labelsInput: any): { predicted: string[]; actual: string[] } => {
                    if (!labelsInput) {
                      return { predicted: ['No Ictus', 'Ictus'], actual: ['No Ictus', 'Ictus'] };
                    }
                    // Si es un array, convertir a objeto
                    if (Array.isArray(labelsInput)) {
                      return {
                        predicted: labelsInput.length >= 2 ? labelsInput : ['No Ictus', 'Ictus'],
                        actual: labelsInput.length >= 2 ? labelsInput : ['No Ictus', 'Ictus'],
                      };
                    }
                    // Si es un objeto, validar estructura
                    if (typeof labelsInput === 'object' && labelsInput.predicted && labelsInput.actual) {
                      return {
                        predicted: Array.isArray(labelsInput.predicted) ? labelsInput.predicted : ['No Ictus', 'Ictus'],
                        actual: Array.isArray(labelsInput.actual) ? labelsInput.actual : ['No Ictus', 'Ictus'],
                      };
                    }
                    // Fallback
                    return { predicted: ['No Ictus', 'Ictus'], actual: ['No Ictus', 'Ictus'] };
                  };

                  // Usar nuevo formato si está disponible y tiene values válidos
                  if (matrixInfo && matrixInfo.values && Array.isArray(matrixInfo.values) && matrixInfo.values.length > 0) {
                    values = matrixInfo.values;
                    labels = normalizeLabels(matrixInfo.labels);
                    metrics = matrixInfo.metrics || {};
                    console.log('Using confusion_matrix_info:', { values, labels, metrics });
                  } else if (legacyMatrix) {
                    // Procesar formato legacy (fallback si confusion_matrix_info no tiene values)
                    if (Array.isArray(legacyMatrix)) {
                      values = legacyMatrix as number[][];
                    } else if (typeof legacyMatrix === 'object') {
                      const cm = legacyMatrix as {
                        true_negative?: number;
                        false_positive?: number;
                        false_negative?: number;
                        true_positive?: number;
                      };
                      values = [
                        [Number(cm.true_negative) || 0, Number(cm.false_positive) || 0],
                        [Number(cm.false_negative) || 0, Number(cm.true_positive) || 0],
                      ];
                    }
                    // Si tenemos labels de matrixInfo pero usamos legacy values, normalizar los labels
                    if (matrixInfo && matrixInfo.labels) {
                      labels = normalizeLabels(matrixInfo.labels);
                    }
                    // Si tenemos metrics de matrixInfo pero usamos legacy values, mantener las metrics
                    if (matrixInfo && matrixInfo.metrics) {
                      metrics = matrixInfo.metrics;
                    }
                    console.log('Using legacy confusion_matrix (with optional labels/metrics from info):', { values, labels, metrics });
                  }
                  
                  // Validar que values sea un array válido con datos
                  if (!values || !Array.isArray(values) || values.length === 0 || !Array.isArray(values[0]) || values[0].length === 0) {
                    return (
                      <div className="py-8 text-center text-slate-500">
                        <p>No hay datos de matriz de confusión disponibles</p>
                      </div>
                    );
                  }
                  
                  // Asegurar que tenemos al menos una matriz 2x2
                  if (values.length < 2 || values[0].length < 2 || values[1].length < 2) {
                    return (
                      <div className="py-8 text-center text-slate-500">
                        <p>Formato de matriz de confusión inválido</p>
                      </div>
                    );
                  }
                  
                  const tn = values[0][0] || 0;
                  const fp = values[0][1] || 0;
                  const fn = values[1][0] || 0;
                  const tp = values[1][1] || 0;
                  const total = tn + fp + fn + tp;
                  
                  // Calcular métricas si no vienen del backend
                  const calculatedMetrics = {
                    accuracy: metrics.accuracy !== undefined 
                      ? metrics.accuracy 
                      : total > 0 ? (tp + tn) / total : 0,
                    precision: metrics.precision !== undefined 
                      ? metrics.precision 
                      : tp + fp > 0 ? tp / (tp + fp) : 0,
                    recall: metrics.recall !== undefined 
                      ? metrics.recall 
                      : tp + fn > 0 ? tp / (tp + fn) : 0,
                    f1_score: metrics.f1_score !== undefined 
                      ? metrics.f1_score 
                      : (metrics.precision !== undefined && metrics.recall !== undefined)
                        ? 2 * (metrics.precision * metrics.recall) / (metrics.precision + metrics.recall)
                        : (tp + fp > 0 && tp + fn > 0)
                          ? 2 * (tp / (tp + fp)) * (tp / (tp + fn)) / ((tp / (tp + fp)) + (tp / (tp + fn)))
                          : 0,
                    specificity: metrics.specificity !== undefined
                      ? metrics.specificity
                      : tn + fp > 0 ? tn / (tn + fp) : 0,
                  };

                  return (
                    <div className="space-y-6">
                      {/* Matriz de Confusión */}
                      <div className="flex flex-col items-center">
                        <div className="grid grid-cols-3 gap-4">
                          {/* Header */}
                          <div className="flex items-center justify-center">
                            <span className="text-sm font-semibold text-slate-600">Real / Predicho</span>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
                            <p className="text-sm font-semibold text-slate-700 mb-1">
                              {labels.predicted[0] || 'No Ictus'}
                            </p>
                            <p className="text-xs text-slate-500">Predicho</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                            <p className="text-sm font-semibold text-slate-700 mb-1">
                              {labels.predicted[1] || 'Ictus'}
                            </p>
                            <p className="text-xs text-slate-500">Predicho</p>
                          </div>
                          
                          {/* Row 1: Real No Ictus */}
                          <div className="flex items-center justify-end pr-4">
                            <p className="text-sm font-semibold text-slate-700">
                              {labels.actual[0] || 'No Ictus'}
                            </p>
                          </div>
                          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-300 text-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
                            <div className="text-xs font-medium text-blue-800 mb-2">Verdadero Negativo</div>
                            <div className="text-3xl font-bold text-blue-900 mb-1">{tn}</div>
                            {total > 0 && (
                              <div className="text-xs font-semibold text-blue-700 bg-blue-50 rounded-full px-2 py-1 inline-block mt-1">
                                {((tn / total) * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-200 to-blue-200 border-2 border-purple-400 text-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
                            <div className="text-xs font-medium text-purple-900 mb-2">Falso Positivo</div>
                            <div className="text-3xl font-bold text-purple-900 mb-1">{fp}</div>
                            {total > 0 && (
                              <div className="text-xs font-semibold text-purple-800 bg-purple-50 rounded-full px-2 py-1 inline-block mt-1">
                                {((fp / total) * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                          
                          {/* Row 2: Real Ictus */}
                          <div className="flex items-center justify-end pr-4">
                            <p className="text-sm font-semibold text-slate-700">
                              {labels.actual[1] || 'Ictus'}
                            </p>
                          </div>
                          <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-200 to-blue-200 border-2 border-cyan-400 text-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
                            <div className="text-xs font-medium text-cyan-900 mb-2">Falso Negativo</div>
                            <div className="text-3xl font-bold text-cyan-900 mb-1">{fn}</div>
                            {total > 0 && (
                              <div className="text-xs font-semibold text-cyan-800 bg-cyan-50 rounded-full px-2 py-1 inline-block mt-1">
                                {((fn / total) * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 border-2 border-purple-600 text-center shadow-lg hover:shadow-xl transition-all hover:scale-105 text-white">
                            <div className="text-xs font-medium text-purple-100 mb-2">Verdadero Positivo</div>
                            <div className="text-3xl font-bold text-white mb-1">{tp}</div>
                            {total > 0 && (
                              <div className="text-xs font-semibold text-purple-100 bg-white/20 rounded-full px-2 py-1 inline-block mt-1">
                                {((tp / total) * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Métricas Calculadas */}
                      <div className="pt-6 border-t border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-700 mb-4 text-center">Métricas de Rendimiento</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 text-center shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-xs text-slate-600 mb-1 font-medium">Accuracy</p>
                            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {(calculatedMetrics.accuracy * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 text-center shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-xs text-slate-600 mb-1 font-medium">Precision</p>
                            <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                              {(calculatedMetrics.precision * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 text-center shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-xs text-slate-600 mb-1 font-medium">Recall</p>
                            <p className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                              {(calculatedMetrics.recall * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 text-center shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-xs text-slate-600 mb-1 font-medium">F1-Score</p>
                            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                              {(calculatedMetrics.f1_score * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-cyan-50 border border-purple-200 text-center shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-xs text-slate-600 mb-1 font-medium">Specificity</p>
                            <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                              {(calculatedMetrics.specificity * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.article>
        )}
      </section>
    </main>
  );
}
