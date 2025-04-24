import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Button } from './components/Button/Button';

function App() {
  const [choiced, setChoiced] = useState(false);

  const handleClick = () => {
    setChoiced(!choiced);
  };

  return (
    <>
      <Button
        label="ホーム"
        icon={<img src={reactLogo} alt="React Logo" width={20} height={20} />}
        choiced={choiced}
        onClick={handleClick}
      />
    </>
  );
}

export default App;
