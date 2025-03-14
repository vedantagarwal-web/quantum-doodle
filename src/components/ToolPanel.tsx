'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QuantumTool } from './CanvasManager';
import { FaArrowRight, FaQuestion } from 'react-icons/fa';

interface ToolPanelProps {
  currentTool: QuantumTool;
  onToolChange: (tool: QuantumTool) => void;
}

interface ToolInfo {
  name: string;
  icon: string;
  description: string;
  color: string;
}

const ToolPanel: React.FC<ToolPanelProps> = ({ currentTool, onToolChange }) => {
  const [hoveredTool, setHoveredTool] = useState<QuantumTool | null>(null);

  const tools: Record<QuantumTool, ToolInfo> = {
    wire: {
      name: 'Wire',
      icon: '—',
      description: 'Draw horizontal lines to create qubit wires',
      color: 'bg-gray-400'
    },
    hadamard: {
      name: 'Hadamard (H)',
      icon: 'H',
      description: 'Creates superposition: |0⟩ → (|0⟩+|1⟩)/√2, |1⟩ → (|0⟩-|1⟩)/√2',
      color: 'bg-blue-500'
    },
    pauliX: {
      name: 'Pauli-X (NOT)',
      icon: 'X',
      description: 'Flips a qubit: |0⟩ → |1⟩, |1⟩ → |0⟩',
      color: 'bg-red-500'
    },
    pauliY: {
      name: 'Pauli-Y',
      icon: 'Y',
      description: 'Rotates around Y-axis: |0⟩ → i|1⟩, |1⟩ → -i|0⟩',
      color: 'bg-green-500'
    },
    pauliZ: {
      name: 'Pauli-Z',
      icon: 'Z',
      description: 'Phase flip: |0⟩ → |0⟩, |1⟩ → -|1⟩',
      color: 'bg-purple-500'
    },
    cnot: {
      name: 'CNOT',
      icon: '⊕',
      description: 'Controlled-NOT: Flips target qubit if control qubit is |1⟩',
      color: 'bg-yellow-500'
    },
    measure: {
      name: 'Measure',
      icon: 'M',
      description: 'Measures a qubit, collapsing its quantum state',
      color: 'bg-orange-500'
    }
  };

  return (
    <div className="tool-panel bg-gray-800 rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-bold text-white mb-4">Quantum Tools</h3>
      
      <div className="space-y-3">
        {Object.entries(tools).map(([toolKey, toolInfo]) => {
          const tool = toolKey as QuantumTool;
          const isActive = currentTool === tool;
          const isHovered = hoveredTool === tool;
          
          return (
            <div key={tool} className="relative">
              <motion.button
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-gray-700 ring-2 ring-blue-500' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onToolChange(tool)}
                onMouseEnter={() => setHoveredTool(tool)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <div className={`w-8 h-8 ${toolInfo.color} rounded-md flex items-center justify-center text-white font-bold mr-3`}>
                  {toolInfo.icon}
                </div>
                <span className="text-white">{toolInfo.name}</span>
                {isActive && (
                  <motion.div 
                    className="ml-auto text-blue-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaArrowRight />
                  </motion.div>
                )}
              </motion.button>
              
              {/* Tooltip */}
              {isHovered && (
                <motion.div
                  className="absolute left-full ml-2 top-0 z-50 w-64 p-3 bg-gray-900 rounded-lg shadow-lg"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start">
                    <div className="mr-2 mt-1 text-blue-400">
                      <FaQuestion size={14} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{toolInfo.name}</h4>
                      <p className="text-sm text-gray-300 mt-1">{toolInfo.description}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          Tip: Start with the Wire tool to create qubit lines, then add gates.
        </p>
      </div>
    </div>
  );
};

export default ToolPanel; 