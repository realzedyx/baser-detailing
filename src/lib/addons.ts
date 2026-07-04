export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export const ADD_ONS: Record<"interior" | "exterior", AddOn[]> = {
  interior: [{ id: "pet-hair", name: "Pet hair removal", price: 25 }],
  exterior: [{ id: "ceramic-sealant", name: "Ceramic sealant — up to 3 months protection", price: 35 }],
};

// "full" = union of both, since Full Detail = everything in Interior + Exterior
export function getAddOnsForService(serviceId: string): AddOn[] {
  if (serviceId === "full") return [...ADD_ONS.interior, ...ADD_ONS.exterior];
  return ADD_ONS[serviceId as "interior" | "exterior"] ?? [];
}
