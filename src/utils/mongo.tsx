import axios from 'axios';

interface IPayload {
  start: string;
  end: string;
  companyId: string;
  type: number;
}

export async function getMongo(payload: IPayload): Promise<any> {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/data',
      payload
    );
    return Promise.resolve(response.data);
  } catch (e) {
    return Promise.reject(e);
  }
}
