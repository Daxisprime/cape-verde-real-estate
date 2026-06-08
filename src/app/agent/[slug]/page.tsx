import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AgentProfileContent from './AgentProfileContent';

// Mock agent data - in production, fetch from Supabase
const getAgentBySlug = async (slug: string) => {
  // Simulate database lookup
  const agents = [
    {
      id: 'agent-1',
      slug: 'maria-santos',
      full_name: 'Maria Santos',
      email: 'maria.santos@atlanticre.cv',
      phone: '+238 260 1234',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      bio: 'With over 8 years of experience in Cape Verde real estate, I specialize in luxury waterfront properties and international client services. My deep knowledge of Santiago Island and fluency in multiple languages allows me to provide exceptional service to clients from around the world.',
      roles: ['agent'],
      is_verified: true,
      is_active: true,
      license_number: 'CV-RE-2024-001',
      company: 'Atlantic Real Estate',
      years_experience: 8,
      specialties: ['Luxury Properties', 'Investment', 'Commercial', 'Waterfront'],
      languages: ['Portuguese', 'English', 'French', 'Spanish'],
      service_areas: ['Santiago', 'Praia', 'Cidade Velha', 'Tarrafal'],
      stats: {
        properties_sold: 156,
        total_volume: 24500000,
        average_days_on_market: 45,
        client_satisfaction: 4.9,
        reviews_count: 89,
      },
      links: [
        { id: '1', platform: 'whatsapp', formatted_url: 'https://wa.me/2382601234', display_label: 'WhatsApp', is_public: true, is_verified: true },
        { id: '2', platform: 'instagram', formatted_url: 'https://instagram.com/maria.santos.cv', display_label: '@maria.santos.cv', is_public: true, is_verified: false },
        { id: '3', platform: 'linkedin', formatted_url: 'https://linkedin.com/in/mariasantos', display_label: 'LinkedIn', is_public: true, is_verified: false },
        { id: '4', platform: 'facebook', formatted_url: 'https://facebook.com/mariasantos.realestate', display_label: 'Facebook', is_public: true, is_verified: false },
        { id: '5', platform: 'email', formatted_url: 'mailto:maria.santos@atlanticre.cv', display_label: 'Email', is_public: true, is_verified: true },
      ],
      properties: [
        {
          id: 'prop-1',
          title: 'Luxury Oceanfront Villa',
          price: 750000,
          price_type: 'sale',
          property_type: 'villa',
          bedrooms: 4,
          bathrooms: 3,
          total_area: 320,
          island: 'Santiago',
          city: 'Praia',
          images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          status: 'active',
          is_featured: true,
        },
        {
          id: 'prop-2',
          title: 'Modern City Apartment',
          price: 285000,
          price_type: 'sale',
          property_type: 'apartment',
          bedrooms: 2,
          bathrooms: 2,
          total_area: 95,
          island: 'Santiago',
          city: 'Praia',
          images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          status: 'active',
          is_featured: false,
        },
        {
          id: 'prop-3',
          title: 'Beachfront Penthouse',
          price: 520000,
          price_type: 'sale',
          property_type: 'penthouse',
          bedrooms: 3,
          bathrooms: 2,
          total_area: 180,
          island: 'Santiago',
          city: 'Cidade Velha',
          images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          status: 'active',
          is_featured: true,
        },
        {
          id: 'prop-4',
          title: 'Investment Property',
          price: 1800,
          price_type: 'rent',
          property_type: 'apartment',
          bedrooms: 2,
          bathrooms: 1,
          total_area: 85,
          island: 'Santiago',
          city: 'Praia',
          images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          status: 'active',
          is_featured: false,
        },
      ],
      reviews: [
        {
          id: 'rev-1',
          author_name: 'João Silva',
          author_avatar: null,
          rating: 5,
          comment: 'Maria was incredibly helpful throughout the entire buying process. Her knowledge of the local market is unmatched.',
          date: '2024-12-15',
        },
        {
          id: 'rev-2',
          author_name: 'Sarah Johnson',
          author_avatar: null,
          rating: 5,
          comment: 'As an international buyer, I was nervous about purchasing property abroad. Maria made the process smooth and transparent.',
          date: '2024-11-28',
        },
        {
          id: 'rev-3',
          author_name: 'Pierre Dubois',
          author_avatar: null,
          rating: 5,
          comment: 'Excellent service! Maria speaks perfect French which made communication very easy. Highly recommended.',
          date: '2024-10-20',
        },
      ],
    },
    {
      id: 'agent-2',
      slug: 'joao-pereira',
      full_name: 'João Pereira',
      email: 'joao@salproperties.cv',
      phone: '+238 242 5678',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      bio: 'Expert in beachfront properties and tourism-related real estate investments on Sal Island. With 12 years of experience, I help clients find their perfect vacation home or investment property.',
      roles: ['agent'],
      is_verified: true,
      is_active: true,
      license_number: 'CV-RE-2024-002',
      company: 'Sal Properties Group',
      years_experience: 12,
      specialties: ['Beach Properties', 'Tourism Investment', 'Vacation Homes'],
      languages: ['Portuguese', 'English', 'Italian'],
      service_areas: ['Sal', 'Santa Maria', 'Espargos'],
      stats: {
        properties_sold: 203,
        total_volume: 31200000,
        average_days_on_market: 38,
        client_satisfaction: 4.8,
        reviews_count: 124,
      },
      links: [
        { id: '1', platform: 'whatsapp', formatted_url: 'https://wa.me/2382425678', display_label: 'WhatsApp', is_public: true, is_verified: true },
        { id: '2', platform: 'facebook', formatted_url: 'https://facebook.com/joaopereira.agent', display_label: 'Facebook', is_public: true, is_verified: false },
      ],
      properties: [
        {
          id: 'prop-5',
          title: 'Santa Maria Beach House',
          price: 680000,
          price_type: 'sale',
          property_type: 'house',
          bedrooms: 4,
          bathrooms: 3,
          total_area: 250,
          island: 'Sal',
          city: 'Santa Maria',
          images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          status: 'active',
          is_featured: true,
        },
      ],
      reviews: [],
    },
  ];

  return agents.find(a => a.slug === slug) || null;
};

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);

  if (!agent) {
    return {
      title: 'Agent Not Found | PropertyCV',
    };
  }

  return {
    title: `${agent.full_name} - Real Estate Agent | PropertyCV`,
    description: agent.bio?.substring(0, 160) || `${agent.full_name} is a verified real estate professional at ${agent.company}. View their listings and contact them for property inquiries in Cape Verde.`,
    openGraph: {
      title: `${agent.full_name} - Real Estate Agent`,
      description: agent.bio?.substring(0, 160) || '',
      images: agent.avatar_url ? [agent.avatar_url] : [],
    },
  };
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  return <AgentProfileContent agent={agent} />;
}
