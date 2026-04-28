export type Location = {
  name: string;
  region: string;
  lat: number;
  lng: number;
};

export const LOCATIONS = {
  "ho-chi-minh": { name: "Hồ Chí Minh", region: "VN-SG", lat: 10.8231, lng: 106.6297 },
  "ha-noi": { name: "Hà Nội", region: "VN-HN", lat: 21.0278, lng: 105.8342 },
  "da-nang": { name: "Đà Nẵng", region: "VN-DN", lat: 16.0544, lng: 108.2022 }
} satisfies Record<string, Location>;

export type LocationSlug = keyof typeof LOCATIONS;

