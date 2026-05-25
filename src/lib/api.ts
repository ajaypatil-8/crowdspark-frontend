const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/crowdspark";


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
          const body = await rr.json();
          const d: LoginResponse = (body && "data" in body && "success" in body) ? body.data : body;
          tokenStorage.set(d.accessToken, d.refreshToken);
          return request<T>(path, options, true);
        }
      } catch { /* fall through */ }
    }
    tokenStorage.clear();
    // Throw only — let the caller (ProfileContext) handle the redirect so
    // React state is updated cleanly before navigation happens.
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
  const body = await res.json();
  // Unwrap ApiResponse<T> wrapper: { success, message, data, timestamp }
  return (body !== null && typeof body === "object" && "data" in body && "success" in body)
    ? body.data
    : body;
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

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {

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


  sendVerificationEmail: () =>
    request<void>("/auth/send-verification-email", { method: "POST" }),

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

  sendOtp: () =>
    request<string>("/api/creator/send-otp", { method: "POST" }),


  verifyOtp: (otp: string) =>
    request<string>("/api/creator/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),

  uploadKycDoc: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ secure_url: string; public_id: string }>(
      "/api/creator/upload-kyc-doc",
      { method: "POST", body: form }
    );
  },


  submitKyc: (data: KycSubmitRequest) =>
    request<KycStatusResponse>("/api/creator/submit-kyc", {
      method: "POST",
      body: JSON.stringify(data),
    }),


  getKycStatus: () =>
    request<KycStatusResponse>("/api/creator/kyc-status"),


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

// ─── Types for projects ───────────────────────────────────────────────────────

export interface CreatorProjectResponse {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  goalAmount: number;
  currentAmount: number;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  deadline: string | null;
}

export interface ProjectFeedResponse {
  id: number;
  title: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  previewVideoUrl: string | null;
  category: string;
  goalAmount: number;
  currentAmount: number;
  fundedPercentage: number;
  daysLeft: number;
  backersCount: number;
  creator: {
    id: number;
    username: string;
    profileImage: string | null;
    about: string | null;
    joinedAt: string;
    totalProjects: number;
    totalBackers: number;
  };
}

// ─── Campaign creation types ──────────────────────────────────────────────────

export type MediaType = "IMAGE" | "VIDEO";
export type MediaUsage = "THUMBNAIL" | "CARD_VIDEO" | "GALLERY_IMAGE" | "STORY_IMAGE";

export interface ProjectMediaRequest {
  mediaUrl: string;
  mediaType: MediaType;
  usage: MediaUsage;
  displayOrder: number;
}

export interface RewardTierRequest {
  title: string;
  description?: string;
  minimumAmount: number;
}

export interface CreateProjectRequest {
  title: string;
  shortDescription: string;
  fullDescription: string;
  goalAmount: number;
  deadline: string;
  location: string;
  categoryIds: number[];
  media: ProjectMediaRequest[];
  rewardTiers: RewardTierRequest[];
}

// ─── Project API ──────────────────────────────────────────────────────────────

export const projectApi = {
  // GET /api/projects/feed — public
  feed: () => request<ProjectFeedResponse[]>("/api/projects/feed"),

  // GET /api/projects/{id} — public
  getById: (id: number) => request<ProjectFeedResponse>(`/api/projects/${id}`),

  // GET /api/projects/creator/projects — ROLE_CREATOR
  myProjects: () => request<CreatorProjectResponse[]>("/api/projects/creator/projects"),

  // POST /api/projects/create — ROLE_CREATOR
  create: (body: CreateProjectRequest) =>
    request<{ id: number }>("/api/projects/create", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // POST /api/projects/upload-media — ROLE_CREATOR
  // Upload a single image/video before submitting CreateProjectRequest.
  // Returns { secure_url, public_id, resource_type }
  uploadMedia: (file: File): Promise<{ secure_url: string; public_id: string; resource_type: string }> => {
    const form = new FormData();
    form.append("file", file);
    return request<{ secure_url: string; public_id: string; resource_type: string }>(
      "/api/projects/upload-media",
      { method: "POST", body: form }
    );
  },
};
// ─── Notification types ───────────────────────────────────────────────────────

export interface NotificationResponse {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  referenceId: number | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

// ─── Notification API ─────────────────────────────────────────────────────────

export const notificationApi = {
  // GET /api/notifications?page=0&size=20
  getAll: (page = 0, size = 20) =>
    request<Page<NotificationResponse>>(
      `/api/notifications?page=${page}&size=${size}`
    ),

  // GET /api/notifications/unread-count
  unreadCount: () =>
    request<{ unreadCount: number }>("/api/notifications/unread-count"),

  // PUT /api/notifications/{id}/read
  markRead: (id: number) =>
    request<NotificationResponse>(`/api/notifications/${id}/read`, {
      method: "PUT",
    }),

  // PUT /api/notifications/read-all
  markAllRead: () =>
    request<number>("/api/notifications/read-all", { method: "PUT" }),
};

// ─── Explore types ────────────────────────────────────────────────────────────

export interface ExploreParams {
  categoryId?: number;
  keyword?: string;
  sort?: "NEWEST" | "MOST_FUNDED" | "TRENDING";
  page?: number;
  size?: number;
}

export interface RewardTierResponse {
  id: number;
  title: string;
  description: string | null;
  minimumAmount: number;
}

export interface ProjectFullDetailsResponse {
  id: number;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string | null;
  goalAmount: number;
  currentAmount: number;
  fundedPercentage: number;
  daysLeft: number;
  deadline: string;
  thumbnailUrl: string | null;
  previewVideos: string[];
  galleryImages: string[];
  storyImages: string[];
  rewards: RewardTierResponse[];
  creator: {
    id: number;
    username: string;
    profileImage: string | null;
    about: string | null;
  };
}

// ─── Extended Project API ─────────────────────────────────────────────────────

// Extend projectApi with explore + full details
export const exploreApi = {
  // GET /api/projects/explore?categoryId=&keyword=&sort=&page=&size=
  search: (params: ExploreParams = {}) => {
    const q = new URLSearchParams();
    if (params.categoryId !== undefined) q.set("categoryId", String(params.categoryId));
    if (params.keyword)                  q.set("keyword", params.keyword);
    if (params.sort)                     q.set("sort", params.sort);
    q.set("page", String(params.page ?? 0));
    q.set("size", String(params.size ?? 12));
    return request<Page<ProjectFeedResponse>>(`/api/projects/explore?${q.toString()}`);
  },

  // GET /api/projects/{id} — full details with rewards
  getFullDetails: (id: number) =>
    request<ProjectFullDetailsResponse>(`/api/projects/${id}`),

  // GET /api/projects/{id}/rewards
  getRewards: (projectId: number) =>
    request<RewardTierResponse[]>(`/api/projects/${projectId}/rewards`),
};

// ─── Category types ───────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
}

export const categoryApi = {
  getAll: () => request<Category[]>("/api/categories"),
};

// ─── Backer API ───────────────────────────────────────────────────────────────

export interface BackedProjectResponse {
  donationId?: number;
  projectId: number;
  projectTitle: string;
  thumbnailUrl: string | null;
  goalAmount: number;
  currentAmount: number;
  fundedPercentage: number;
  status: string;
  amountBacked: number;
  backedAt: string;
}

export interface BackerStatsResponse {
  totalBacked: number;
  totalAmountBacked: number;
  activeCampaigns: number;
}

export const backerApi = {
  backedProjects: () =>
    request<BackedProjectResponse[]>("/api/backer/backed-projects"),
  stats: () =>
    request<BackerStatsResponse>("/api/backer/stats"),
};

// ─── Contact Messages API ────────────────────────────────────────────────────

export type ContactMessageStatus = "NEW" | "READ" | "REPLIED";

export interface ContactMessageRequest {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export interface ContactMessageResponse {
  id: number;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  readAt: string | null;
  repliedAt: string | null;
  replySubject: string | null;
  replyMessage: string | null;
  repliedByName: string | null;
}

export const contactApi = {
  submit: (data: ContactMessageRequest) =>
    request<ContactMessageResponse>("/api/contact/messages", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
// ─── Email Verification API ───────────────────────────────────────────────────

export const emailVerifyApi = {
  // POST /auth/send-verification-email  (requires auth)
  send: () =>
    request<void>("/auth/send-verification-email", { method: "POST" }),

  // GET /auth/verify-email?token=xxx&email=yyy  (public — called from email link)
  verify: (token: string, email: string) =>
    request<void>(
      `/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
    ),
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export interface AdminProjectResponse {
  id: number;
  title: string;
  creatorUsername: string;
  creatorEmail: string;
  thumbnailUrl: string | null;
  goalAmount: number;
  deadline: string | null;
  createdAt: string;
  status: string;
}

export const adminApi = {
  // Projects
  pendingProjects: () =>
    request<AdminProjectResponse[]>("/admin/projects/pending"),

  allProjects: () =>
    request<AdminProjectResponse[]>("/admin/projects/all"),

  getProjectDetail: (id: number) =>
    request<ProjectFullDetailsResponse>(`/admin/projects/${id}`),

  approveProject: (id: number) =>
    request<void>(`/admin/projects/${id}/approve`, { method: "PUT" }),

  rejectProject: (id: number, reason: string) =>
    request<void>(`/admin/projects/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),

  // KYC
  pendingKyc: () =>
    request<KycStatusResponse[]>("/admin/kyc/pending"),

  getUserKyc: (userId: number) =>
    request<KycStatusResponse>(`/admin/kyc/${userId}`),

  approveKyc: (userId: number) =>
    request<KycStatusResponse>(`/admin/kyc/${userId}/approve`, { method: "PUT" }),

  rejectKyc: (userId: number, rejectionReason: string) =>
    request<KycStatusResponse>(`/admin/kyc/${userId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ rejectionReason }),
    }),

  // Users
  allUsers: () =>
    request<UserResponse[]>("/admin/users"),

  suspendUser: (id: number) =>
    request<void>(`/admin/users/${id}/suspend`, { method: "PUT" }),

  activateUser: (id: number) =>
    request<void>(`/admin/users/${id}/activate`, { method: "PUT" }),

  // Contact messages
  contactMessages: () =>
    request<ContactMessageResponse[]>("/admin/contact-messages"),

  markContactMessageRead: (id: number) =>
    request<ContactMessageResponse>(`/admin/contact-messages/${id}/read`, {
      method: "PUT",
    }),

  replyContactMessage: (id: number, subject: string, message: string) =>
    request<ContactMessageResponse>(`/admin/contact-messages/${id}/reply`, {
      method: "PUT",
      body: JSON.stringify({ subject, message }),
    }),
};


// src/lib/api.ts
// PASTE THESE ADDITIONS at the bottom of your existing api.ts file

// ─── Payment types ────────────────────────────────────────────────────────────

export interface PaymentOrderRequest {
  projectId: number;
  amount: number;
  rewardTierId?: number | null;
  message?: string | null;
}

export interface PaymentOrderResponse {
  razorpayOrderId: string;  // Razorpay order id → pass to checkout as `order_id`
  amountInPaise: number;    // amount in paise  → pass to checkout as `amount`
  currency: string;         // "INR"
  razorpayKeyId: string;    // your key id      → pass to checkout as `key`
  donationId: number;       // our internal donation id (PENDING)
  projectTitle: string;     // for checkout description
}

export interface PaymentVerifyRequest {
  donationId: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

// ─── Payment API ──────────────────────────────────────────────────────────────

export const paymentApi = {
  /**
   * Step 1: Create a Razorpay order + PENDING donation.
   * Call this when the user clicks "Back this project".
   */
  createOrder: (data: PaymentOrderRequest) =>
    request<PaymentOrderResponse>("/api/payment/create-order", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Step 2: Verify payment after Razorpay checkout completes.
   * Call this inside the Razorpay handler() callback.
   */
  verify: (data: PaymentVerifyRequest) =>
    request<DonationResponse>("/api/payment/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── DonationResponse type (add if not already in your api.ts) ───────────────

export interface DonationResponse {
  id: number;
  projectId: number;
  projectTitle: string;
  projectThumbnailUrl: string | null;
  backerId: number;
  backerUsername: string;
  amount: number;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  transactionId: string | null;
  message: string | null;
  rewardTierId: number | null;
  rewardTierTitle: string | null;
  createdAt: string;
  paidAt: string | null;
}
