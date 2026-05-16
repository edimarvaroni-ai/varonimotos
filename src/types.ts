export enum ListingStatus {
  ACTIVE = "active",
  SOLD = "sold",
  DELETED = "deleted"
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: "user" | "admin";
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: any;
}

export interface Listing {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: "Nova" | "Seminova" | "Usada";
  kilometers: number;
  description: string;
  images: string[];
  color: string;
  category: string;
  specs: string;
  status: ListingStatus;
  isPremium: boolean;
  location: {
    lat: number;
    lng: number;
    city: string;
    state: string;
  };
  createdAt: any;
  updatedAt: any;
}

export interface Chat {
  id: string;
  listingId: string;
  participants: string[];
  lastMessage: string;
  updatedAt: any;
  listing?: Listing; // Populated client-side
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: any;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: any;
  updatedAt: any;
  authorId: string;
}
