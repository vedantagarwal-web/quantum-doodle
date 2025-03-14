import { QuantumTool } from '../components/CanvasManager';

// Define types for our quantum circuit
export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  tool: QuantumTool;
  color: string;
  width: number;
}

export interface QuantumGate {
  type: QuantumTool;
  targets: number[];
  controls?: number[];
  parameters?: number[];
  position: Point;
}

export interface QuantumCircuit {
  qubits: number;
  depth: number;
  gates: QuantumGate[];
}

export class CircuitRecognizer {
  private gridSize: number = 40; // Size of grid cells in pixels
  private snapThreshold: number = 20; // Distance in pixels to snap to grid

  constructor(gridSize?: number, snapThreshold?: number) {
    if (gridSize) this.gridSize = gridSize;
    if (snapThreshold) this.snapThreshold = snapThreshold;
  }

  /**
   * Convert a collection of strokes into a quantum circuit
   */
  recognizeCircuit(strokes: Stroke[]): QuantumCircuit {
    // Identify horizontal lines as qubit wires
    const wireStrokes = strokes.filter(stroke => stroke.tool === 'wire');
    
    // Get the y-coordinates of all wires
    const wirePositions: number[] = [];
    wireStrokes.forEach(wire => {
      if (wire.points.length > 0) {
        const wireY = wire.points[0].y;
        if (!wirePositions.includes(wireY)) {
          wirePositions.push(wireY);
        }
      }
    });
    
    // Sort wire positions by y-coordinate
    wirePositions.sort((a, b) => a - b);
    
    // Count unique qubit wires - each wire is a qubit
    const qubitCount = wirePositions.length;
    console.log(`Recognized ${qubitCount} qubits from ${wirePositions.length} wire positions`);

    // Recognize gates
    const gates: QuantumGate[] = [];
    const cnotControls: QuantumGate[] = [];
    
    // Process gate strokes (non-wire strokes)
    const gateStrokes = strokes.filter(stroke => stroke.tool !== 'wire');
    
    gateStrokes.forEach(stroke => {
      if (stroke.points.length === 0) return;
      
      const point = stroke.points[0];
      
      // Find which qubit this gate is on
      let targetQubit = -1;
      let minDistance = Infinity;
      
      wirePositions.forEach((wireY, index) => {
        const distance = Math.abs(point.y - wireY);
        if (distance < minDistance && distance < this.snapThreshold) {
          minDistance = distance;
          targetQubit = index;
        }
      });
      
      // If we couldn't find a qubit, skip this gate
      if (targetQubit === -1) return;
      
      // Create a gate
      const gate: QuantumGate = {
        type: stroke.tool,
        targets: [targetQubit],
        position: { x: point.x, y: point.y }
      };
      
      // Special handling for CNOT gates
      if (stroke.tool === 'cnot') {
        // Store as a potential control point
        cnotControls.push(gate);
      } else {
        // Add other gates directly
        gates.push(gate);
      }
    });

    // Process CNOT gates by pairing them
    this.processCnotGates(cnotControls, gates, wirePositions);

    // Determine circuit depth (number of columns)
    const maxX = gates.reduce((max, gate) => Math.max(max, gate.position.x), 0);
    const depth = Math.ceil(maxX / this.gridSize) + 1;

    console.log('Recognized circuit:', { qubits: qubitCount, depth, gates: gates.length });

    return {
      qubits: qubitCount, // Each wire is a qubit
      depth,
      gates
    };
  }

  /**
   * Process CNOT gates by pairing control and target points
   */
  private processCnotGates(cnotControls: QuantumGate[], gates: QuantumGate[], wirePositions: number[]): void {
    // Group CNOT controls by x-position (column)
    const cnotsByColumn: { [key: number]: QuantumGate[] } = {};
    
    cnotControls.forEach(cnot => {
      // Round x position to nearest grid cell to group nearby CNOTs
      const columnKey = Math.round(cnot.position.x / this.gridSize) * this.gridSize;
      if (!cnotsByColumn[columnKey]) {
        cnotsByColumn[columnKey] = [];
      }
      cnotsByColumn[columnKey].push(cnot);
    });
    
    // Process each column of CNOTs
    Object.values(cnotsByColumn).forEach(columnCnots => {
      // Sort by y-position (qubit index)
      columnCnots.sort((a, b) => a.targets[0] - b.targets[0]);
      
      // Process pairs of CNOTs (control and target)
      for (let i = 0; i < columnCnots.length - 1; i += 2) {
        if (i + 1 < columnCnots.length) {
          const control = columnCnots[i];
          const target = columnCnots[i + 1];
          
          // Only create a CNOT if they're on different qubits
          if (control.targets[0] !== target.targets[0]) {
            // Create a proper CNOT gate
            const cnotGate: QuantumGate = {
              type: 'cnot',
              targets: [target.targets[0]],
              controls: [control.targets[0]],
              position: target.position // Use target position for the gate
            };
            
            gates.push(cnotGate);
            console.log(`Created CNOT gate: control=${control.targets[0]}, target=${target.targets[0]}`);
          } else {
            // If they're on the same qubit, add them as separate gates
            gates.push(control);
            gates.push(target);
          }
        } else {
          // Add the unpaired CNOT as a regular gate
          gates.push(columnCnots[i]);
        }
      }
      
      // Handle odd number of CNOTs in a column
      if (columnCnots.length % 2 !== 0) {
        gates.push(columnCnots[columnCnots.length - 1]);
      }
    });
  }

  /**
   * Validate if a circuit is well-formed
   */
  validateCircuit(circuit: QuantumCircuit): boolean {
    // Empty circuit is valid
    if (circuit.qubits === 0) {
      return true;
    }
    
    // Check if all gates have valid target qubits
    for (const gate of circuit.gates) {
      for (const target of gate.targets) {
        if (target < 0 || target >= circuit.qubits) {
          return false;
        }
      }

      // Check controls if they exist
      if (gate.controls) {
        for (const control of gate.controls) {
          if (control < 0 || control >= circuit.qubits) {
            return false;
          }
        }
      }
    }

    return true;
  }
} 