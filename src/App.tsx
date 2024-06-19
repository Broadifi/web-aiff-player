import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AIFFAudioPlayer from "./components/AIFFAudioPlayer.tsx";
import CustomAudioPlayer from "./components/CustomAudioPlayer.tsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

        <AIFFAudioPlayer url={'https://media.unreleased.mmi.media/unreleased-music/uploads/unreleased-lxbwzm9hp2fdei1tq-DonnaSummer-IfeellovedDannyHowellsRemix.aif'} />
        <CustomAudioPlayer url={'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav'} />
    </>
  )
}

export default App
