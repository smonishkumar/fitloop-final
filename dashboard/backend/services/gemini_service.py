import os
import google.generativeai as genai

async def get_outfit_recommendations(wardrobe_items: list, body_type: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Gemini API key is not configured."
        
    genai.configure(api_key=api_key)
    # Use gemini-pro for text generation
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    if not wardrobe_items:
        return "Your wardrobe is empty. Add some items to get recommendations!"
        
    items_desc = ", ".join([f"{item.get('color', '')} {item.get('brand', '')} {item.get('item_type', '')}" for item in wardrobe_items])
    
    body_type_str = body_type if body_type else "standard"
    
    prompt = (f"Given a user with a {body_type_str} body type and the following wardrobe items: "
              f"{items_desc}. What are some good outfit combinations for different occasions? "
              "Please provide a few suggestions with styling tips.")
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating recommendations: {str(e)}"
