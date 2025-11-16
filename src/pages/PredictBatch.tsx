import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  Loader2,
  Activity,
  BarChart3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { strokeApi } from '../services/api';
import type { BatchPredictionResponse, PredictionRequest } from '../types/api';

interface BatchResult {
  id: string;
  age: number;
  gender: string;
  risk: number;
  prediction: 'high' | 'medium' | 'low';
  probability: number;
  confidence: 'Low' | 'Medium' | 'High';
}

export function PredictBatch() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        toast.success(`Archivo "${selectedFile.name}" cargado correctamente`);
      } else {
        toast.error('Por favor, seleccione un archivo CSV');
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      toast.success(`Archivo "${droppedFile.name}" cargado correctamente`);
    } else {
      toast.error('Por favor, seleccione un archivo CSV');
    }
  };

  // Parsear CSV a array de objetos
  const parseCSV = async (file: File): Promise<Record<string, string>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter((line) => line.trim());
          if (lines.length < 2) {
            reject(new Error('El archivo CSV debe tener al menos una fila de encabezados y una fila de datos'));
            return;
          }

          const headers = lines[0].split(',').map((h) => h.trim());
          const data: Record<string, string>[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map((v) => v.trim());
            if (values.length !== headers.length) {
              continue; // Skip invalid rows
            }
            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
              row[header] = values[index];
            });
            data.push(row);
          }

          resolve(data);
        } catch (error) {
          reject(new Error('Error al parsear el archivo CSV'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  };

  // Transformar datos CSV a PredictionRequest
  const transformCSVToRequest = (csvData: Record<string, string>[]): Omit<PredictionRequest, 'model_name'>[] => {
    return csvData.map((row) => {
      const age = parseFloat(row.age || row.Age || '0');
      const hypertension = parseInt(row.hypertension || row.Hypertension || '0') as 0 | 1;
      const heart_disease = parseInt(row.heart_disease || row['heart_disease'] || row['Heart Disease'] || '0') as 0 | 1;
      const avg_glucose_level = parseFloat(row.avg_glucose_level || row['avg_glucose_level'] || row['Avg Glucose Level'] || '0');
      const bmi = parseFloat(row.bmi || row.BMI || '0');
      const gender = (row.gender || row.Gender || 'Male') as 'Male' | 'Female' | 'Other';
      const ever_married = (row.ever_married || row['ever_married'] || row['Ever Married'] || 'Yes') as 'Yes' | 'No';
      const work_type = row.work_type || row['work_type'] || row['Work Type'] || 'Private';
      const residence_type = (row.residence_type || row['residence_type'] || row['Residence Type'] || row['Residence_type'] || 'Urban') as 'Urban' | 'Rural';
      const smoking_status = row.smoking_status || row['smoking_status'] || row['Smoking Status'] || 'never smoked';

      return {
        age,
        hypertension,
        heart_disease,
        avg_glucose_level,
        bmi,
        gender,
        ever_married,
        work_type,
        Residence_type: residence_type,
        smoking_status,
      };
    });
  };

  // Transformar BatchPredictionResponse a BatchResult[]
  const transformApiResponseToResults = (apiResponse: BatchPredictionResponse, csvData: Record<string, string>[]): BatchResult[] => {
    return apiResponse.predictions.map((prediction, index) => {
      const risk = prediction.probability * 100;
      const riskLevel: 'high' | 'medium' | 'low' = risk > 70 ? 'high' : risk > 30 ? 'medium' : 'low';
      const csvRow = csvData[index] || {};
      const age = parseFloat(csvRow.age || csvRow.Age || '0');
      const gender = (csvRow.gender || csvRow.Gender || 'M').charAt(0).toUpperCase();

      return {
        id: `PAT-${String(index + 1).padStart(3, '0')}`,
        age,
        gender,
        risk,
        prediction: riskLevel,
        probability: prediction.probability,
        confidence: prediction.confidence,
      };
    });
  };

  const handleProcess = async () => {
    if (!file) {
      toast.error('Por favor, seleccione un archivo CSV');
      return;
    }

    setLoading(true);
    setProgress(0);
    setResults([]);

    try {
      // Simular progreso mientras se parsea
      setProgress(20);

      // Parsear CSV
      const csvData = await parseCSV(file);
      
      if (csvData.length === 0) {
        toast.error('El archivo CSV no contiene datos válidos');
        setLoading(false);
        return;
      }

      if (csvData.length > 100) {
        toast.error('El archivo CSV no puede tener más de 100 registros');
        setLoading(false);
        return;
      }

      setProgress(40);

      // Transformar datos CSV a formato de API
      const requestData = transformCSVToRequest(csvData);
      setProgress(60);

      // Llamar a la API
      const apiResponse = await strokeApi.predictBatch({
        data: requestData,
      });

      setProgress(90);

      // Transformar respuesta a formato UI
      const batchResults = transformApiResponseToResults(apiResponse, csvData);
      setResults(batchResults);
      setProgress(100);

      toast.success(`${batchResults.length} pacientes procesados exitosamente`, {
        description: 'Los resultados están listos para su revisión',
      });
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      
      let errorMessage = 'Error al procesar el archivo CSV';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error('Error en el procesamiento', {
        description: errorMessage || 'Por favor, verifique el formato del archivo CSV y vuelva a intentar',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleExport = () => {
    if (results.length === 0) {
      toast.error('No hay resultados para exportar');
      return;
    }

    // Crear CSV con los resultados
    const headers = ['ID Paciente', 'Edad', 'Género', 'Riesgo (%)', 'Clasificación', 'Confianza'];
    const rows = results.map((r) => [
      r.id,
      r.age.toString(),
      r.gender,
      r.risk.toFixed(1),
      r.prediction === 'high' ? 'Alto' : r.prediction === 'medium' ? 'Medio' : 'Bajo',
      r.confidence,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `resultados_prediccion_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Resultados exportados correctamente');
  };

  const getRiskColor = (prediction: string) => {
    switch (prediction) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-orange-600 bg-orange-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getRiskLabel = (prediction: string) => {
    switch (prediction) {
      case 'high':
        return 'Alto';
      case 'medium':
        return 'Medio';
      case 'low':
        return 'Bajo';
      default:
        return prediction;
    }
  };

  const stats = results.length > 0
    ? {
        total: results.length,
        high: results.filter((r) => r.prediction === 'high').length,
        medium: results.filter((r) => r.prediction === 'medium').length,
        low: results.filter((r) => r.prediction === 'low').length,
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-600 shadow-xl">
            <FileSpreadsheet className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900 mb-2">Análisis Masivo de Pacientes</h1>
            <p className="text-slate-600 text-lg">
              Procesamiento eficiente de múltiples evaluaciones mediante importación CSV
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-cyan-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-cyan-900 mb-1">
                Formato de archivo requerido
              </p>
              <p className="text-sm text-cyan-700 leading-relaxed">
                El archivo CSV debe incluir las columnas: age, gender, hypertension, heart_disease,
                ever_married, work_type, residence_type, avg_glucose_level, bmi, smoking_status
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Upload Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-600" />
              Cargar Archivo de Datos
            </CardTitle>
            <CardDescription>
              Importe un archivo CSV con los datos de múltiples pacientes para análisis simultáneo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-cyan-400 hover:bg-cyan-50/30 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-cyan-600" />
                </div>
                <p className="text-slate-900 font-medium mb-2">
                  {file ? `Archivo seleccionado: ${file.name}` : 'Arrastre su archivo CSV aquí'}
                </p>
                <p className="text-sm text-slate-600 mb-4">
                  o haga clic para seleccionar desde su dispositivo
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Formatos aceptados: .csv | Tamaño máximo: 10MB</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-5 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-600">Listo para procesar</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleProcess}
                    disabled={loading}
                    className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-lg"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 mr-2" />
                        Iniciar Análisis
                      </>
                    )}
                  </Button>
                </div>

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-700 font-medium">Progreso del análisis</span>
                      <span className="text-cyan-700 font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-slate-600 text-center mt-2">
                      Analizando datos con modelo de Machine Learning...
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {/* Statistics Section */}
      <AnimatePresence>
        {stats && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
              Resumen del Análisis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-cyan-600 to-teal-600 text-white border-0 shadow-xl">
                <CardHeader className="pb-2">
                  <CardDescription className="text-cyan-100 text-xs">
                    Total Procesados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{stats.total}</div>
                  <p className="text-xs text-cyan-100">Pacientes analizados</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-500 to-rose-500 text-white border-0 shadow-xl">
                <CardHeader className="pb-2">
                  <CardDescription className="text-red-100 text-xs">Riesgo Alto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{stats.high}</div>
                  <p className="text-xs text-red-100">Requieren atención prioritaria</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0 shadow-xl">
                <CardHeader className="pb-2">
                  <CardDescription className="text-orange-100 text-xs">Riesgo Medio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{stats.medium}</div>
                  <p className="text-xs text-orange-100">Seguimiento recomendado</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl">
                <CardHeader className="pb-2">
                  <CardDescription className="text-green-100 text-xs">Riesgo Bajo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{stats.low}</div>
                  <p className="text-xs text-green-100">Control rutinario</p>
                </CardContent>
              </Card>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-600" />
                      Resultados Detallados
                    </CardTitle>
                    <CardDescription>
                      Predicciones individuales para {results.length} pacientes
                    </CardDescription>
                  </div>
                  <Button onClick={handleExport} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exportar Resultados
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">ID Paciente</TableHead>
                        <TableHead className="font-semibold">Edad</TableHead>
                        <TableHead className="font-semibold">Género</TableHead>
                        <TableHead className="font-semibold">Riesgo (%)</TableHead>
                        <TableHead className="font-semibold">Clasificación</TableHead>
                        <TableHead className="font-semibold">Confianza</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result, index) => (
                        <motion.tr
                          key={result.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <TableCell className="font-medium text-slate-900">
                            {result.id}
                          </TableCell>
                          <TableCell>{result.age}</TableCell>
                          <TableCell>{result.gender}</TableCell>
                          <TableCell>
                            <span className="font-semibold text-slate-900">
                              {result.risk.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${getRiskColor(result.prediction)}`}>
                              {getRiskLabel(result.prediction)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-cyan-100 text-cyan-900">
                              {result.confidence === 'High'
                                ? 'Alta'
                                : result.confidence === 'Medium'
                                ? 'Media'
                                : 'Baja'}
                            </Badge>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  );
}

