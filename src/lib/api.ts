const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/crowdspark";

export interface RegisterRequest {
  username: string;
  name: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

// email field, not identifier
export interface LoginRequest {
  identifier : string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  name: string;
  email: string;
  phoneNumber?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  roles: string[];
  accountStatus: string;
  kycStatus: string;
  profileImageUrl?: string;
  profileImagePublicId?: string;
  bannerImageUrl?: string;
  bannerImagePublicId?: string;
  bio?: string;
  about?: string;
  gender?: string;
  dateOfBirth?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  profession?: string;
  organization?: string;
  interestedCategories?: string[];
  totalProjectsBacked: number;
  totalAmountBacked: number;
  totalProjectsCreated: number;
  totalFundsRaised: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UpdateProfileRequest {
  bio?: string;
  about?: string;
  gender?: string;
  dateOfBirth?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  profession?: string;
  organization?: string;
  interestedCategories?: string[];
}

export interface KycStatusResponse {
  userId: number;
  username: string;
  email: string;
  kycStatus: string;
  rejectionReason?: string;
  panNumber?: string;
  panCardImageUrl?: string;
  aadhaarNumber?: string;
  aadhaarFrontImageUrl?: string;
  aadhaarBackImageUrl?: string;
  bankName?: string;
  maskedBankAccount?: string;
  bankIfscCode?: string;
  upiId?: string;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface KycSubmitRequest {
  panNumber: string;
  panCardImageUrl: string;
  panCardImagePublicId: string;
  aadhaarNumber: string;
  aadhaarFrontImageUrl: string;
  aadhaarFrontPublicId: string;
  aadhaarBackImageUrl: string;
  aadhaarBackPublicId: string;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankName: string;
  bankBranchName?: string;
  upiId: string;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string>;
}

export type KycStatus =
  | "NOT_SUBMITTED"
  | "PENDING_SUBMISSION"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED";

export type UserProfile = UserResponse;

// handles JSON + plain text from Spring
async function parseResponse<T>(
  res: Response
): Promise<T> {
  if (res.status === 204) return {} as T;

  const ct = res.headers.get("content-type") ?? "";
  const text = await res.text();

  if (!text) return {} as T;

  if (ct.includes("application/json")) {
    return JSON.parse(text) as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

async function parseError(
  res: Response
): Promise<ApiError> {
  try {
    const text = await res.text();
    if (!text) {
      return {
        message: `Request failed (${res.status})`,
        status: res.status,
      };
    }
    try {
      const json = JSON.parse(text);
      return {
        message:
          json.message ||
          json.error ||
          "Something went wrong.",
        status: res.status,
        errors: json.errors,
      };
    } catch {
      return { message: text, status: res.status };
    }
  } catch {
    return {
      message: "Network error. Please try again.",
      status: res.status,
    };
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw {
      message: "Session expired. Please log in again.",
      status: 401,
    } as ApiError;
  }

  if (!res.ok) throw await parseError(res);
  return parseResponse<T>(res);
}

// for file uploads (no Content-Type header)
async function requestForm<T>(
  path: string,
  formData: FormData,
  method = "PUT"
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    body: formData,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw {
      message: "Session expired.",
      status: 401,
    } as ApiError;
  }

  if (!res.ok) throw await parseError(res);
  return parseResponse<T>(res);
}

export const authApi = {
  register: (
    data: RegisterRequest
  ): Promise<UserResponse> =>
    request<UserResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // backend sets HttpOnly cookies on success
  login: (data: LoginRequest): Promise<void> =>
    request<void>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: (): Promise<void> =>
    request<void>("/auth/logout", { method: "POST" }),

  // loads all user data into ProfileCtx
  me: (): Promise<UserResponse> =>
    request<UserResponse>("/auth/me"),

  sendVerificationEmail: (): Promise<string> =>
    request<string>(
      "/auth/send-verification-email",
      { method: "POST" }
    ),
};

export const profileApi = {
  update: (
    data: UpdateProfileRequest
  ): Promise<UserResponse> =>
    request<UserResponse>("/auth/me/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  uploadAvatar: (file: File): Promise<UserResponse> => {
    const fd = new FormData();
    fd.append("file", file);
    return requestForm<UserResponse>(
      "/auth/me/profile-image",
      fd
    );
  },

  uploadBanner: (file: File): Promise<UserResponse> => {
    const fd = new FormData();
    fd.append("file", file);
    return requestForm<UserResponse>(
      "/auth/me/banner-image",
      fd
    );
  },
};

export const creatorApi = {
  sendOtp: (): Promise<string> =>
    request<string>("/api/creator/send-otp", {
      method: "POST",
    }),

  verifyOtp: (otp: string): Promise<string> =>
    request<string>("/api/creator/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),

  uploadKycDoc: (
    file: File
  ): Promise<CloudinaryUploadResult> => {
    const fd = new FormData();
    fd.append("file", file);
    return requestForm<CloudinaryUploadResult>(
      "/api/creator/upload-kyc-doc",
      fd,
      "POST"
    );
  },

  submitKyc: (
    data: KycSubmitRequest
  ): Promise<KycStatusResponse> =>
    request<KycStatusResponse>(
      "/api/creator/submit-kyc",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  kycStatus: (): Promise<KycStatusResponse> =>
    request<KycStatusResponse>(
      "/api/creator/kyc-status"
    ),
};