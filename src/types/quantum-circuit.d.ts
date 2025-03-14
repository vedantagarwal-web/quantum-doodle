declare module 'quantum-circuit' {
  interface Complex {
    re: number;
    im: number;
  }

  interface Gate {
    name: string;
    time: number;
    targets: number[];
    controls?: number[];
    options?: any;
  }

  class QuantumCircuit {
    constructor(numQubits?: number);
    
    // Circuit manipulation
    addGate(gateName: string, column: number, wires: number | number[], options?: any): void;
    addMeasure(wire: number, creg: string, cbit: number): void;
    removeGate(column: number, wire: number): void;
    createTransform(gates: Gate[]): void;
    
    // Simulation methods
    run(initialValues?: any): void;
    measureAll(force?: boolean): any;
    probabilities(): number[];
    probability(state: number): number;
    getState(): Complex[];
    stateDensity(): Complex[][];
    
    // Utility methods
    print(): string;
    exportQASM(): string;
    load(obj: any): void;
    save(): any;
    
    // Properties
    gates: Gate[];
    numQubits: number;
    customGates: Record<string, any>;
  }

  export = QuantumCircuit;
} 