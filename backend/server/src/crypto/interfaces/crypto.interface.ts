export interface Crypto {
  id: number;
  name: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  image: string;
  actualValue: number;
  lastValue: number;
}
