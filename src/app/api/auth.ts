import type {LoginPayload} from '../actions';

interface LoginErrors {
  password?: string;
  detail?: string;
}

interface LoginApiResponse {
  detail?: string;
  errors?: LoginErrors;
  [key: string]: unknown;
}

export async function userLogin({
  username,
  password,
}: LoginPayload): Promise<LoginApiResponse> {
  const BASE_URL = 'http://10.0.2.2:8000';
  const options: RequestInit = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({username, password}),
  };

  const response = await fetch(BASE_URL + '/api/login', options);

  let data: LoginApiResponse | null;
  try {
    data = (await response.json()) as LoginApiResponse;
  } catch {
    data = null;
  }

  if (response.ok) {
    console.log('Login success response:', data);
    return data ?? {};
  } else {
    const message =
      (data && (data.errors?.password || data.errors?.detail || data.detail)) ||
      'Login failed';
    throw new Error(message);
  }
}
