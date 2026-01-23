import axios from 'axios';
import type { Product } from '../types/desktopProductList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getProductList = async (keyword?: string): Promise<Product[]> => {
  let url = `${API_BASE_URL}/api/products`;
  let params = {};

  if (keyword) {
    url = `${API_BASE_URL}/api/products/search`;
    // handler에서 get('q') 했기 때문에
    params = { q: keyword }; 
  }

  const response = await axios.get<Product[]>(url, { params });
  return response.data;
};