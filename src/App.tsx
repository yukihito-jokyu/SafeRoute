
import './App.css';
import { Footer } from './components/Footer/Footer';
import Header from './components/Header/Header';
import { OsakaMap } from './components/OsakaMap/OsakaMap'

function App() {
  

  return (
    <div className="app">
      {/* 中身（例えばページ内容） */}
      <Header />
      <OsakaMap />
      <Footer />
      
    </div>
  );
}

export default App;
