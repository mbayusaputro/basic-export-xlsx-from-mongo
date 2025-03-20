/* eslint-disable  @typescript-eslint/no-explicit-any */
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL ?? '';

interface IPayload {
  start: string;
  end: string;
  companyId: string;
  type: number;
  keydb: string;
}

export async function getData(payload: IPayload): Promise<any> {
  try {
    const response = await axios.post(
      apiUrl + '/api/data',
      payload,
    );
    return Promise.resolve(response.data);
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function getCompanies(): Promise<any> {
  try {
    const response = await axios.get(
      apiUrl + '/api/companies'
    );
    return Promise.resolve(response.data);
  } catch (e) {
    return Promise.reject(e);
  }
}
