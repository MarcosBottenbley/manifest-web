export interface User {
  id: string;
  username: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  spots: Spot[];
}

export interface Spot {
  id: string;
  roomId: string;
  name: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export type Condition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
export type ItemStatus = "ACTIVE" | "SOLD" | "DONATED" | "DISPOSED" | "LOST";
export type AttachmentType = "PHOTO" | "RECEIPT" | "WARRANTY" | "MANUAL" | "OTHER";

export interface Attachment {
  id: string;
  itemId: string;
  type: AttachmentType;
  filename: string;
  fileSize: number;
  mimeType: string;
  isPrimaryPhoto: boolean;
  uploadedBy: string;
  createdAt: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  category: Category;
  make?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  room?: Room;
  spot?: Spot;
  dateAcquired?: string;
  purchasePrice?: number;
  vendor?: string;
  condition: Condition;
  status: ItemStatus;
  salePrice?: number;
  dateSold?: string;
  warrantyExpiry?: string;
  material?: string;
  notes?: string;
  tags: Tag[];
  attachments: Attachment[];
  creator: User;
  createdAt: string;
  updatedAt: string;
}

export interface ItemFormData {
  name: string;
  description?: string;
  categoryId: number;
  make?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  roomId?: string;
  spotId?: string;
  dateAcquired?: string;
  purchasePrice?: number;
  vendor?: string;
  condition: Condition;
  status: ItemStatus;
  salePrice?: number;
  dateSold?: string;
  warrantyExpiry?: string;
  material?: string;
  notes?: string;
  tagNames?: string[];
}

export interface HealthResponse {
  ok: boolean;
  upcLookupEnabled: boolean;
}
