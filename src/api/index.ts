import { api } from "./client";
import type {
  User,
  Item,
  ItemFormData,
  Room,
  Category,
  Tag,
  Attachment,
  HealthResponse,
} from "../types";

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ ok: boolean; user: User }>("/auth/login", { username, password }),
  me: () => api.get<User>("/auth/me"),
  logout: () => api.post<{ ok: boolean }>("/auth/logout", {}),
};

// Health
export const healthApi = {
  get: () => api.get<HealthResponse>("/health"),
};

// Items
export interface ItemFilters {
  category?: string;
  room?: string;
  status?: string;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const itemsApi = {
  list: (filters: ItemFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
    });
    const qs = params.toString();
    return api.get<Item[]>(`/items${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => api.get<Item>(`/items/${id}`),
  create: (data: ItemFormData) => api.post<Item>("/items", data),
  update: (id: string, data: Partial<ItemFormData>) =>
    api.patch<Item>(`/items/${id}`, data),
  delete: (id: string) => api.delete(`/items/${id}`),
  qrUrl: (id: string) => `${(import.meta.env.VITE_API_BASE as string | undefined) ?? "/api"}/items/${id}/qr`,
};

// Rooms
export const roomsApi = {
  list: () => api.get<Room[]>("/rooms"),
  create: (data: { name: string; description?: string }) =>
    api.post<Room>("/rooms", data),
  createSpot: (roomId: string, data: { name: string; description?: string }) =>
    api.post<Room>(`/rooms/${roomId}/spots`, data),
};

// Categories
export const categoriesApi = {
  list: () => api.get<Category[]>("/categories"),
};

// Tags
export const tagsApi = {
  list: () => api.get<Tag[]>("/tags"),
};

// Attachments
export const attachmentsApi = {
  upload: (itemId: string, file: File, type?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (type) form.append("type", type);
    return api.upload<Attachment>(`/items/${itemId}/attachments`, form);
  },
  fileUrl: (id: string) =>
    `${(import.meta.env.VITE_API_BASE as string | undefined) ?? "/api"}/attachments/${id}/file`,
  setPrimary: (id: string) =>
    api.patch<Attachment>(`/attachments/${id}`, { isPrimaryPhoto: true }),
  delete: (id: string) => api.delete(`/attachments/${id}`),
};

// UPC
export const upcApi = {
  lookup: (code: string) =>
    api.get<{
      name: string | null;
      make: string | null;
      description: string | null;
      modelNumber: string | null;
    }>(`/upc/${encodeURIComponent(code)}`),
};
