import axios from 'axios';
import type { Product } from '../types/product';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getProductList = async (): Promise<Product[]> => {
  const response = await axios.get<Product[]>(`${API_BASE_URL}/products`);
  return response.data;
};