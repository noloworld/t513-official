"use client";

import { createContext, useContext, ReactNode, useState } from 'react';

interface TaskContextType {
  level: number;
  experience: number;
  participations: number;
  badges: string[];
  dailyTaskAvailable: boolean;
  points: number;
}

const initialState: TaskContextType = {
  level: 1,
  experience: 0,
  participations: 0,
  badges: [],
  dailyTaskAvailable: true,
  points: 0,
};

const TaskContext = createContext<TaskContextType>(initialState);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state] = useState(initialState);

  return (
    <TaskContext.Provider value={state}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
} 