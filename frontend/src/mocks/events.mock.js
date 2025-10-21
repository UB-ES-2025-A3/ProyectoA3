// src/mocks/events.mock.js
export const mockEvents = [
  {
    id: "e1",
    name: "Free Walking Tour - Lisboa",
    location: "Lisboa, Portugal",
    startDate: "2025-11-12T10:00:00Z",
    description: "Ruta por el centro histórico y miradores.",
    restrictions: "Grupo máx. 12",
    imageUrl: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=873",
    capacity: 12,
    participants: [{ id: "u1" }, { id: "u2" }, { id: "u3" }], // 3 participantes, no estás apuntado
    languages: ["es", "en", "pt"], // Idiomas disponibles
  },
  {
    id: "e2",
    name: "Surf day en Ericeira",
    location: "Ericeira, Portugal",
    startDate: "2025-11-13T08:30:00Z",
    description: "Clases para todos los niveles + alquiler tabla.",
    restrictions: "Saber nadar",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    capacity: 8,
    participants: [{ id: "me" }], // Ya estás apuntado a este
    languages: ["es", "pt"], // Solo español y portugués
  },
  {
    id: "e3",
    name: "Atardecer en Cabo da Roca",
    location: "Sintra, Portugal",
    startDate: "2025-11-14T17:00:00Z",
    description: "Car-sharing y picnic en el acantilado.",
    restrictions: "",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    capacity: 5,
    participants: [{ id: "u2" }, { id: "u3" }, { id: "u4" }, { id: "u5" }, { id: "u6" }], // lleno
    languages: ["en", "de"], // Inglés y alemán
  },
];
