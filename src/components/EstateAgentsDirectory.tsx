"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Mail, Star, Award, Users, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EstateAgentsDirectory() {
  const { t } = useLanguage();

  const agents = [
    {
      id: 1,
      name: "Maria Santos",
      title: "Senior Property Consultant",
      titlePt: "Consultora Sénior de Propriedades",
      titleCv: "Konsultora Sénior di Propriedadi",
      company: "Atlantic Real Estate",
      island: "Santiago",
      location: "Praia, Santiago",
      phone: "+238 260 1234",
      email: "maria.santos@atlanticre.cv",
      languages: ["Portuguese", "English", "French"],
      languagesPt: ["Português", "Inglês", "Francês"],
      languagesCv: ["Portugés", "Inglés", "Fransés"],
      specialties: ["Luxury Properties", "Investment", "Commercial"],
      specialtiesPt: ["Propriedades de Luxo", "Investimento", "Comercial"],
      specialtiesCv: ["Propriedadi di Luxu", "Investimentu", "Komersial"],
      experience: 8,
      rating: 4.9,
      propertiesSold: 156,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      description: "Specialized in luxury waterfront properties and international client services",
      descriptionPt: "Especializada em propriedades de luxo na costa e atendimento a clientes internacionais",
      descriptionCv: "Spesialista na propriedadi di luxu na kosta i servisu pa klenti internasional",
      verified: true
    },
    {
      id: 2,
      name: "João Pereira",
      title: "Island Property Expert",
      titlePt: "Especialista em Propriedades da Ilha",
      titleCv: "Spesialista na Propriedadi di Ilha",
      company: "Sal Properties Group",
      island: "Sal",
      location: "Santa Maria, Sal",
      phone: "+238 242 5678",
      email: "joao@salproperties.cv",
      languages: ["Portuguese", "English", "Italian"],
      languagesPt: ["Português", "Inglês", "Italiano"],
      languagesCv: ["Portugés", "Inglés", "Italianu"],
      specialties: ["Beach Properties", "Tourism Investment", "Vacation Homes"],
      specialtiesPt: ["Propriedades na Praia", "Investimento Turístico", "Casas de Férias"],
      specialtiesCv: ["Propriedadi na Praia", "Investimentu Turístiku", "Kasa di Ferias"],
      experience: 12,
      rating: 4.8,
      propertiesSold: 203,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      description: "Expert in beachfront properties and tourism-related real estate investments",
      descriptionPt: "Especialista em propriedades na praia e investimentos imobiliários relacionados ao turismo",
      descriptionCv: "Spesialista na propriedadi na praia i investimentu imobi relasionadu ku turismu",
      verified: true
    },
    {
      id: 3,
      name: "Ana Rodrigues",
      title: "Cultural Capital Specialist",
      titlePt: "Especialista da Capital Cultural",
      titleCv: "Spesialista di Kapital Kultural",
      company: "Mindelo Properties",
      island: "São Vicente",
      location: "Mindelo, São Vicente",
      phone: "+238 232 9012",
      email: "ana@mindeloproperties.cv",
      languages: ["Portuguese", "English", "Spanish"],
      languagesPt: ["Português", "Inglês", "Espanhol"],
      languagesCv: ["Portugés", "Inglés", "Spanhol"],
      specialties: ["Historic Properties", "City Center", "Rental Management"],
      specialtiesPt: ["Propriedades Históricas", "Centro da Cidade", "Gestão de Arrendamento"],
      specialtiesCv: ["Propriedadi Históriku", "Sentru di Sidadi", "Jestãu di Arrendamentu"],
      experience: 6,
      rating: 4.7,
      propertiesSold: 89,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      description: "Focuses on Mindelo's vibrant cultural district and historic property restoration",
      descriptionPt: "Foca no vibrante distrito cultural de Mindelo e restauração de propriedades históricas",
      descriptionCv: "Foka na distritu kultural vibranti di Mindelo i restaurasãu di propriedadi históriku",
      verified: true
    },
    {
      id: 4,
      name: "Carlos Silva",
      title: "Desert Island Specialist",
      titlePt: "Especialista em Ilha Deserta",
      titleCv: "Spesialista na Ilha Desertu",
      company: "Boa Vista Realty",
      island: "Boa Vista",
      location: "Sal Rei, Boa Vista",
      phone: "+238 251 3456",
      email: "carlos@boavistarealty.cv",
      languages: ["Portuguese", "English", "German"],
      languagesPt: ["Português", "Inglês", "Alemão"],
      languagesCv: ["Portugés", "Inglés", "Alemãu"],
      specialties: ["Resort Properties", "Land Development", "International Buyers"],
      specialtiesPt: ["Propriedades de Resort", "Desenvolvimento de Terrenos", "Compradores Internacionais"],
      specialtiesCv: ["Propriedadi di Resort", "Disenvolvimentu di Terrenu", "Kumprador Internasional"],
      experience: 10,
      rating: 4.6,
      propertiesSold: 134,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      description: "Specializes in large-scale developments and pristine beachfront properties",
      descriptionPt: "Especializa-se em desenvolvimentos de grande escala e propriedades pristinas na praia",
      descriptionCv: "Spesializa na disenvolvimentu di gran eskala i propriedadi linpu na praia",
      verified: true
    },
    {
      id: 5,
      name: "Isabel Monteiro",
      title: "Mountain Properties Expert",
      titlePt: "Especialista em Propriedades da Montanha",
      titleCv: "Spesialista na Propriedadi di Montanha",
      company: "Santo Antão Estates",
      island: "Santo Antão",
      location: "Porto Novo, Santo Antão",
      phone: "+238 225 7890",
      email: "isabel@santoantaoestate.cv",
      languages: ["Portuguese", "English"],
      languagesPt: ["Português", "Inglês"],
      languagesCv: ["Portugés", "Inglés"],
      specialties: ["Mountain Views", "Eco Properties", "Agricultural Land"],
      specialtiesPt: ["Vista da Montanha", "Propriedades Ecológicas", "Terra Agrícola"],
      specialtiesCv: ["Vista di Montanha", "Propriedadi Ekolójiku", "Tera Agrícola"],
      experience: 5,
      rating: 4.8,
      propertiesSold: 67,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      description: "Expert in sustainable properties with spectacular mountain and valley views",
      descriptionPt: "Especialista em propriedades sustentáveis com vistas espetaculares da montanha e vale",
      descriptionCv: "Spesialista na propriedadi sustentavel ku vista spetakular di montanha i vali",
      verified: true
    },
    {
      id: 6,
      name: "Manuel Tavares",
      title: "Volcanic Island Specialist",
      titlePt: "Especialista em Ilha Vulcânica",
      titleCv: "Spesialista na Ilha Vulkániku",
      company: "Fogo Real Estate",
      island: "Fogo",
      location: "São Filipe, Fogo",
      phone: "+238 281 2345",
      email: "manuel@fogorealestate.cv",
      languages: ["Portuguese", "English", "French"],
      languagesPt: ["Português", "Inglês", "Francês"],
      languagesCv: ["Portugés", "Inglés", "Fransés"],
      specialties: ["Unique Properties", "Wine Country", "Volcanic Views"],
      specialtiesPt: ["Propriedades Únicas", "Região Vinícola", "Vistas Vulcânicas"],
      specialtiesCv: ["Propriedadi Úniku", "Rejãu Vinícola", "Vista Vulkániku"],
      experience: 7,
      rating: 4.5,
      propertiesSold: 45,
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      description: "Specializes in unique properties around the volcanic landscape and wine regions",
      descriptionPt: "Especializa-se em propriedades únicas na paisagem vulcânica e regiões vinícolas",
      descriptionCv: "Spesializa na propriedadi úniku na paisaji vulkániku i rejãu vinícola",
      verified: false
    }
  ];

  const { currentLanguage } = useLanguage();

  const getAgentTitle = (agent: typeof agents[0]) => {
    switch (currentLanguage) {
      case 'pt': return agent.titlePt;
      case 'cv': return agent.titleCv;
      default: return agent.title;
    }
  };

  const getAgentSpecialties = (agent: typeof agents[0]) => {
    switch (currentLanguage) {
      case 'pt': return agent.specialtiesPt;
      case 'cv': return agent.specialtiesCv;
      default: return agent.specialties;
    }
  };

  const getAgentDescription = (agent: typeof agents[0]) => {
    switch (currentLanguage) {
      case 'pt': return agent.descriptionPt;
      case 'cv': return agent.descriptionCv;
      default: return agent.description;
    }
  };

  const getAgentLanguages = (agent: typeof agents[0]) => {
    switch (currentLanguage) {
      case 'pt': return agent.languagesPt;
      case 'cv': return agent.languagesCv;
      default: return agent.languages;
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Professional Estate Agents
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with experienced real estate professionals across all Cape Verde islands
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent) => (
            <Card key={agent.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <Avatar className="w-20 h-20 mx-auto">
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {agent.verified && (
                    <div className="absolute -top-1 -right-1">
                      <Badge className="bg-green-500 text-white p-1 rounded-full">
                        <Award className="h-3 w-3" />
                      </Badge>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
                <p className="text-gray-600 text-sm">{getAgentTitle(agent)}</p>
                <p className="text-blue-600 font-semibold text-sm">{agent.company}</p>

                <div className="flex items-center justify-center mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(agent.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {agent.rating} ({agent.propertiesSold} sales)
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">{agent.location}</span>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {getAgentDescription(agent)}
                </p>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-1">
                    {getAgentSpecialties(agent).map((specialty: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Languages:</p>
                  <div className="flex flex-wrap gap-1">
                    {getAgentLanguages(agent).map((language: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center py-2">
                  <div>
                    <p className="text-lg font-bold text-blue-600">{agent.experience}</p>
                    <p className="text-xs text-gray-500">Years Experience</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{agent.propertiesSold}</p>
                    <p className="text-xs text-gray-500">Properties Sold</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700">
                    <Mail className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                </div>

                <Button variant="ghost" size="sm" className="w-full text-blue-600">
                  <Users className="h-4 w-4 mr-2" />
                  View Profile & Listings
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verified Professionals</h3>
              <p className="text-gray-600 text-sm">All agents are licensed and verified real estate professionals</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Home className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Island Expertise</h3>
              <p className="text-gray-600 text-sm">Local knowledge of each island's unique property market</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multilingual Service</h3>
              <p className="text-gray-600 text-sm">Agents speak multiple languages to serve international clients</p>
            </div>
          </div>

          <Button size="lg" className="bg-red-600 hover:bg-red-700">
            Register as an Agent
          </Button>
        </div>
      </div>
    </section>
  );
}
