import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Activity,
  GitCompare,
  ArrowRight,
  Shield,
  Zap,
  Heart,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { Progress } from '../components/ui/progress';
import { strokeApi } from '../services/api';
import type { ControlCenterResponse } from '../types/api';
import { toast } from 'sonner';

export default function Home() {
  
  const [controlCenter, setControlCenter] = useState<ControlCenterResponse | null>(null);

  useEffect(() => {
    const fetchControlCenter = async () => {
      try {
       
        const data = await strokeApi.getControlCenter();
        setControlCenter(data);
      } catch (error: any) {
        console.error('Error al cargar datos del centro de control:', error);
        const errorMessage = error?.message || 'Error desconocido';
        toast.error('Error al conectar con el backend', {
          description: errorMessage,
          duration: errorMessage.includes('tardando') ? 8000 : 5000,
        });
      }
    };

    fetchControlCenter();
   
    const interval = setInterval(fetchControlCenter, 10000);
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


  const getStatusColor = (status: 'operational' | 'warning' | 'error', percentage: number) => {
    if (status === 'error') return 'text-red-600';
    if (status === 'warning') return 'text-yellow-600';
    if (percentage >= 95) return 'text-red-600'; 
    if (percentage >= 80) return 'text-yellow-600'; 
    return 'text-green-600';
  };

  const getStatusIcon = (status: 'operational' | 'warning' | 'error') => {
    if (status === 'error') return '❌';
    if (status === 'warning') return '⚠️';
    return '✅';
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

      {/* Estado del Sistema */}
      {controlCenter && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>Monitoreo de componentes críticos en tiempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {controlCenter.components.map((component, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(component.status)}</span>
                      <span className="font-medium text-slate-700">{component.name}</span>
                    </div>
                    <span className={`font-semibold ${getStatusColor(component.status, component.percentage)}`}>
                      {component.percentage}%
                    </span>
                  </div>
                  <Progress value={component.percentage} className="h-2" />
                  <p className="text-xs text-slate-500">{component.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.section>
      )}
    </main>
  );
}
