export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
}

export interface SparePart {
  id: string;
  imageUrl: string;
  partName: string;
  serialNumber: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Machine {
  id: string;
  imageUrl: string;
  machineName: string;
  serialNumber: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};
