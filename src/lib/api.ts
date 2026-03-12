// ─────────────────────────────────────────────────────────────────────────────
// lib/api.ts  —  based on actual backend code (read every line)
//
// KEY FINDING: JwtAuthenticationFilter reads Authorization header ONLY.
//   String authHeader = request.getHeader("Authorization");
//   if (authHeader == null || !authHeader.startsWith("Bearer ")) → passes through
//
// Solution: store token in localStorage, send as "Authorization: Bearer <token>"
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/crowdspark";

// ─── Token storage ────────────────────────────────────────────────────────────

export const tokenStorage = {
  getAccess: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("cs_access");
  },
  getRefresh: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("cs_refresh");
  },
  set: (accessToken: string, refreshToken: string) => {
    localStorage.setItem("cs_access", accessToken);
    localStorage.setItem("cs_refresh", refreshToken);
  },
  clear: () => {
    localStorage.removeItem("cs_access");
    localStorage.removeItem("cs_refresh");
  },
};

// ─── Core fetch ───────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const token = tokenStorage.getAccess();
  const headers: Record<string, string> = {};

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...(options.headers as Record<string, string>), ...headers },
  });

  // Auto-refresh on 401
  if (res.status === 401 && !isRetry) {
    const rt = tokenStorage.getRefresh();
    if (rt) {
      try {
        const rr = await fetch(
          `${BASE_URL}/auth/refresh?refreshToken=${encodeURIComponent(rt)}`,
          { method: "POST" }
        );
        if (rr.ok) {
          const d: LoginResponse = await rr.json();
          tokenStorage.set(d.accessToken, d.refreshToken);
          return request<T>(path, options, true);
        }
      } catch { /* fall through */ }
    }
    tokenStorage.clear();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const msg =
      err.message ||
      (err.details ? Object.values(err.details).join(", ") : "Request failed");
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Types (exact match to backend DTOs) ─────────────────────────────────────

export type Role = "ADMIN" | "BACKER" | "CREATOR";
export type KycStatus =
  | "NOT_SUBMITTED"
  | "PENDING_SUBMISSION"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

export interface UserResponse {
  id: number;
  name: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  roles: Role[];
  accountStatus: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycVerified: boolean;
  kycStatus: KycStatus;   // from User entity via ModelMapper
  createdAt: string;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  bio: string | null;
  about: string | null;
  gender: Gender | null;
  dateOfBirth: string | null; // "YYYY-MM-DD"
  websiteUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  profession: string | null;
  organization: string | null;
  interestedCategories: string[];
  upiId: string | null;
  bankName: string | null;
  maskedBankAccount: string | null;
  bankIfscCode: string | null;
  totalProjectsBacked: number;
  totalAmountBacked: number;
  totalProjectsCreated: number;
  totalFundsRaised: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface KycStatusResponse {
  userId: number;
  username: string;
  email: string;
  kycStatus: KycStatus;
  rejectionReason: string | null;
  panNumber: string | null;
  panCardImageUrl: string | null;
  aadhaarNumber: string | null;
  aadhaarFrontImageUrl: string | null;
  aadhaarBackImageUrl: string | null;
  bankName: string | null;
  maskedBankAccount: string | null;
  bankIfscCode: string | null;
  upiId: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export interface UpdateProfileRequest {
  bio?: string;
  about?: string;
  gender?: Gender;
  dateOfBirth?: string; // "YYYY-MM-DD"
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

export interface KycSubmitRequest {
  panNumber: string;           // regex: [A-Z]{5}[0-9]{4}[A-Z]{1}
  panCardImageUrl: string;
  panCardImagePublicId: string;
  aadhaarNumber: string;       // format: "XXXX-XXXX-XXXX"
  aadhaarFrontImageUrl: string;
  aadhaarFrontPublicId: string;
  aadhaarBackImageUrl: string;
  aadhaarBackPublicId: string;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankIfscCode: string;        // regex: ^[A-Z]{4}0[A-Z0-9]{6}$
  bankName: string;
  bankBranchName?: string;
  upiId: string;               // regex: ^[\w.\-_]+@[a-zA-Z]+$
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  // POST /auth/register
  // { username, name, email, phoneNumber?, password }
  // phoneNumber: Indian format (+91XXXXXXXXXX or 10 digits starting 6-9)
  register: (data: {
    username: string;
    name: string;
    email: string;
    phoneNumber?: string;
    password: string;
  }) =>
    request<UserResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // POST /auth/login
  // identifier = username OR email OR phone (backend tries all three)
  // Stores tokens in localStorage automatically
  login: async (identifier: string, password: string): Promise<LoginResponse> => {
    const data = await request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    tokenStorage.set(data.accessToken, data.refreshToken);
    return data;
  },

  // POST /auth/logout — clears localStorage
  logout: async () => {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      tokenStorage.clear();
    }
  },

  // GET /auth/me — returns full UserResponse
  me: () => request<UserResponse>("/auth/me"),

  // PUT /auth/me/profile
  updateProfile: (data: UpdateProfileRequest) =>
    request<UserResponse>("/auth/me/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // PUT /auth/me/profile-image — multipart, field name: "file"
  uploadProfileImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<UserResponse>("/auth/me/profile-image", {
      method: "PUT",
      body: form,
    });
  },

  // PUT /auth/me/banner-image — multipart, field name: "file"
  uploadBannerImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<UserResponse>("/auth/me/banner-image", {
      method: "PUT",
      body: form,
    });
  },

  // POST /auth/send-verification-email
  // ⚠️ NOT YET IMPLEMENTED in backend — add to AuthController when ready
  sendVerificationEmail: async (): Promise<void> => {
    try {
      await request<void>("/auth/send-verification-email", { method: "POST" });
    } catch (err: any) {
      // If endpoint doesn't exist yet, throw a user-friendly message
      if (err.message?.includes("404") || err.message?.includes("not found")) {
        throw new Error("Email verification is not yet available. Coming soon!");
      }
      throw err;
    }
  },

  // POST /auth/refresh?refreshToken=xxx — query param NOT body
  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const data = await request<LoginResponse>(
      `/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
      { method: "POST" }
    );
    tokenStorage.set(data.accessToken, data.refreshToken);
    return data;
  },
};

// ─── Creator / KYC API ────────────────────────────────────────────────────────

export const creatorApi = {
  // POST /api/creator/send-otp
  // Needs: authenticated (any logged-in user)
  // Sends OTP email to user's registered email
  sendOtp: () =>
    request<string>("/api/creator/send-otp", { method: "POST" }),

  // POST /api/creator/verify-otp
  // Needs: authenticated (any logged-in user)
  // Body: { otp: "123456" }
  // Effect: Backend adds CREATOR role to user + sets kycStatus=PENDING_SUBMISSION
  // ⚠️ IMPORTANT: Call authApi.refresh() AFTER this to get new JWT with CREATOR role
  verifyOtp: (otp: string) =>
    request<string>("/api/creator/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),

  // POST /api/creator/upload-kyc-doc
  // Needs: ROLE_CREATOR (only after verify-otp + token refresh)
  // Multipart field: "file"
  // Returns: { secure_url, public_id } — save both for submit-kyc
  // Call this 3 times: PAN card, Aadhaar front, Aadhaar back
  uploadKycDoc: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ secure_url: string; public_id: string }>(
      "/api/creator/upload-kyc-doc",
      { method: "POST", body: form }
    );
  },

  // POST /api/creator/submit-kyc
  // Needs: ROLE_CREATOR
  // Requires all KYC fields including doc URLs from uploadKycDoc
  submitKyc: (data: KycSubmitRequest) =>
    request<KycStatusResponse>("/api/creator/submit-kyc", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // GET /api/creator/kyc-status
  // Needs: ROLE_CREATOR
  getKycStatus: () =>
    request<KycStatusResponse>("/api/creator/kyc-status"),

  // Alias — settings page calls creatorApi.kycStatus()
  kycStatus: () =>
    request<KycStatusResponse>("/api/creator/kyc-status"),
};



export const isLoggedIn = () => !!tokenStorage.getAccess();
export const hasRole = (user: UserResponse | null, role: Role) =>
  !!user?.roles?.includes(role);
export const isCreator = (user: UserResponse | null) => hasRole(user, "CREATOR");
export const isAdmin = (user: UserResponse | null) => hasRole(user, "ADMIN");



export const profileApi = {
  update: (data: UpdateProfileRequest) => authApi.updateProfile(data),
  uploadAvatar: (file: File) => authApi.uploadProfileImage(file),
  uploadBanner: (file: File) => authApi.uploadBannerImage(file),
};