export function getClothingImage(type: string): string {
  const norm = type.toLowerCase();
  
  const map: Record<string, string> = {
    // Bottoms
    jeans: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
    trousers: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80",
    shorts: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80",
    skirt: "https://images.unsplash.com/photo-1583496661160-c588c25692f0?w=400&q=80",
    
    // Tops
    shirt: "https://images.unsplash.com/photo-1596755094514-f87e32f6b717?w=400&q=80",
    "t-shirt": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
    blouse: "https://images.unsplash.com/photo-1603517436034-7546fc4eb6e3?w=400&q=80",
    sweater: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80",
    hoodie: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80",
    cardigan: "https://images.unsplash.com/photo-1614252365983-d5f04a602102?w=400&q=80",
    
    // Outerwear
    jacket: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
    coat: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80",
    blazer: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
    
    // Dresses
    dress: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80",
    
    // Footwear
    heels: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80",
    boots: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=400&q=80",
    shoes: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80",
    sneakers: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&q=80",
    sandals: "https://images.unsplash.com/photo-1603487742131-4160ec899326?w=400&q=80",
    
    // Accessories
    bag: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400&q=80",
    belt: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&q=80",
    scarf: "https://images.unsplash.com/photo-1601004812328-97f62e87902d?w=400&q=80",
    cap: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80",
    watch: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
  };

  return map[norm] || "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80"; // Fallback clothing rack
}
