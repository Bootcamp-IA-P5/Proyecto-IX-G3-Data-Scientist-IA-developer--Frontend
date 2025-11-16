import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import { PredictSingle } from './pages/PredictSingle';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<PredictSingle />} />
          <Route path="/predict-batch" element={<div className="p-6"><h1 className="text-2xl font-bold">Análisis Masivo</h1><p className="text-slate-600">Análisis por lotes (próximamente)</p></div>} />
          <Route path="/models" element={<div className="p-6"><h1 className="text-2xl font-bold">Modelos IA</h1><p className="text-slate-600">Gestión de modelos (próximamente)</p></div>} />
          <Route path="/statistics" element={<div className="p-6"><h1 className="text-2xl font-bold">Panel Estadístico</h1><p className="text-slate-600">Estadísticas (próximamente)</p></div>} />
          <Route path="/info" element={<div className="p-6"><h1 className="text-2xl font-bold">Base de Conocimiento</h1><p className="text-slate-600">Información (próximamente)</p></div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
