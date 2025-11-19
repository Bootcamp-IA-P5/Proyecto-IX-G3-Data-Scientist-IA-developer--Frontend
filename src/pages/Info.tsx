import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { motion } from 'framer-motion';
import { Info, Brain, AlertTriangle, Code, Sparkles } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

export function InfoPage() {
  const technologies = [
    { name: 'Python', description: 'Lenguaje principal de desarrollo' },
    { name: 'Scikit-learn', description: 'Entrenamiento de modelos ML' },
    { name: 'Pandas & NumPy', description: 'Procesamiento y análisis de datos' },
    { name: 'Optuna', description: 'Optimización de hiperparámetros' },
    { name: 'Docker', description: 'Containerización y despliegue' },
    { name: 'FastAPI', description: 'API REST backend' },
    { name: 'React', description: 'Frontend interactivo' },
    { name: 'MLFlow', description: 'Tracking de experimentos' },
  ];

  const riskFactors = [
    { factor: 'Edad', description: 'Mayor edad incrementa el riesgo significativamente' },
    { factor: 'Hipertensión', description: 'Presión arterial alta es un factor crítico' },
    { factor: 'Enfermedad Cardíaca', description: 'Historia de problemas cardiovasculares' },
    { factor: 'Nivel de Glucosa', description: 'Niveles elevados indican mayor riesgo' },
    { factor: 'IMC (Índice de Masa Corporal)', description: 'Sobrepeso y obesidad aumentan el riesgo' },
    { factor: 'Estado de Fumador', description: 'El tabaquismo es un factor de riesgo importante' },
  ];

  return (
    <main className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
            <Info className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Base de Conocimiento</h1>
            <p className="text-slate-600 text-lg">Conozca cómo funciona nuestra IA de predicción de ictus</p>
          </div>
        </div>
      </motion.header>

      {/* What is a Stroke */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              <CardTitle>¿Qué es un Ictus?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Un ictus, también conocido como accidente cerebrovascular (ACV), ocurre cuando el flujo sanguíneo a una parte del cerebro se interrumpe o se reduce, impidiendo que el tejido cerebral reciba oxígeno y nutrientes.
            </p>
            <p>
              Es una emergencia médica que requiere atención inmediata. La detección temprana de factores de riesgo puede ayudar a prevenir esta condición potencialmente mortal.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <article className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold mb-2">15M</div>
                <p className="text-sm text-red-100">Personas afectadas anualmente</p>
              </article>
              <article className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold mb-2">6M</div>
                <p className="text-sm text-red-100">Muertes por ictus al año</p>
              </article>
              <article className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold mb-2">5M</div>
                <p className="text-sm text-red-100">Quedan con discapacidad permanente</p>
              </article>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* How it Works */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-600" />
              <CardTitle>¿Cómo Funciona Nuestro Modelo?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>1. Recolección de Datos</AccordionTrigger>
                <AccordionContent>
                  El sistema analiza datos médicos históricos de miles de pacientes, incluyendo edad, historial médico, estilo de vida y marcadores biológicos. Estos datos forman la base del aprendizaje del modelo.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>2. Preprocesamiento</AccordionTrigger>
                <AccordionContent>
                  Los datos se limpian, normalizan y transforman. Se manejan valores faltantes, se equilibran clases desbalanceadas y se codifican variables categóricas para optimizar el entrenamiento.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>3. Entrenamiento del Modelo</AccordionTrigger>
                <AccordionContent>
                  Utilizamos técnicas de ensemble learning, principalmente Random Forest, que combina múltiples árboles de decisión para mejorar la precisión. El modelo aprende patrones complejos que correlacionan los factores de riesgo con la probabilidad de ictus.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>4. Validación y Optimización</AccordionTrigger>
                <AccordionContent>
                  Aplicamos validación cruzada y optimización de hiperparámetros con Optuna. El modelo se evalúa con métricas como precisión, recall, F1-score y AUC-ROC para garantizar su fiabilidad.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>5. Predicción en Tiempo Real</AccordionTrigger>
                <AccordionContent>
                  Cuando se ingresan datos de un paciente, el modelo procesado analiza los patrones y genera una probabilidad de riesgo basada en millones de cálculos realizados en milisegundos.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </motion.section>

      {/* Risk Factors */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-600" />
              <CardTitle>Factores de Riesgo Analizados</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {riskFactors.map((item, index) => (
                <motion.article
                  key={item.factor}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200"
                >
                  <h3 className="text-slate-900 font-semibold mb-1">{item.factor}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </motion.article>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Technologies */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Code className="w-6 h-6 text-cyan-600" />
              <CardTitle>Tecnologías Utilizadas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {technologies.map((tech, index) => (
                <motion.article
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="p-3 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 text-center border border-purple-200"
                >
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{tech.name}</h3>
                  <p className="text-xs text-slate-600">{tech.description}</p>
                </motion.article>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Disclaimer */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              <CardTitle>Aviso Importante</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              Este sistema es una herramienta de apoyo diagnóstico y NO sustituye el criterio médico profesional.
            </p>
            <p>
              Las predicciones generadas deben ser interpretadas por personal médico calificado. Ante cualquier síntoma o preocupación de salud, consulte inmediatamente con un profesional sanitario.
            </p>
            <p className="text-sm text-yellow-100 mt-4">
              El sistema está diseñado para uso clínico como herramienta de screening preventivo. Hospital F5 no se hace responsable de decisiones médicas tomadas exclusivamente basándose en estas predicciones.
            </p>
          </CardContent>
        </Card>
      </motion.section>
    </main>
  );
}

