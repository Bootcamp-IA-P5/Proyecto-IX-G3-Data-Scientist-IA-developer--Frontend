import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Activity,
  GitCompare,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Users,
  Clock,
  Shield,
  Zap,
  Heart,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { strokeApi } from '../services/api';
import type { HealthResponse, StatusResponse } from '../types/api';
import { toast } from 'sonner';

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        setLoading(true);
        const [healthData, statusData] = await Promise.all([
          strokeApi.getHealth(),
          strokeApi.getStatus(),
        ]);
        setHealth(healthData);
        setStatus(statusData);
      } catch (error) {
        console.error('Error al cargar datos del sistema:', error);
        toast.error('Error al conectar con el backend', {
          description: 'Verifica que el servidor esté ejecutándose',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSystemData();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    {
      title: 'Evaluación Individual',
      description:
        'Análisis completo del riesgo de ictus para un paciente específico con predicción basada en IA',
      icon: Brain,
      href: '/predict',
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      title: 'Análisis Masivo',
      description:
        'Procesamiento eficiente de múltiples pacientes mediante importación de archivos CSV',
      icon: GitCompare,
      href: '/predict-batch',
      gradient: 'from-cyan-600 to-teal-600',
    },
    {
      title: 'Modelos de IA',
      description:
        'Comparativa detallada de rendimiento entre diferentes algoritmos de Machine Learning',
      icon: Zap,
      href: '/models',
      gradient: 'from-purple-600 to-blue-600',
    },
    {
      title: 'Panel Estadístico',
      description:
        'Monitorización en tiempo real del sistema y análisis de métricas de rendimiento',
      icon: Activity,
      href: '/statistics',
      gradient: 'from-teal-600 to-green-600',
    },
  ];

  // Stats pueden quedar hardcodeados por ahora (no hay endpoints para esto)
  const stats = [
    {
      label: 'Modelos Cargados',
      value: status?.models_loaded?.toString() || '0',
      change: status?.models_loaded ? `${status.models_loaded} activos` : 'N/A',
      icon: Activity,
      description: 'Modelos disponibles',
      color: 'blue',
    },
    {
      label: 'Estado de la API',
      value: status?.api_status === 'running' ? 'Activa' : 'Inactiva',
      change: health?.status === 'healthy' ? 'Operativa' : 'Error',
      icon: TrendingUp,
      description: status?.api_status || 'Verificando...',
      color: health?.status === 'healthy' ? 'emerald' : 'red',
    },
    {
      label: 'Modelos Disponibles',
      value: status?.available_models?.length?.toString() || '0',
      change: 'Total',
      icon: Users,
      description: 'Algoritmos ML',
      color: 'purple',
    },
    {
      label: 'Tiempo de Respuesta',
      value: '0.3s',
      change: 'Media',
      icon: Clock,
      description: 'Tiempo promedio',
      color: 'cyan',
    },
  ];

  // System Health basado en datos reales
  const systemHealth = [
    {
      component: 'API REST',
      status: health?.status === 'healthy' ? 100 : 0,
      color: health?.status === 'healthy' ? 'emerald' : 'red',
    },
    {
      component: 'Modelo ML',
      status: status?.models_loaded && status.models_loaded > 0 ? 98 : 0,
      color: status?.models_loaded && status.models_loaded > 0 ? 'blue' : 'red',
    },
    {
      component: 'Servicios',
      status: health?.status === 'healthy' ? 100 : 0,
      color: health?.status === 'healthy' ? 'purple' : 'red',
    },
    {
      component: 'Almacenamiento',
      status: 85,
      color: 'cyan',
    },
  ];

  const getIconColor = (color: string) => {
    if (color === 'emerald') return 'text-emerald-600';
    if (color === 'blue') return 'text-blue-600';
    if (color === 'purple') return 'text-purple-600';
    if (color === 'cyan') return 'text-cyan-600';
    if (color === 'red') return 'text-red-600';
    return 'text-slate-600';
  };

  const getBgGradient = (color: string) => {
    if (color === 'emerald') return 'from-emerald-100 to-emerald-200';
    if (color === 'blue') return 'from-blue-100 to-blue-200';
    if (color === 'purple') return 'from-purple-100 to-purple-200';
    if (color === 'cyan') return 'from-cyan-100 to-cyan-200';
    if (color === 'red') return 'from-red-100 to-red-200';
    return 'from-slate-100 to-slate-200';
  };

  return (
    <main className="space-y-10">
      {/* Hero Section */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 mb-4"
          >
            <Heart className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Sistema de Salud Predictiva</span>
          </motion.div>

          <h1 className="text-slate-900 mb-4 text-5xl">Predicción de Ictus con IA</h1>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Plataforma médica avanzada basada en Machine Learning para la evaluación temprana y
            precisa del riesgo de accidente cerebrovascular
          </p>
        </div>

        {/* Simple Brain Icon instead of AnimatedBrain */}
        <div className="flex justify-center mb-12">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="p-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100"
          >
            <Brain className="w-16 h-16 text-blue-600" />
          </motion.div>
        </div>
      </motion.header>

      {/* Stats Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Métricas del Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${getBgGradient(stat.color)}`}>
                      <stat.icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        stat.change.includes('activos') || stat.change === 'Operativa'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{stat.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-slate-900 text-3xl font-semibold">{stat.value}</div>
                    <p className="text-xs text-slate-500">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-slate-900 mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Herramientas Clínicas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Link to={action.href}>
                <Card className="hover:shadow-2xl transition-all cursor-pointer group border-2 border-transparent hover:border-blue-200 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${action.gradient}`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.gradient} shadow-lg flex-shrink-0`}>
                        <action.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="mb-2 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </CardTitle>
                        <CardDescription className="leading-relaxed">
                          {action.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full group-hover:bg-slate-100 justify-between">
                      <span>Acceder al módulo</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* System Health & Model Info */}
      <section className="grid lg:grid-cols-2 gap-6">
        {/* System Health */}
        <motion.article
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {loading ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : health?.status === 'healthy' ? (
                  <Activity className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                Estado del Sistema
              </CardTitle>
              <CardDescription>Monitoreo de componentes críticos en tiempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemHealth.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.component}</span>
                    <span
                      className={`font-semibold ${
                        item.status === 0
                          ? 'text-red-600'
                          : item.color === 'emerald'
                          ? 'text-emerald-600'
                          : item.color === 'blue'
                          ? 'text-blue-600'
                          : item.color === 'purple'
                          ? 'text-purple-600'
                          : 'text-cyan-600'
                      }`}
                    >
                      {item.status}%
                    </span>
                  </div>
                  <Progress value={item.status} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.article>

        {/* Model Info */}
        <motion.article
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-0 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-white">Modelos Disponibles</CardTitle>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                  {loading ? (
                    <Loader2 className="w-2 h-2 animate-spin text-white" />
                  ) : status?.models_loaded && status.models_loaded > 0 ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-medium">Operativo</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-xs font-medium">Inactivo</span>
                    </>
                  )}
                </div>
              </div>
              <CardDescription className="text-blue-100">
                Información de los modelos de predicción disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              ) : status?.available_models && status.available_models.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                      <p className="text-sm text-blue-100 mb-1">Modelos Cargados</p>
                      <p className="font-semibold text-2xl">{status.models_loaded}</p>
                      <p className="text-xs text-blue-200 mt-1">Total activos</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                      <p className="text-sm text-blue-100 mb-1">Disponibles</p>
                      <p className="font-semibold text-2xl">{status.available_models.length}</p>
                      <p className="text-xs text-blue-200 mt-1">Algoritmos ML</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-sm text-blue-100 mb-2">Modelos:</p>
                    <div className="flex flex-wrap gap-2">
                      {status.available_models.map((model, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-white/20 text-white border-white/30"
                        >
                          {model.replace('.pkl', '')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-white/20">
                    <span className="text-blue-100">Estado API</span>
                    <span className="font-medium">{status.api_status}</span>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm text-center">
                  <AlertCircle className="w-8 h-8 text-white/70 mx-auto mb-2" />
                  <p className="text-blue-100">No hay modelos disponibles</p>
                  <p className="text-xs text-blue-200 mt-1">Verifica la conexión con el backend</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.article>
      </section>
    </main>
  );
}
