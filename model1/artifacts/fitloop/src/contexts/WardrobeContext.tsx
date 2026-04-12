import { createContext, useContext, useState, ReactNode } from "react";

export type WardrobeItem = {
  id: number;
  name: string;
  type: string;
  category: string;
  color: string;
  pattern: string;
  material: string;
  style: string;
  zone: string;
  confidence: number;
  gemini_label: string;
  is_duplicate: boolean;
};

type WardrobeContextType = {
  items: WardrobeItem[];
  setItems: (items: WardrobeItem[]) => void;
  scannedImageUrl: string | null;
  setScannedImageUrl: (url: string | null) => void;
};

const WardrobeContext = createContext<WardrobeContextType>({
  items: [],
  setItems: () => {},
  scannedImageUrl: null,
  setScannedImageUrl: () => {},
});

const defaultWardrobe: WardrobeItem[] = [
  { id: 101, name: "Black Leather Jacket", type: "jacket", category: "Outerwear", color: "black", pattern: "solid", material: "leather", style: "edgy", zone: "hanging", confidence: 0.96, gemini_label: "Black Moto Leather Jacket", is_duplicate: false },
  { id: 102, name: "White Oxford Shirt", type: "shirt", category: "Tops", color: "white", pattern: "solid", material: "cotton", style: "classic", zone: "hanging", confidence: 0.99, gemini_label: "Classic White Button-Down", is_duplicate: false },
  { id: 103, name: "Navy Slim Jeans", type: "jeans", category: "Bottoms", color: "navy", pattern: "solid", material: "denim", style: "casual", zone: "hanging", confidence: 0.95, gemini_label: "Dark Wash Slim Fit Jeans", is_duplicate: false },
  { id: 104, name: "White Sneakers", type: "sneakers", category: "Footwear", color: "white", pattern: "solid", material: "leather", style: "casual", zone: "shelf", confidence: 0.98, gemini_label: "Minimalist White Sneakers", is_duplicate: false },
  { id: 105, name: "Beige Chinos", type: "trousers", category: "Bottoms", color: "beige", pattern: "solid", material: "cotton", style: "smart casual", zone: "hanging", confidence: 0.94, gemini_label: "Tan Tailored Chinos", is_duplicate: false },
  { id: 106, name: "Grey Crewneck", type: "sweater", category: "Tops", color: "grey", pattern: "solid", material: "wool", style: "cozy", zone: "shelf", confidence: 0.97, gemini_label: "Heather Grey Knit Sweater", is_duplicate: false },
  { id: 107, name: "Chelsea Boots", type: "boots", category: "Footwear", color: "brown", pattern: "solid", material: "suede", style: "smart", zone: "shelf", confidence: 0.92, gemini_label: "Brown Suede Chelsea Boots", is_duplicate: false },
  { id: 108, name: "Olive Bomber", type: "jacket", category: "Outerwear", color: "olive", pattern: "solid", material: "nylon", style: "streetwear", zone: "hanging", confidence: 0.89, gemini_label: "Olive Green Bomber Jacket", is_duplicate: false },
  { id: 109, name: "Black Skirt", type: "skirt", category: "Bottoms", color: "black", pattern: "solid", material: "cotton", style: "chic", zone: "hanging", confidence: 0.91, gemini_label: "Black A-Line Skirt", is_duplicate: false },
];

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WardrobeItem[]>(defaultWardrobe);
  const [scannedImageUrl, setScannedImageUrl] = useState<string | null>(null);

  return (
    <WardrobeContext.Provider value={{ items, setItems, scannedImageUrl, setScannedImageUrl }}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  return useContext(WardrobeContext);
}
