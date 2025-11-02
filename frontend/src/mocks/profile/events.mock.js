// Mock eventos creados por el usuario
export const mockUserEvents = [
  {
    id: "u1",
    name: "Intercambio de idiomas en el Park Güell",
    location: "Barcelona, España",
    startDate: "2025-12-01T18:00:00Z",
    description: "Encuentro informal para practicar idiomas mientras disfrutamos de las vistas del parque. Todos los niveles son bienvenidos!",
    restrictions: "Gratuito, trae bebida si quieres",
    imageUrl: "https://images.unsplash.com/photo-1579491093134-82033f750b21",
    capacity: 15,
    participants: [
      { id: "p1", name: "Maria", avatar: null },
      { id: "p2", name: "John", avatar: null },
      { id: "p3", name: "Sophie", avatar: null }
    ],
    languages: ["es", "en", "ca"],
    createdAt: "2025-11-15T10:00:00Z",
    status: "active"
  },
  {
    id: "u2",
    name: "Bicicletada por la costa barcelonesa",
    location: "Barcelona, España",
    startDate: "2025-12-08T09:00:00Z",
    description: "Ruta de unos 30km por la costa, incluyendo paradas para descanso y fotos. Se requiere casco obligatorio.",
    restrictions: "Bicicleta propia, casco obligatorio, nivel medio",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13",
    capacity: 10,
    participants: [
      { id: "p4", name: "Carlos", avatar: null },
      { id: "p5", name: "Emma", avatar: null }
    ],
    languages: ["ca", "es", "en"],
    createdAt: "2025-11-20T14:00:00Z",
    status: "active"
  },
  {
    id: "u3",
    name: "Clase de cocina catalana",
    location: "Mi casa, Barcelona",
    startDate: "2025-11-30T12:00:00Z",
    description: "Vamos a aprender a cocinar esqueixada, escalivada y crema catalana. Incluye los ingredientes!",
    restrictions: "Contribución de 15€ para ingredientes",
    imageUrl: "https://images.unsplash.com/photo-1556910198-5450c19b26f9",
    capacity: 6,
    participants: [
      { id: "p6", name: "Laura", avatar: null },
      { id: "p7", name: "Tom", avatar: null },
      { id: "p8", name: "Anna", avatar: null },
      { id: "p9", name: "Luis", avatar: null }
    ],
    languages: ["ca", "es"],
    createdAt: "2025-11-22T16:30:00Z",
    status: "full"
  },
  {
    id: "u4",
    name: "Fotografía urbana en el Barrio Gótico",
    location: "Barcelona, España",
    startDate: "2025-12-15T10:00:00Z",
    description: "Workshop de fotografía urbana recorriendo los rincones más fotogénicos del barrio gótico.",
    restrictions: "Cámara o móvil con buena cámara",
    imageUrl: "https://images.unsplash.com/photo-1491485880348-85d48a9e5312",
    capacity: 8,
    participants: [
      { id: "p10", name: "David", avatar: null }
    ],
    languages: ["es", "ca"],
    createdAt: "2025-11-25T11:00:00Z",
    status: "active"
  },
  {
    id: "u5",
    name: "Picnic multicultural en Montjuïc",
    location: "Montjuïc, Barcelona",
    startDate: "2025-12-20T13:00:00Z",
    description: "Cada uno trae algo típico de su país. Compartiremos historias y comidas de todo el mundo!",
    restrictions: "Traer algo de comida para compartir",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    capacity: 20,
    participants: [],
    languages: ["es", "en", "ca", "fr", "de"],
    createdAt: "2025-11-28T09:00:00Z",
    status: "active"
  }
];
