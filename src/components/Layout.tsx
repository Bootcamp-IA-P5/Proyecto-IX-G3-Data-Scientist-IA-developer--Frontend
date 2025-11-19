import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Brain,
  Activity,
  GitCompare,
  BarChart3,
  Info,
  Menu,
  X,
  Heart,
  Shield,
  Zap,
} from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const navigation = [
    { name: 'Centro de Control', href: '/', icon: Activity },
    { name: 'Evaluación Individual', href: '/predict', icon: Brain },
    { name: 'Análisis Masivo', href: '/predict-batch', icon: GitCompare },
    { name: 'Modelos IA', href: '/models', icon: Zap },
    { name: 'Panel Estadístico', href: '/statistics', icon: BarChart3 },
    { name: 'Base de Conocimiento', href: '/info', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      {/* Medical Pattern Background */}
      <div className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Top Navigation Bar - Changed to header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <nav className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden hover:bg-blue-50"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <Link to="/" className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-lg opacity-40 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl shadow-lg">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-slate-900 text-xl tracking-tight">Hospital F5</h1>
                  <p className="text-xs text-blue-600 tracking-wide uppercase font-medium">
                    Sistema de Predicción de Ictus
                  </p>
                </div>
              </Link>
            </div>

            {/* Right Section */}
            <div className="hidden lg:flex items-center gap-4">
              {/* System Status */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
                <div className="relative flex items-center">
                  <div className="absolute w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                  <div className="relative w-3 h-3 bg-emerald-500 rounded-full" />
                </div>
                <div>
                  <p className="text-xs text-emerald-900 font-medium">Sistema Operativo</p>
                  <p className="text-[10px] text-emerald-700">Todos los servicios activos</p>
                </div>
              </div>

              {/* Version Badge */}
              <div className="px-3 py-2 rounded-lg bg-slate-100 border border-slate-200">
                <p className="text-xs text-slate-600 font-mono">v2.3.1</p>
              </div>
            </div>
          </div>

          {/* Medical Accent Line */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
        </nav>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || isDesktop) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-20 bottom-0 w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 z-40 overflow-y-auto shadow-xl"
          >
            <div className="p-6">
              {/* Quick Stats in Sidebar */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Panel Rápido</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Predicciones Hoy</span>
                    <span className="font-semibold">68</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Precisión Modelo</span>
                    <span className="font-semibold">94.3%</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3 px-3">
                  Navegación Principal
                </p>
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isActive
                            ? 'bg-white/20'
                            : 'bg-slate-100 group-hover:bg-slate-200'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Medical Info Panel */}
              <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-1">
                      Uso Médico Supervisado
                    </p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Este sistema es una herramienta de apoyo. Todas las predicciones deben ser
                      validadas por personal médico.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-20 lg:pl-72 min-h-screen relative z-10">
        <div className="p-6 sm:p-8 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </div>
  );
}

