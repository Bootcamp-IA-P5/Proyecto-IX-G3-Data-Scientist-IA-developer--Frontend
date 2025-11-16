const Home = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Centro de Control
        </h1>
        <p className="text-slate-600">
          Sistema de Predicción de Ictus - Hospital F5
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Evaluación Individual
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Realiza predicciones individuales de riesgo de ictus
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Análisis Masivo
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Procesa múltiples predicciones de forma simultánea
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Modelos IA
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Gestiona y compara diferentes modelos de predicción
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

