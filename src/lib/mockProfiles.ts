export interface MockVendorProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  bio: string;
  company: string;
  facebook_url: string;
  instagram_url: string;
  facebook_shop_url: string;
}

export const mockProfiles: MockVendorProfile[] = [
  {
    id: "vendor-1",
    full_name: "Manuel Silva",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    phone: "+238 991 2345",
    bio: "Experienced property vendor based in Praia, Santiago. Specializing in residential real estate and local services across Cape Verde for over 8 years.",
    company: "Silva Properties CV",
    facebook_url: "https://facebook.com/groups/silvapropertiescv",
    instagram_url: "https://instagram.com/silvapropertiescv",
    facebook_shop_url: "https://facebook.com/marketplace/silvapropertiescv",
  },
  {
    id: "vendor-2",
    full_name: "Carla Mendes",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    phone: "+238 995 7890",
    bio: "Sal island specialist helping families find their perfect home. Also offering furniture, appliances, and relocation services.",
    company: "Mendes Island Living",
    facebook_url: "https://facebook.com/groups/mendesislandliving",
    instagram_url: "https://instagram.com/mendesislandliving",
    facebook_shop_url: "",
  },
];
