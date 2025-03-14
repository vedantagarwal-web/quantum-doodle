import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';

// Types for our drawing tools and modes
export type DrawingMode = 'freehand' | 'gate' | 'wire' | 'erase';
export type QuantumTool = 'wire' | 'hadamard' | 'pauliX' | 'pauliY' | 'pauliZ' | 'cnot' | 'measure';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  tool: QuantumTool;
  color: string;
  width: number;
}

// Add a new interface for gates
interface Gate {
  tool: QuantumTool;
  position: Point;
  color: string;
}

interface CanvasManagerProps {
  onCircuitChange?: (circuit: any) => void;
  selectedTool?: QuantumTool; // Add prop to receive selected tool from parent
}

export interface CanvasManagerHandle {
  getCanvasElement: () => HTMLCanvasElement | null;
}

const CanvasManager = forwardRef<CanvasManagerHandle, CanvasManagerProps>(({ onCircuitChange, selectedTool }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('wire');
  const [currentTool, setCurrentTool] = useState<QuantumTool>('wire');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [gates, setGates] = useState<Gate[]>([]); // New state for gates
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const gridSize = 40; // Size of grid cells in pixels

  // Add new state variables for guided mode
  const [guidedMode, setGuidedMode] = useState(true);
  const [wireSnapPositions, setWireSnapPositions] = useState<number[]>([]);
  const [showWireGuides, setShowWireGuides] = useState(true);
  const [showGatePlacementGuide, setShowGatePlacementGuide] = useState(false);
  const [gatePlacementPosition, setGatePlacementPosition] = useState<Point | null>(null);

  // Update current tool when selectedTool prop changes
  useEffect(() => {
    if (selectedTool) {
      setCurrentTool(selectedTool);
    }
  }, [selectedTool]);

  // Update drawing mode when tool changes
  useEffect(() => {
    if (currentTool === 'wire') {
      setDrawingMode('wire');
    } else {
      setDrawingMode('gate');
    }
    console.log(`Tool changed to: ${currentTool}, Mode set to: ${currentTool === 'wire' ? 'wire' : 'gate'}`);
  }, [currentTool]);

  // Expose the canvas element to parent components
  useImperativeHandle(ref, () => ({
    getCanvasElement: () => canvasRef.current
  }));

  // Function to notify parent of circuit changes
  const notifyCircuitChange = () => {
    if (!onCircuitChange) return;
    
    // Create a combined representation for the circuit recognizer
    const combinedStrokes: Stroke[] = [
      ...strokes,
      ...gates.map(gate => ({
        points: [gate.position],
        tool: gate.tool,
        color: gate.color,
        width: 4
      }))
    ];
    
    onCircuitChange(combinedStrokes);
  };

  // Initialize canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        // Set canvas dimensions to match its container
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
        
        setCanvasSize({
          width: canvasRef.current.width,
          height: canvasRef.current.height,
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Draw grid on canvas
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showGrid) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)'; // Make grid more visible
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  // Draw all strokes on canvas
  useEffect(() => {
    draw();
  }, [strokes, gates, currentStroke, showGrid, canvasSize, showWireGuides, wireSnapPositions, showGatePlacementGuide, gatePlacementPosition]);

  // Add a function to detect and snap to existing wires
  const snapToNearestWire = (y: number): number => {
    if (wireSnapPositions.length === 0) return y;
    
    // Find the closest wire position
    let closestWire = wireSnapPositions[0];
    let minDistance = Math.abs(y - closestWire);
    
    wireSnapPositions.forEach(wireY => {
      const distance = Math.abs(y - wireY);
      if (distance < minDistance) {
        minDistance = distance;
        closestWire = wireY;
      }
    });
    
    // Snap if within 20 pixels
    if (minDistance < 20) {
      return closestWire;
    }
    
    return y;
  };

  // Update the handleMouseDown function to include guided wire creation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log(`Mouse down with tool: ${currentTool}, mode: ${drawingMode}`);
    
    if (drawingMode === 'wire') {
      // Wire drawing mode
      if (guidedMode) {
        // In guided mode, start a horizontal wire
        setIsDrawing(true);
        const snappedY = snapToNearestWire(y);
        setCurrentStroke({
          points: [{ x, y: snappedY }],
          tool: 'wire',
          color: '#FFFFFF',
          width: 3 // Increased width for better visibility
        });
      } else {
        // Normal drawing mode for wires
        setIsDrawing(true);
        setCurrentStroke({
          points: [{ x, y }],
          tool: 'wire',
          color: getColorForTool('wire'),
          width: getWidthForTool('wire')
        });
      }
    } else if (drawingMode === 'gate') {
      // Gate placement mode
      const nearestWireY = snapToNearestWire(y);
      if (Math.abs(y - nearestWireY) < 20) {
        // Add a new gate directly to the gates array
        const newGate: Gate = {
          tool: currentTool,
          position: { x, y: nearestWireY },
          color: getColorForTool(currentTool)
        };
        
        const updatedGates = [...gates, newGate];
        setGates(updatedGates);
        
        // Log for debugging
        console.log(`Added ${currentTool} gate at (${x}, ${nearestWireY})`);
        console.log('Current gates:', updatedGates);
        
        // Notify parent component of the change
        setTimeout(() => {
          notifyCircuitChange();
        }, 0);
      }
    }
  };

  // Update the handleMouseMove function for guided wire creation
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDrawing && currentStroke && drawingMode === 'wire') {
      if (guidedMode) {
        // For wires in guided mode, maintain the same y-coordinate for horizontal lines
        const startY = currentStroke.points[0].y;
        setCurrentStroke({
          ...currentStroke,
          points: [...currentStroke.points, { x, y: startY }]
        });
      } else {
        // Normal drawing for wires
        setCurrentStroke({
          ...currentStroke,
          points: [...currentStroke.points, { x, y }]
        });
      }
    }
    
    // Show gate placement guide when hovering near wires with a gate tool selected
    if (drawingMode === 'gate') {
      const nearestWireY = snapToNearestWire(y);
      if (Math.abs(y - nearestWireY) < 20) {
        setShowGatePlacementGuide(true);
        setGatePlacementPosition({ x, y: nearestWireY });
      } else {
        setShowGatePlacementGuide(false);
        setGatePlacementPosition(null);
      }
    }
  };

  // Update the handleMouseUp function to update wire snap positions
  const handleMouseUp = () => {
    if (!isDrawing || !currentStroke) return;
    
    setIsDrawing(false);
    
    // Only add the stroke if it's a wire (gates are added immediately on click)
    if (drawingMode === 'wire') {
      // Only add the stroke if it has at least 2 points and a minimum length
      if (currentStroke.points.length >= 2) {
        const startPoint = currentStroke.points[0];
        const endPoint = currentStroke.points[currentStroke.points.length - 1];
        const length = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) + 
          Math.pow(endPoint.y - startPoint.y, 2)
        );
        
        // Only add wires with a minimum length (e.g., 20 pixels)
        if (length >= 20) {
          // Add the current stroke to the strokes array
          const newStrokes = [...strokes, currentStroke];
          setStrokes(newStrokes);
          
          // If this was a wire, add its y-position to the snap positions
          const wireY = currentStroke.points[0].y;
          if (!wireSnapPositions.includes(wireY)) {
            setWireSnapPositions([...wireSnapPositions, wireY]);
          }
          
          // Notify parent component of the change
          setTimeout(() => {
            notifyCircuitChange();
          }, 0);
        }
      }
    }
    
    setCurrentStroke(null);
  };

  // Function to get color based on tool
  const getColorForTool = (tool: QuantumTool): string => {
    switch (tool) {
      case 'wire':
        return '#FFFFFF';
      case 'hadamard':
        return '#3B82F6'; // blue
      case 'pauliX':
        return '#EF4444'; // red
      case 'pauliY':
        return '#10B981'; // green
      case 'pauliZ':
        return '#8B5CF6'; // purple
      case 'cnot':
        return '#F59E0B'; // yellow
      case 'measure':
        return '#F97316'; // orange
      default:
        return '#FFFFFF';
    }
  };

  // Function to get line width based on tool
  const getWidthForTool = (tool: QuantumTool): number => {
    return tool === 'wire' ? 3 : 4; // Increased widths for better visibility
  };

  // Helper function to draw gate symbols
  const drawGateSymbol = (ctx: CanvasRenderingContext2D, tool: QuantumTool, x: number, y: number, isGuide: boolean = false) => {
    const radius = 15;
    
    // Save the current context state
    ctx.save();
    
    // Set styles based on whether this is a guide or actual gate
    if (isGuide) {
      ctx.strokeStyle = getColorForTool(tool);
      ctx.fillStyle = getColorForTool(tool);
      ctx.globalAlpha = 0.3;
    } else {
      ctx.strokeStyle = getColorForTool(tool);
      ctx.fillStyle = getColorForTool(tool);
      ctx.globalAlpha = 1.0; // Full opacity for actual gates
    }
    
    // Draw circle background
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw the gate symbol
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 1.0;
    
    let symbol = '';
    switch (tool) {
      case 'hadamard':
        symbol = 'H';
        break;
      case 'pauliX':
        symbol = 'X';
        break;
      case 'pauliY':
        symbol = 'Y';
        break;
      case 'pauliZ':
        symbol = 'Z';
        break;
      case 'cnot':
        symbol = '⊕';
        break;
      case 'measure':
        symbol = 'M';
        break;
    }
    
    ctx.fillText(symbol, x, y);
    
    // Restore the context state
    ctx.restore();
  };

  // Helper function to draw CNOT control point (filled circle)
  const drawCnotControlPoint = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isGuide: boolean = false) => {
    const radius = 15;
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    
    if (isGuide) {
      ctx.globalAlpha = 0.3;
    }
    
    // Draw outer circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw inner circle (white dot)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, radius / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };
  
  // Helper function to draw CNOT target point (⊕ symbol)
  const drawCnotTargetPoint = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isGuide: boolean = false) => {
    const radius = 15;
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    
    if (isGuide) {
      ctx.globalAlpha = 0.3;
    }
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw ⊕ symbol
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⊕', x, y);
    
    ctx.restore();
  };

  // Add a function to draw CNOT connections
  const drawCnotConnections = (ctx: CanvasRenderingContext2D) => {
    // Group CNOT gates by x-position (column)
    const cnotsByColumn: { [key: number]: Gate[] } = {};
    
    gates.forEach(gate => {
      if (gate.tool === 'cnot') {
        // Round x position to nearest grid cell to group nearby CNOTs
        const columnKey = Math.round(gate.position.x / gridSize) * gridSize;
        if (!cnotsByColumn[columnKey]) {
          cnotsByColumn[columnKey] = [];
        }
        cnotsByColumn[columnKey].push(gate);
      }
    });
    
    // Draw connections for each column
    Object.values(cnotsByColumn).forEach(columnCnots => {
      // Sort by y-position
      columnCnots.sort((a, b) => a.position.y - b.position.y);
      
      // Draw connections between pairs
      for (let i = 0; i < columnCnots.length - 1; i += 2) {
        if (i + 1 < columnCnots.length) {
          const control = columnCnots[i];
          const target = columnCnots[i + 1];
          
          // Draw a line connecting them
          ctx.save();
          ctx.strokeStyle = getColorForTool('cnot');
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]); // Dashed line
          
          ctx.beginPath();
          ctx.moveTo(control.position.x, control.position.y);
          ctx.lineTo(target.position.x, target.position.y);
          ctx.stroke();
          
          ctx.restore();
          
          // Draw control point (filled circle)
          drawCnotControlPoint(ctx, control.position.x, control.position.y, getColorForTool('cnot'));
          
          // Draw target point (⊕ symbol)
          drawCnotTargetPoint(ctx, target.position.x, target.position.y, getColorForTool('cnot'));
        }
      }
    });
  };

  // Update the draw function to include CNOT connections
  const draw = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }
    
    // Draw wire guides if enabled
    if (showWireGuides && wireSnapPositions.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(100, 149, 237, 0.5)'; // Make guides more visible
      ctx.lineWidth = 2;
      
      wireSnapPositions.forEach(y => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      });
      ctx.restore();
    }
    
    // First draw all wires
    strokes.forEach(stroke => {
      if (stroke.tool === 'wire' && stroke.points.length > 1) {
        // Draw wires as lines
        ctx.save();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        
        ctx.stroke();
        ctx.restore();
      }
    });
    
    // Draw current stroke if exists
    if (currentStroke && currentStroke.points.length > 0) {
      if (currentStroke.tool === 'wire') {
        ctx.save();
        ctx.strokeStyle = currentStroke.color;
        ctx.lineWidth = currentStroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);
        
        for (let i = 1; i < currentStroke.points.length; i++) {
          ctx.lineTo(currentStroke.points[i].x, currentStroke.points[i].y);
        }
        
        ctx.stroke();
        ctx.restore();
      }
    }
    
    // Draw CNOT connections
    drawCnotConnections(ctx);
    
    // Then draw all gates (except CNOT gates, which are drawn by drawCnotConnections)
    gates.forEach(gate => {
      if (gate.tool !== 'cnot') {
        drawGateSymbol(ctx, gate.tool, gate.position.x, gate.position.y);
      }
    });
    
    // Draw gate placement guide
    if (showGatePlacementGuide && gatePlacementPosition) {
      if (currentTool === 'cnot') {
        // Check if this is a control or target point
        const recentCnots = gates.filter(g => g.tool === 'cnot');
        const columnKey = Math.round(gatePlacementPosition.x / gridSize) * gridSize;
        const cnotsInColumn = recentCnots.filter(g => {
          const gateColumn = Math.round(g.position.x / gridSize) * gridSize;
          return gateColumn === columnKey;
        });
        
        if (cnotsInColumn.length % 2 === 0) {
          // This will be a control point
          drawCnotControlPoint(ctx, gatePlacementPosition.x, gatePlacementPosition.y, getColorForTool('cnot'), true);
        } else {
          // This will be a target point
          drawCnotTargetPoint(ctx, gatePlacementPosition.x, gatePlacementPosition.y, getColorForTool('cnot'), true);
          
          // Draw connection guide to the control point
          if (cnotsInColumn.length > 0) {
            const lastCnot = cnotsInColumn[cnotsInColumn.length - 1];
            
            ctx.save();
            ctx.strokeStyle = getColorForTool('cnot');
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            ctx.setLineDash([5, 3]); // Dashed line
            
            ctx.beginPath();
            ctx.moveTo(lastCnot.position.x, lastCnot.position.y);
            ctx.lineTo(gatePlacementPosition.x, gatePlacementPosition.y);
            ctx.stroke();
            
            ctx.restore();
          }
        }
      } else {
        drawGateSymbol(ctx, currentTool, gatePlacementPosition.x, gatePlacementPosition.y, true);
      }
    }
  };

  // Add UI controls for guided mode
  const toggleGuidedMode = () => {
    setGuidedMode(!guidedMode);
  };
  
  const toggleWireGuides = () => {
    setShowWireGuides(!showWireGuides);
  };

  return (
    <div className="canvas-container relative bg-gray-900 rounded-lg overflow-hidden h-[600px]"> {/* Set fixed height */}
      <div className="absolute top-2 right-2 flex space-x-2 z-10">
        <button
          className="px-3 py-1 bg-gray-800 text-white rounded-md flex items-center text-sm"
          onClick={() => {
            setStrokes([]);
            setGates([]);
            setWireSnapPositions([]);
            if (onCircuitChange) {
              onCircuitChange([]);
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
        
        <button
          className={`px-3 py-1 ${showGrid ? 'bg-blue-600' : 'bg-gray-800'} text-white rounded-md flex items-center text-sm`}
          onClick={() => setShowGrid(!showGrid)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>
        
        <button
          className={`px-3 py-1 ${guidedMode ? 'bg-green-600' : 'bg-gray-800'} text-white rounded-md flex items-center text-sm`}
          onClick={toggleGuidedMode}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {guidedMode ? 'Guided Mode' : 'Free Mode'}
        </button>
        
        <button
          className={`px-3 py-1 ${showWireGuides ? 'bg-purple-600' : 'bg-gray-800'} text-white rounded-md flex items-center text-sm`}
          onClick={toggleWireGuides}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {showWireGuides ? 'Hide Guides' : 'Show Guides'}
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Helper text */}
      <div className="absolute bottom-2 left-2 text-gray-400 text-sm">
        {drawingMode === 'wire' ? 
          'Draw horizontal lines to create qubit wires' : 
          'Click on a wire to place the selected gate'}
      </div>
      
      {/* Current tool indicator */}
      <div className="absolute top-2 left-2 bg-gray-800 rounded-md px-3 py-1 text-white text-sm flex items-center">
        <span className="mr-2">Current Tool:</span>
        <span className={`px-2 py-1 rounded ${getColorForTool(currentTool) !== '#FFFFFF' ? 'text-white' : 'text-gray-900'}`} 
              style={{ backgroundColor: getColorForTool(currentTool) }}>
          {currentTool === 'wire' ? 'Wire' : 
           currentTool === 'hadamard' ? 'H' :
           currentTool === 'pauliX' ? 'X' :
           currentTool === 'pauliY' ? 'Y' :
           currentTool === 'pauliZ' ? 'Z' :
           currentTool === 'cnot' ? 'CNOT' :
           'Measure'}
        </span>
      </div>
    </div>
  );
});

CanvasManager.displayName = 'CanvasManager';

export default CanvasManager; 