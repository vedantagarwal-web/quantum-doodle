'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import CanvasManager, { CanvasManagerHandle, QuantumTool } from '../components/CanvasManager';
import QuantumSimulator from '../components/QuantumSimulator';
import ExportPanel from '../components/ExportPanel';
import Tutorial from '../components/Tutorial';
import About from '../components/About';
import ClientOnly from '../components/ClientOnly';
import { CircuitRecognizer, QuantumCircuit, Stroke } from '../lib/CircuitRecognizer';
import ToolPanel from '../components/ToolPanel';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);
  const [circuit, setCircuit] = useState<QuantumCircuit | null>(null);
  const [selectedTool, setSelectedTool] = useState<QuantumTool>('wire');
  const canvasManagerRef = useRef<CanvasManagerHandle>(null);
  const circuitRecognizer = new CircuitRecognizer();

  // Check if this is the first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedQuantumDoodle');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisitedQuantumDoodle', 'true');
    } else {
      setShowWelcome(false);
    }
  }, []);

  // Handle circuit changes when drawing is updated
  const handleCircuitChange = (strokes: Stroke[]) => {
    if (strokes.length === 0) {
      setCircuit(null);
      return;
    }

    try {
      const recognizedCircuit = circuitRecognizer.recognizeCircuit(strokes);
      if (circuitRecognizer.validateCircuit(recognizedCircuit)) {
        setCircuit(recognizedCircuit);
      }
    } catch (error) {
      console.error('Error recognizing circuit:', error);
    }
  };

  const handleToolSelect = (tool: QuantumTool) => {
    setSelectedTool(tool);
  };

  const exportAsImage = () => {
    if (canvasManagerRef.current) {
      const canvas = canvasManagerRef.current.getCanvasElement();
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'quantum-circuit.png';
        link.href = dataUrl;
        link.click();
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Header */}
      <motion.header 
        className="absolute top-0 left-0 right-0 z-10 bg-gray-800 bg-opacity-80 backdrop-blur-sm p-4 flex justify-between items-center"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white mr-2">Quantum Doodle</h1>
          <span className="text-blue-400 text-sm">Draw quantum circuits intuitively</span>
        </div>
        <nav className="flex space-x-4">
          <button 
            className="text-gray-300 hover:text-white transition-colors"
            onClick={() => setShowWelcome(true)}
          >
            Tutorial
          </button>
          <button 
            className="text-gray-300 hover:text-white transition-colors"
            onClick={() => setShowAbout(true)}
          >
            About
          </button>
          <button 
            className="text-gray-300 hover:text-white transition-colors"
            onClick={() => setShowHelpOverlay(!showHelpOverlay)}
          >
            {showHelpOverlay ? 'Hide Help' : 'Show Help'}
          </button>
        </nav>
      </motion.header>

      {/* Main Canvas */}
      <main className="w-full h-full pt-16">
        <div className="container mx-auto px-4 py-4">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left sidebar - Tools */}
            <div className="lg:col-span-2">
              <ToolPanel 
                currentTool={selectedTool}
                onToolChange={handleToolSelect}
              />
              <div className="mt-4">
                <button 
                  className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  onClick={() => setShowWelcome(true)}
                >
                  Open Tutorial
                </button>
              </div>
            </div>
            
            {/* Main canvas area */}
            <div className="lg:col-span-7 relative">
              <CanvasManager 
                onCircuitChange={handleCircuitChange}
                ref={canvasManagerRef}
                selectedTool={selectedTool}
              />
              
              {/* Help overlay */}
              {showHelpOverlay && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Quick Help Guide</h3>
                  
                  <div className="space-y-4 max-w-md">
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <h4 className="font-bold text-blue-400">Step 1: Create Wires</h4>
                      <p className="text-sm">Select the Wire tool and draw horizontal lines to create qubit wires.</p>
                    </div>
                    
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <h4 className="font-bold text-blue-400">Step 2: Add Gates</h4>
                      <p className="text-sm">Select a gate (like H, X, Z) and click directly on a wire to place it.</p>
                    </div>
                    
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <h4 className="font-bold text-blue-400">Step 3: View Results</h4>
                      <p className="text-sm">The quantum state and probabilities will appear in the right panel.</p>
                    </div>
                    
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <h4 className="font-bold text-red-400">Troubleshooting</h4>
                      <p className="text-sm">If gates aren't appearing, try clicking directly on the wire. Make sure to draw wires first!</p>
                    </div>
                  </div>
                  
                  <button 
                    className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    onClick={() => setShowHelpOverlay(false)}
                  >
                    Got it!
                  </button>
                </div>
              )}
            </div>
            
            {/* Right sidebar - Export & Simulation */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <ExportPanel 
                circuit={circuit} 
                canvasRef={canvasManagerRef as React.RefObject<CanvasManagerHandle>} 
              />
              <ClientOnly>
                <QuantumSimulator circuit={circuit} />
              </ClientOnly>
            </div>
          </div>
        </div>
      </main>

      {/* Welcome Modal */}
      {showWelcome && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowWelcome(false)}
        >
          <motion.div
            className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowWelcome(false)}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="text-blue-400 mr-2">✨</span>
              Welcome to Quantum Doodle!
            </h2>
            
            <p className="text-gray-300 mb-4">
              This interactive tool lets you draw quantum circuits and instantly see their simulation results.
            </p>
            
            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                onClick={() => {
                  setShowWelcome(false);
                  setShowHelpOverlay(true);
                }}
              >
                Show Full Tutorial
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => setShowWelcome(false)}
              >
                Get Started
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Tutorial Modal */}
      <Tutorial 
        isOpen={showWelcome} 
        onClose={() => setShowWelcome(false)} 
      />

      {/* About Modal */}
      <About 
        isOpen={showAbout} 
        onClose={() => setShowAbout(false)} 
      />
    </div>
  );
}
