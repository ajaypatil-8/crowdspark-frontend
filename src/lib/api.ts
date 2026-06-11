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
  return (body !== null && typeof body === "object" && "data" in body && "success" in body)
    ? body.data
    : body;
}

export type Role = "ADMIN" | "BACKER" | "CREATOR";
export type KycStatus =
  | "NOT_SUBMITTED"
  | "PENDING_SUBMISSION"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";

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
  kycStatus: KycStatus;
  createdAt: string;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  bio: string | null;
  about: string | null;
  gender: Gender | null;
  dateOfBirth: string | null;
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

  login: async (identifier: string, password: string): Promise<LoginResponse> => {
    const data = await request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    tokenStorage.set(data.accessToken, data.refreshToken);
    return data;
  },

  logout: async () => {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      tokenStorage.clear();
    }
  },

  me: () => request<UserResponse>("/auth/me"),

  updateProfile: (data: UpdateProfileRequest) =>
    request<UserResponse>("/auth/me/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  uploadProfileImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<UserResponse>("/auth/me/profile-image", {
      method: "PUT",
      body: form,
    });
  },

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

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const data = await request<LoginResponse>(
      `/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
      { method: "POST" }
    );
    tokenStorage.set(data.accessToken, data.refreshToken);
    return data;
  },
};

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

export const projectApi = {
  feed: () => request<ProjectFeedResponse[]>("/api/projects/feed"),

  getById: (id: number) => request<ProjectFeedResponse>(`/api/projects/${id}`),

  myProjects: () => request<CreatorProjectResponse[]>("/api/projects/creator/projects"),

  create: (body: CreateProjectRequest) =>
    request<{ id: number }>("/api/projects/create", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  uploadMedia: (file: File): Promise<{ secure_url: string; public_id: string; resource_type: string }> => {
    const form = new FormData();
    form.append("file", file);
    return request<{ secure_url: string; public_id: string; resource_type: string }>(
      "/api/projects/upload-media",
      { method: "POST", body: form }
    );
  },
};

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

export const notificationApi = {
  getAll: (page = 0, size = 20) =>
    request<Page<NotificationResponse>>(
      `/api/notifications?page=${page}&size=${size}`
    ),

  unreadCount: () =>
    request<{ unreadCount: number }>("/api/notifications/unread-count"),

  markRead: (id: number) =>
    request<NotificationResponse>(`/api/notifications/${id}/read`, {
      method: "PUT",
    }),

  markAllRead: () =>
    request<number>("/api/notifications/read-all", { method: "PUT" }),
};

export interface ExploreParams {
  keyword?:    string;
  categoryId?: number;
  sort?:       "NEWEST" | "MOST_FUNDED" | "TRENDING" | "ENDING_SOON";
  minGoal?:    number;
  maxGoal?:    number;
  page?:       number;
  size?:       number;
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

export const exploreApi = {
  search: (params: ExploreParams = {}) => {
    const q = new URLSearchParams();
    if (params.categoryId !== undefined) q.set("categoryId", String(params.categoryId));
    if (params.keyword)                  q.set("keyword", params.keyword);
    if (params.sort)                     q.set("sort", params.sort);
    q.set("page", String(params.page ?? 0));
    q.set("size", String(params.size ?? 12));
    return request<Page<ProjectFeedResponse>>(`/api/projects/explore?${q.toString()}`);
  },

  getFullDetails: (id: number) =>
    request<ProjectFullDetailsResponse>(`/api/projects/${id}`),

  getRewards: (projectId: number) =>
    request<RewardTierResponse[]>(`/api/projects/${projectId}/rewards`),
};

export interface Category {
  id: number;
  name: string;
}

export const categoryApi = {
  getAll: () => request<Category[]>("/api/categories"),
};

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

export const emailVerifyApi = {
  send: () =>
    request<void>("/auth/send-verification-email", { method: "POST" }),

  verify: (token: string, email: string) =>
    request<void>(
      `/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
    ),
};

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

  allUsers: () =>
    request<UserResponse[]>("/admin/users"),

  suspendUser: (id: number) =>
    request<void>(`/admin/users/${id}/suspend`, { method: "PUT" }),

  activateUser: (id: number) =>
    request<void>(`/admin/users/${id}/activate`, { method: "PUT" }),

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

export interface PaymentOrderRequest {
  projectId: number;
  amount: number;
  rewardTierId?: number | null;
  message?: string | null;
}

export interface PaymentOrderResponse {
  razorpayOrderId: string;
  amountInPaise: number;
  currency: string;
  razorpayKeyId: string;
  donationId: number;
  projectTitle: string;
}

export interface PaymentVerifyRequest {
  donationId: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export const paymentApi = {
  createOrder: (data: PaymentOrderRequest) =>
    request<PaymentOrderResponse>("/api/payment/create-order", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verify: (data: PaymentVerifyRequest) =>
    request<DonationResponse>("/api/payment/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

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

export interface CampaignUpdateResponse {
  id: number;
  projectId: number;
  projectTitle: string;
  authorId: number;
  authorUsername: string;
  authorProfileImage: string | null;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CampaignUpdateRequest {
  title: string;
  content: string;
  imageUrl?: string | null;
}

export const campaignUpdateApi = {
  getUpdates: (projectId: number) =>
    request<CampaignUpdateResponse[]>(`/api/projects/${projectId}/updates`),

  createUpdate: (projectId: number, data: CampaignUpdateRequest) =>
    request<CampaignUpdateResponse>(`/api/projects/${projectId}/updates`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  editUpdate: (projectId: number, updateId: number, data: CampaignUpdateRequest) =>
    request<CampaignUpdateResponse>(`/api/projects/${projectId}/updates/${updateId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteUpdate: (projectId: number, updateId: number) =>
    request<void>(`/api/projects/${projectId}/updates/${updateId}`, {
      method: "DELETE",
    }),
};

export interface PayoutResponse {
  id: number;
  projectId: number;
  projectTitle: string;
  creatorId: number;
  creatorUsername: string;
  creatorUpiId: string | null;
  grossAmount: number;
  platformFeePercent: number;
  platformFeeAmount: number;
  netAmount: number;
  status: "INITIATED" | "PROCESSING" | "COMPLETED" | "FAILED";
  payoutMode: string;
  razorpayPayoutId: string | null;
  failureReason: string | null;
  initiatedByUsername: string | null;
  initiatedAt: string;
  completedAt: string | null;
}

export const payoutApi = {
  initiate: (projectId: number) =>
    request<PayoutResponse>(`/admin/projects/${projectId}/payout`, {
      method: "POST",
    }),

  getAll: () =>
    request<PayoutResponse[]>("/admin/payouts"),

  getByProject: (projectId: number) =>
    request<PayoutResponse>(`/admin/projects/${projectId}/payout`),
};

export interface RefundResponse {
  id: number;
  donationId: number;
  projectId: number;
  projectTitle: string;
  backerId: number;
  backerUsername: string;
  amount: number;
  status: "INITIATED" | "COMPLETED" | "FAILED";
  razorpayRefundId: string | null;
  failureReason: string | null;
  initiatedAt: string;
  completedAt: string | null;
}

export const refundApi = {
  getByProject: (projectId: number) =>
    request<RefundResponse[]>(`/admin/projects/${projectId}/refunds`),

  retry: (projectId: number) =>
    request<void>(`/admin/projects/${projectId}/refunds/retry`, {
      method: "POST",
    }),

  getMyRefunds: () =>
    request<RefundResponse[]>("/api/backer/refunds"),
};

export interface ProjectCommentResponse {
  id: number;
  projectId: number;
  authorId: number;
  authorUsername: string;
  authorProfileImage: string | null;
  authorIsCreator: boolean;
  parentCommentId: number | null;
  content: string;
  deleted: boolean;
  replies: ProjectCommentResponse[];
  replyCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ProjectCommentRequest {
  content: string;
  parentCommentId?: number | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export const commentApi = {
  getComments: (projectId: number, page = 0, size = 20) =>
    request<PageResponse<ProjectCommentResponse>>(
      `/api/projects/${projectId}/comments?page=${page}&size=${size}`
    ),

  postComment: (projectId: number, data: ProjectCommentRequest) =>
    request<ProjectCommentResponse>(`/api/projects/${projectId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteComment: (projectId: number, commentId: number) =>
    request<void>(`/api/projects/${projectId}/comments/${commentId}`, {
      method: "DELETE",
    }),
};

export const savedApi = {
  getSaved: () =>
    request<ProjectFeedResponse[]>("/api/users/saved"),

  checkSaved: (projectId: number) =>
    request<{ saved: boolean }>(`/api/users/saved/${projectId}/check`),

  save: (projectId: number) =>
    request<void>(`/api/users/saved/${projectId}`, { method: "POST" }),

  unsave: (projectId: number) =>
    request<void>(`/api/users/saved/${projectId}`, { method: "DELETE" }),

  toggle: (projectId: number) =>
    request<{ saved: boolean }>(`/api/users/saved/${projectId}/toggle`, {
      method: "PUT",
    }),
};

export const gdprApi = {
  deleteAccount: (password: string, reason?: string) =>
    request<void>("/auth/me", {
      method: "DELETE",
      body: JSON.stringify({ password, reason }),
    }),

  exportData: () =>
    request<object>("/auth/me/data-export"),
};

export interface DailyDataPoint {
  date:  string;
  value: number;
}

export interface ProjectAnalyticsResponse {
  projectId:           number;
  projectTitle:        string;
  status:              string;
  goalAmount:          number;
  currentAmount:       number;
  remainingAmount:     number;
  fundedPercentage:    number;
  backersCount:        number;
  avgDonationAmount:   number;
  conversionRate:      number;
  totalViews:          number;
  totalUniqueVisitors: number;
  viewsLast7Days:      number;
  viewsLast30Days:     number;
  updatesCount:        number;
  commentsCount:       number;
  savedCount:          number;
  dailyViews:          DailyDataPoint[];
  dailyFunding:        DailyDataPoint[];
}

export const analyticsApi = {
  trackView: (projectId: number) =>
    fetch(`${BASE_URL}/api/projects/${projectId}/view`, { method: "POST" })
      .catch(() => {}),

  getAnalytics: (projectId: number) =>
    request<ProjectAnalyticsResponse>(`/api/projects/${projectId}/analytics`),
};

// ─── Follow types ─────────────────────────────────────────────────────────────

export interface FollowStatusResponse {
  targetUserId:  number;
  following:     boolean;
  followerCount: number;
}

export interface FollowResponse {
  userId:         number;
  username:       string;
  name:           string;
  profileImageUrl: string | null;
  bio:            string | null;
  isCreator:      boolean;
  followerCount:  number;
  totalProjects:  number;
  followedAt:     string;
}

// ─── Follow API ───────────────────────────────────────────────────────────────

export const followApi = {
  /** Toggle follow/unfollow. Returns new state. */
  toggle: (targetUserId: number) =>
    request<FollowStatusResponse>(`/api/users/${targetUserId}/follow`, {
      method: "PUT",
    }),

  /** Check if you follow a user */
  checkStatus: (targetUserId: number) =>
    request<FollowStatusResponse>(`/api/users/${targetUserId}/follow/status`),

  /** Get who a user follows */
  getFollowing: (userId: number, page = 0, size = 20) =>
    request<PageResponse<FollowResponse>>(
      `/api/users/${userId}/following?page=${page}&size=${size}`),

  /** Get a user's followers */
  getFollowers: (userId: number, page = 0, size = 20) =>
    request<PageResponse<FollowResponse>>(
      `/api/users/${userId}/followers?page=${page}&size=${size}`),

  /** Feed of projects from creators you follow */
  getFollowedFeed: () =>
    request<ProjectFeedResponse[]>("/api/feed/followed"),
};

// ─── Review types ─────────────────────────────────────────────────────────────

export interface ProjectReviewResponse {
  id:                     number;
  projectId:              number;
  reviewerId:             number;
  reviewerName:           string;
  reviewerUsername:       string;
  reviewerProfileImageUrl: string | null;
  rating:                 number;            // 1–5
  title:                  string | null;
  content:                string | null;
  createdAt:              string;
  updatedAt:              string | null;
  myReview:               boolean;
}

export interface ReviewSummaryResponse {
  projectId:         number;
  totalReviews:      number;
  averageRating:     number | null;
  ratingDistribution: Record<number, number>; // { 1: N, 2: N, … 5: N }
  myReview:          ProjectReviewResponse | null;
  canReview:         boolean;
}

export interface ProjectReviewRequest {
  rating:   number;
  title?:   string;
  content?: string;
}

// ─── Review API ───────────────────────────────────────────────────────────────

export const reviewApi = {
  /** Average + distribution + current user's review */
  getSummary: (projectId: number) =>
    request<ReviewSummaryResponse>(`/api/projects/${projectId}/reviews/summary`),

  /** Paginated list, newest first */
  getReviews: (projectId: number, page = 0, size = 10) =>
    request<PageResponse<ProjectReviewResponse>>(
      `/api/projects/${projectId}/reviews?page=${page}&size=${size}`
    ),

  /** Submit new review — backer only */
  submitReview: (projectId: number, data: ProjectReviewRequest) =>
    request<ProjectReviewResponse>(`/api/projects/${projectId}/reviews`, {
      method: "POST",
      body:   JSON.stringify(data),
    }),

  /** Update own review */
  updateReview: (projectId: number, reviewId: number, data: ProjectReviewRequest) =>
    request<ProjectReviewResponse>(`/api/projects/${projectId}/reviews/${reviewId}`, {
      method: "PUT",
      body:   JSON.stringify(data),
    }),

  /** Delete own review */
  deleteReview: (projectId: number, reviewId: number) =>
    request<void>(`/api/projects/${projectId}/reviews/${reviewId}`, {
      method: "DELETE",
    }),
};

// ─── Milestone types ──────────────────────────────────────────────────────────

export interface MilestoneResponse {
  id:            number;
  projectId:     number;
  title:         string;
  description:   string | null;
  targetAmount:  number | null;
  sortOrder:     number;
  status:        "PENDING" | "COMPLETED";
  completedAt:   string | null;
  createdAt:     string;
  updatedAt:     string | null;
}

export interface MilestoneRequest {
  title:        string;
  description?: string;
  targetAmount?: number;
  sortOrder?:   number;
}

// ─── Milestone API ────────────────────────────────────────────────────────────

export const milestoneApi = {
  /** Public — get all milestones ordered by sort_order */
  getAll: (projectId: number) =>
    request<MilestoneResponse[]>(`/api/projects/${projectId}/milestones`),

  /** Creator — create a new milestone */
  create: (projectId: number, data: MilestoneRequest) =>
    request<MilestoneResponse>(`/api/projects/${projectId}/milestones`, {
      method: "POST",
      body:   JSON.stringify(data),
    }),

  /** Creator — update existing milestone */
  update: (projectId: number, milestoneId: number, data: MilestoneRequest) =>
    request<MilestoneResponse>(`/api/projects/${projectId}/milestones/${milestoneId}`, {
      method: "PUT",
      body:   JSON.stringify(data),
    }),

  /** Creator — delete a milestone */
  delete: (projectId: number, milestoneId: number) =>
    request<void>(`/api/projects/${projectId}/milestones/${milestoneId}`, {
      method: "DELETE",
    }),

  /** Creator — mark milestone complete, triggers backer notifications */
  complete: (projectId: number, milestoneId: number) =>
    request<MilestoneResponse>(`/api/projects/${projectId}/milestones/${milestoneId}/complete`, {
      method: "POST",
    }),

  /** Creator — revert milestone back to PENDING */
  reopen: (projectId: number, milestoneId: number) =>
    request<MilestoneResponse>(`/api/projects/${projectId}/milestones/${milestoneId}/reopen`, {
      method: "POST",
    }),
};
