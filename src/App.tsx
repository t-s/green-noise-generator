import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [volume, setVolume] = useState(0.5);

  // Initialize audio context
  useEffect(() => {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = volume;
    
    setAudioContext(ctx);
    setGainNode(gain);

    return () => {
      ctx.close();
    };
  }, []);

  // Generate green noise
  const generateGreenNoise = useCallback(() => {
    if (!audioContext || !gainNode) return;

    const bufferSize = 4096;
    const noiseNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
    
    noiseNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      
      // Generate noise
      for (let i = 0; i < bufferSize; i++) {
        // Green noise emphasizes middle frequencies
        let noise = 0;
        for (let j = 0; j < 8; j++) {
          noise += Math.random() * Math.exp(-Math.abs(j - 3) / 2);
        }
        output[i] = noise / 4;
      }
    };

    noiseNode.connect(gainNode);
    return noiseNode;
  }, [audioContext, gainNode]);

  // Handle play/pause
  const toggleNoise = () => {
    if (!audioContext) return;

    if (isPlaying) {
      audioContext.suspend();
    } else {
      audioContext.resume();
      generateGreenNoise();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (gainNode) {
      gainNode.gain.value = newVolume;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Green Noise Generator</h1>
          <p className="text-green-600">Soothing middle-frequency noise for relaxation</p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={toggleNoise}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white" />
            ) : (
              <Play className="w-10 h-10 text-white" />
            )}
          </button>

          <div className="w-full max-w-xs flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-green-600" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          <p className="text-sm text-gray-500 text-center mt-4">
            {isPlaying ? 'Click to stop' : 'Click to play'} green noise
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;