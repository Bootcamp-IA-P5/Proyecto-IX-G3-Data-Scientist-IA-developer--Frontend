import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import { PredictSingle } from './pages/PredictSingle';
import { PredictBatch } from './pages/PredictBatch';
import { Models } from './pages/Models';
import { Statistics } from './pages/Statistics';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<PredictSingle />} />
          <Route path="/predict-batch" element={<PredictBatch />} />
          <Route path="/models" element={<Models />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/info" element={<div className="p-6"><h1 className="text-2xl font-bold">Base de Conocimiento</h1><p className="text-slate-600">Información (próximamente)</p></div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
