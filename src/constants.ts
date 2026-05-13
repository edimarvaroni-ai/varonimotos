export interface Motorcycle {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  image: string;
  specs: string;
  category: string;
  year?: number;
  description?: string;
}

export const WHATSAPP_NUMBERS = [
  { label: "Vendedor 1", number: "5518996770986" },
  { label: "Vendedor 2", number: "5518997572769" }
];

export const BUSINESS_PHONE = WHATSAPP_NUMBERS[0].number;

export const getRandomWhatsAppNumber = () => {
  return WHATSAPP_NUMBERS[Math.floor(Math.random() * WHATSAPP_NUMBERS.length)].number;
};

export const MOTORCYCLES: Motorcycle[] = [
  {
    id: 1,
    name: "CG 160 Titan",
    brand: "Honda",
    price: 15800,
    year: 2024,
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop",
    specs: "160cc • 15.1 cv • Econômica",
    category: "Street",
    description: "A queridinha do Brasil em sua versão mais completa. A CG 160 Titan combina economia, confiabilidade e um design agressivo. Perfeita para o dia a dia urbano, oferecendo o melhor custo-benefício da categoria."
  },
  {
    id: 2,
    name: "Fazer FZ25",
    brand: "Yamaha",
    price: 21900,
    year: 2024,
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2070&auto=format&fit=crop",
    specs: "250cc • 21.5 cv • ABS de série",
    category: "Naked",
    description: "Conforto e performance em uma 250cc de respeito. Com freios ABS de série e iluminação Full LED, a Fazer FZ25 é a escolha ideal para quem busca subir de cilindrada com segurança e estilo."
  },
  {
    id: 3,
    name: "R 1250 GS",
    brand: "BMW",
    price: 109500,
    year: 2023,
    image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=2070&auto=format&fit=crop",
    specs: "1250cc • 136 cv • Premium Tourer",
    category: "Adventure",
    description: "A rainha das estradas. Com motor boxer de 1250cc e tecnologia ShiftCam, a R 1250 GS oferece torque absurdo em qualquer rotação. O padrão ouro para viagens transcontinentais com o máximo de luxo e aventura."
  },
  {
    id: 4,
    name: "XRE 300 Sahara",
    brand: "Honda",
    price: 32500,
    year: 2024,
    image: "https://images.unsplash.com/photo-1558981806-ec527ecb1b09?q=80&w=2070&auto=format&fit=crop",
    specs: "300cc • 25 cv • Off-road ready",
    category: "Dual-Sport",
    description: "A lendária Sahara retornou. Desenvolvida para enfrentar qualquer terreno, a XRE 300 oferece suspensões de longo curso, embreagem assistida e deslizante, além de conectividade para auxiliar em suas explorações."
  }
];
