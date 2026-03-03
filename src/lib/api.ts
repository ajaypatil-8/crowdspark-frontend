const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/crowdspark";



export interface RegisterRequest {
  username: string;      
  name: string;
  email: string;         
  phoneNumber?: string;  
  password: string;      
}

export interface LoginRequest {
  identifier: string;    
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  username: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  bio?: string;
  role?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string>; 
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errorData: ApiError;
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: "Something went wrong. Please try again.", status: res.status };
    }
    throw errorData;
  }


  if (res.status === 204) return {} as T;
  return res.json();
}

const TOKEN_KEY = "cs_access_token";

export const tokenStore = {
  set: (token: string) => {
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
  },
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  clear: () => {
    if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
  },
};



export const authApi = {

  register: (data: RegisterRequest): Promise<UserResponse> =>
    request<UserResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

 
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    tokenStore.set(res.accessToken);
    return res;
  },


  logout: async (): Promise<void> => {
    await request<void>("/auth/logout", { method: "POST" });
    tokenStore.clear();
  },


  me: (): Promise<UserResponse> => request<UserResponse>("/auth/me"),


  refresh: (refreshToken: string): Promise<LoginResponse> =>
    request<LoginResponse>(`/auth/refresh?refreshToken=${refreshToken}`, {
      method: "POST",
    }),
};