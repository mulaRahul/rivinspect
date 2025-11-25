import type { StateMachineInputType } from '@rive-app/react-webgl2';
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface StateMachineInputContents {
  name: string;
  type: StateMachineInputType;
  initialValue?: boolean | number;
}

interface StateMachineContents {
  name: string;
  inputs: StateMachineInputContents[];
}

export interface ArtboardContents {
  name: string;
  animations: string[];
  stateMachines: StateMachineContents[]; 
}

export interface RiveContents {
  artboards: ArtboardContents[];
  viewModels: string[];
}