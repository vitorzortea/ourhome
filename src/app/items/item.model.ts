export interface Item {
  id?: string;
  title: string;
  done: boolean;
  userId: string;   // para regras de segurança por dono
  createdAt: number;
  updatedAt: number;
}
