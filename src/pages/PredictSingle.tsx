import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import {
  Brain,
  Loader2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  TrendingUp,
  User,
  Stethoscope,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiskGauge } from '../components/RiskGauge';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { strokeApi } from '../services/api';
import type { PredictionResult, PredictionRequest, PredictionResponse } from '../types/api';

export function PredictSingle() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    hypertension: '',
    heart_disease: '',
    ever_married: '',
    work_type: '',
    residence_type: '',
    avg_glucose_level: '',
    bmi: '',
    smoking_status: '',
  });

  const validateForm = (): boolean => {
    const age = parseFloat(formData.age);
    const glucose = parseFloat(formData.avg_glucose_level);
    const bmi = parseFloat(formData.bmi);

    if (isNaN(age) || age < 0 || age > 120) {
      toast.error('La edad debe estar entre 0 y 120 años');
      return false;
    }

    if (isNaN(glucose) || glucose < 0) {
      toast.error('El nivel de glucosa no puede ser negativo');
      return false;
    }

    if (isNaN(bmi) || bmi < 0 || bmi > 100) {
      toast.error('El IMC debe estar entre 0 y 100 kg/m²');
      return false;
    }

  
    if (
      !formData.age ||
      !formData.gender ||
      !formData.hypertension ||
      !formData.heart_disease ||
      !formData.ever_married ||
      !formData.work_type ||
      !formData.residence_type ||
      !formData.avg_glucose_level ||
      !formData.bmi ||
      !formData.smoking_status
    ) {
      toast.error('Por favor complete todos los campos');
      return false;
    }

    return true;
  };

  const transformFormDataToRequest = (): PredictionRequest => {
    return {
      age: parseFloat(formData.age),
      hypertension: parseInt(formData.hypertension) as 0 | 1,
      heart_disease: parseInt(formData.heart_disease) as 0 | 1,
      avg_glucose_level: parseFloat(formData.avg_glucose_level),
      bmi: parseFloat(formData.bmi),
      gender: formData.gender as 'Male' | 'Female' | 'Other',
      ever_married: formData.ever_married as 'Yes' | 'No',
      work_type: formData.work_type,
      Residence_type: formData.residence_type as 'Urban' | 'Rural',
      smoking_status: formData.smoking_status,
    };
  };

  
  const transformApiResponseToResult = (apiResponse: PredictionResponse): PredictionResult => {
    const risk = apiResponse.probability * 100;
    const riskLevel: 'high' | 'medium' | 'low' = risk > 70 ? 'high' : risk > 30 ? 'medium' : 'low';
    const age = parseFloat(formData.age);
    const glucose = parseFloat(formData.avg_glucose_level);
    const bmi = parseFloat(formData.bmi);


    const recommendations: string[] = [];
    if (formData.hypertension === '1') {
      recommendations.push('Control regular de presión arterial cada 2 semanas');
    }
    if (glucose > 140) {
      recommendations.push('Monitorización de niveles de glucosa en sangre');
    }
    if (formData.heart_disease === '1') {
      recommendations.push('Consulta con especialista cardiovascular recomendada');
    }
    if (bmi > 25) {
      recommendations.push('Evaluación de hábitos alimenticios y actividad física');
    }
    if (riskLevel === 'high') {
      recommendations.push('Seguimiento médico inmediato recomendado');
    }
    if (recommendations.length === 0) {
      recommendations.push('Mantener controles médicos regulares');
      recommendations.push('Seguir un estilo de vida saludable');
    }

   
    const riskFactors: { factor: string; impact: 'high' | 'medium' | 'low' }[] = [
      {
        factor: 'Edad',
        impact: (age > 60 ? 'high' : age > 45 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      },
      {
        factor: 'Hipertensión',
        impact: (formData.hypertension === '1' ? 'high' : 'low') as 'high' | 'low',
      },
      {
        factor: 'Enfermedad Cardíaca',
        impact: (formData.heart_disease === '1' ? 'high' : 'low') as 'high' | 'low',
      },
      {
        factor: 'Nivel de Glucosa',
        impact: (glucose > 140 ? 'high' : glucose > 100 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      },
      {
        factor: 'IMC',
        impact: (bmi > 30 ? 'high' : bmi > 25 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      },
    ];

    return {
      ...apiResponse,
      risk,
      riskLevel,
      recommendations,
      riskFactors,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
     
      const requestData = transformFormDataToRequest();


      const apiResponse = await strokeApi.predict(requestData);

      const result = transformApiResponseToResult(apiResponse);

      setResult(result);
      toast.success('Análisis completado exitosamente', {
        description: 'Los resultados están listos para su revisión',
      });
    } catch (error) {
      console.error('Error al realizar la predicción:', error);
      
      let errorMessage = 'Error al procesar la predicción';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error('Error en la predicción', {
        description: errorMessage || 'Por favor, verifique que el backend esté disponible y vuelva a intentar',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900 mb-2">Evaluación Individual del Riesgo</h1>
            <p className="text-slate-600 text-lg">
              Análisis clínico completo basado en inteligencia artificial para predicción de ictus
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Stethoscope className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Instrucciones para el personal médico
              </p>
              <p className="text-sm text-blue-700 leading-relaxed">
                Complete todos los campos con datos actualizados del paciente. El modelo de IA
                analizará múltiples factores de riesgo y generará una evaluación probabilística
                basada en más de 5,000 casos clínicos.
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form - 3 columns */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <CardTitle>Datos del Paciente</CardTitle>
              </div>
              <CardDescription>
                Información clínica y demográfica requerida para el análisis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Demographics Section */}
                <section>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-600 rounded-full" />
                    Datos Demográficos
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age" className="text-slate-700">
                        Edad (años)
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        min="0"
                        max="120"
                        placeholder="Ej: 45"
                        value={formData.age}
                        onChange={(e) => handleChange('age', e.target.value)}
                        required
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender" className="text-slate-700">
                        Género
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(v) => handleChange('gender', v)}
                        required
                      >
                        <SelectTrigger id="gender" className="mt-1.5">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Masculino</SelectItem>
                          <SelectItem value="Female">Femenino</SelectItem>
                          <SelectItem value="Other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Medical History Section */}
                <section>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-red-600 rounded-full" />
                    Historial Médico
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hypertension" className="text-slate-700">
                        Hipertensión Arterial
                      </Label>
                      <Select
                        value={formData.hypertension}
                        onValueChange={(v) => handleChange('hypertension', v)}
                        required
                      >
                        <SelectTrigger id="hypertension" className="mt-1.5">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No presenta</SelectItem>
                          <SelectItem value="1">Sí presenta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="heart_disease" className="text-slate-700">
                        Enfermedad Cardíaca
                      </Label>
                      <Select
                        value={formData.heart_disease}
                        onValueChange={(v) => handleChange('heart_disease', v)}
                        required
                      >
                        <SelectTrigger id="heart_disease" className="mt-1.5">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No presenta</SelectItem>
                          <SelectItem value="1">Sí presenta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Lifestyle Section */}
                <section>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-purple-600 rounded-full" />
                    Estilo de Vida y Contexto Social
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ever_married" className="text-slate-700">
                        Estado Civil
                      </Label>
                      <Select
                        value={formData.ever_married}
                        onValueChange={(v) => handleChange('ever_married', v)}
                        required
                      >
                        <SelectTrigger id="ever_married" className="mt-1.5">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Casado/a o ha estado casado/a</SelectItem>
                          <SelectItem value="No">Nunca ha estado casado/a</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="work_type" className="text-slate-700">
                        Tipo de Ocupación
                      </Label>
                      <Select
                        value={formData.work_type}
                        onValueChange={(v) => handleChange('work_type', v)}
                        required
                      >
                        <SelectTrigger id="work_type" className="mt-1.5">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Private">Sector Privado</SelectItem>
                          <SelectItem value="Self-employed">Autónomo/a</SelectItem>
                          <SelectItem value="Govt_job">Sector Público</SelectItem>
                          <SelectItem value="children">Menor (Niño/a)</SelectItem>
                          <SelectItem value="Never_worked">Sin ocupación laboral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="residence_type" className="text-slate-700">
                        Tipo de Residencia
                      </Label>
                      <Select
                        value={formData.residence_type}
                        onValueChange={(v) => handleChange('residence_type', v)}
                        required
                      >
                        <SelectTrigger id="residence_type" className="mt-1.5">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Urban">Zona Urbana</SelectItem>
                          <SelectItem value="Rural">Zona Rural</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="smoking_status" className="text-slate-700">
                        Estado de Fumador
                      </Label>
                      <Select
                        value={formData.smoking_status}
                        onValueChange={(v) => handleChange('smoking_status', v)}
                        required
                      >
                        <SelectTrigger id="smoking_status" className="mt-1.5">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never smoked">Nunca ha fumado</SelectItem>
                          <SelectItem value="formerly smoked">Ex fumador/a</SelectItem>
                          <SelectItem value="smokes">Fumador/a activo/a</SelectItem>
                          <SelectItem value="Unknown">Información no disponible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Clinical Measurements Section */}
                <section>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-cyan-600 rounded-full" />
                    Mediciones Clínicas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="avg_glucose_level" className="text-slate-700">
                        Glucosa Promedio (mg/dL)
                      </Label>
                      <Input
                        id="avg_glucose_level"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ej: 106.50"
                        value={formData.avg_glucose_level}
                        onChange={(e) => handleChange('avg_glucose_level', e.target.value)}
                        required
                        className="mt-1.5"
                      />
                      <p className="text-xs text-slate-500 mt-1">Rango normal: 70-100 mg/dL</p>
                    </div>
                    <div>
                      <Label htmlFor="bmi" className="text-slate-700">
                        IMC - Índice de Masa Corporal (kg/m²)
                      </Label>
                      <Input
                        id="bmi"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="Ej: 24.5"
                        value={formData.bmi}
                        onChange={(e) => handleChange('bmi', e.target.value)}
                        required
                        className="mt-1.5"
                      />
                      <p className="text-xs text-slate-500 mt-1">Rango normal: 18.5-24.9 kg/m²</p>
                    </div>
                  </div>
                </section>

                <Separator />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12 shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Procesando análisis con IA...
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5 mr-2" />
                      Iniciar Evaluación
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.section>

        {/* Results - 2 columns */}
        <motion.article
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="sticky top-24 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <CardTitle>Resultado del Análisis</CardTitle>
                </div>
                <CardDescription>
                  Evaluación de riesgo generada por Machine Learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12"
                    >
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse" />
                        <Brain className="relative w-20 h-20 text-blue-600 animate-pulse" />
                      </div>
                      <p className="text-slate-900 font-medium mb-2">
                        Analizando datos del paciente
                      </p>
                      <p className="text-sm text-slate-600">
                        Procesando factores de riesgo con IA...
                      </p>
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="space-y-6"
                    >
                      <RiskGauge value={result.risk} />

                      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-slate-700">
                            Confianza del Modelo
                          </span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-900">
                            {result.confidence === 'High'
                              ? 'Alta'
                              : result.confidence === 'Medium'
                              ? 'Media'
                              : 'Baja'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.riskLevel === 'high' ? (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          ) : result.riskLevel === 'medium' ? (
                            <TrendingUp className="w-5 h-5 text-orange-600" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          <span className="text-sm text-slate-600">
                            Nivel de Riesgo:{' '}
                            <span className="font-semibold text-slate-900">
                              {result.riskLevel === 'high'
                                ? 'Alto'
                                : result.riskLevel === 'medium'
                                ? 'Medio'
                                : 'Bajo'}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-600" />
                          Factores de Riesgo Detectados
                        </h4>
                        <div className="space-y-2">
                          {result.riskFactors.map((factor, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                            >
                              <span className="text-sm text-slate-700">{factor.factor}</span>
                              <Badge
                                variant="outline"
                                className={`${
                                  factor.impact === 'high'
                                    ? 'bg-red-100 text-red-700 border-red-300'
                                    : factor.impact === 'medium'
                                    ? 'bg-orange-100 text-orange-700 border-orange-300'
                                    : 'bg-green-100 text-green-700 border-green-300'
                                }`}
                              >
                                {factor.impact === 'high'
                                  ? 'Alto'
                                  : factor.impact === 'medium'
                                  ? 'Medio'
                                  : 'Bajo'}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-blue-600" />
                          Recomendaciones Clínicas
                        </h4>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-3 text-sm text-slate-700 p-3 rounded-lg bg-slate-50"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                              <span className="leading-relaxed">{rec}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex items-start gap-2 text-xs text-slate-500">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            <strong className="text-amber-900">Aviso médico:</strong> Esta
                            predicción es una herramienta de apoyo diagnóstico y no sustituye el
                            criterio clínico profesional. Se recomienda validación por personal
                            médico especializado.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-100 to-blue-100 mb-4">
                        <Brain className="w-16 h-16 text-slate-400" />
                      </div>
                      <p className="text-slate-900 font-medium mb-2">
                        Esperando datos del paciente
                      </p>
                      <p className="text-sm text-slate-600 max-w-xs">
                        Complete el formulario de evaluación para generar la predicción de riesgo de
                        ictus
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </motion.article>
      </div>
    </div>
  );
}

