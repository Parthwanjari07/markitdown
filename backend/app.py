import shutil
import os
import re
import logging
from uuid import uuid4
from typing import Optional

# Third-party imports
from fastapi import FastAPI, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel
from markitdown import MarkItDown

# Local imports
from supabase_client import get_supabase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Attempt to load .env from the current directory
try:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        # If not found, attempt to load from the base directory
        env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    load_dotenv(dotenv_path=env_path)
except Exception as e:
    logger.error(f"Error loading .env file: {e}")

# Initialize Supabase client
supabase = get_supabase()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Define supported file extensions
supported_extensions = ('.txt', '.doc', '.docx', '.pdf', '.pptx', 
                       '.jpg', '.jpeg', '.png', '.xlsx', '.xls', 
                       '.csv', '.json')
# supported_extensions = ('.pdf')  # Match frontend accept attribute

@app.get("/conversions")
async def get_conversations():
    try:
        result = supabase.table("conversations") \
            .select("*") \
            .execute()
        return result.data
    except Exception as e:
        raise HTTPException(500, str(e))

class SaveConversionRequest(BaseModel):
    title: str
    content: str

@app.post("/save-conversion")
async def save_conversion(
    title: str = Form(...),
    content: str = Form(...)
):
    print("[DEBUG] Entering /save-conversion endpoint.")
    print(f"[DEBUG] Received request with title: {title} and content length: {len(content)}")
    try:
        print("[DEBUG] Inserting conversation into the database.")
        result = supabase.table("conversations").insert({
            "title": title,
            "content": content,
            "created_at": "now()"  # Adjust this if your DB expects a proper timestamp
        }).execute()
        print(f"[DEBUG] Insert result: {result.data}")
        
        if not result.data or not isinstance(result.data, list) or len(result.data) == 0:
            print("[DEBUG] No data returned from insertion.")
            raise HTTPException(status_code=500, detail="Insertion failed: no data returned.")
        
        conversion_id = result.data[0].get('id')
        print(f"[DEBUG] Successfully saved conversion with id: {conversion_id}")
        return {"data": {"id": conversion_id}}
    except Exception as e:
        print(f"[DEBUG] Exception in save_conversion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversions/{conversion_id}")
async def get_conversion(conversion_id: str):
    try:
        result = supabase.table("conversations") \
            .select("*") \
            .eq("id", conversion_id) \
            .single() \
            .execute()
        return result.data
    except Exception as e:
        raise HTTPException(404, "Conversion not found")
    

@app.post("/convert")
async def convert_markdown(
    file: UploadFile,
    llm_enabled: bool = Form(False),
    openai_key: Optional[str] = Form(None),
):
    print(f"[DEBUG] Received file: {file.filename}")
    logger.info(f'file: {file.filename}')

    # Initialize client based on LLM toggle
    if llm_enabled:
        client = OpenAI(
            api_key=openai_key or os.getenv('GITTOKEN'),
            base_url=os.getenv('OPENAI_API_BASE', 'https://models.inference.ai.azure.com')
        )
        print("[DEBUG] LLM enabled. OpenAI client initialized.")
        print("[DEBUG] Converting using LLM-enhanced method")
    else:
        client = None
        print("[DEBUG] LLM disabled. No OpenAI client.")
        print("[DEBUG] Converting using standard method without LLM")
    
    # Initialize MarkItDown with appropriate configuration
    md = MarkItDown(
        llm_client=client,
        llm_model="gpt-4o" if llm_enabled else None
    )
    print("[DEBUG] MarkItDown initialized.")

    if file.filename.endswith('.md'):
        print("[DEBUG] Rejecting markdown file as input.")
        raise HTTPException(status_code=400, detail="Markdown files are not accepted as input")
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    print(f"[DEBUG] File extension determined: {file_ext}")
    if file_ext not in supported_extensions:
        print(f"[DEBUG] Unsupported file format: {file_ext}")
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format. Allowed: {', '.join(supported_extensions)}"
        )
    
    unique_id = uuid4()
    temp_dir = f"./temp/{unique_id}"
    print(f"[DEBUG] Temporary directory to be created: {temp_dir}")

    try:
        os.makedirs(temp_dir, exist_ok=True)
        file_path = f"{temp_dir}/{file.filename}"
        print(f"[DEBUG] Saving file to: {file_path}")
        
        # Save uploaded file
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        print("[DEBUG] File saved successfully.")

        # Process file using MarkItDown for all conversions
        print(f"[DEBUG] Starting conversion with file: {file_path}")
        result = md.convert(file_path)
        print("[DEBUG] Conversion completed.")
        content = result.text_content
        
        return JSONResponse(content={"result": content})
    
    except Exception as e:
        print(f"[DEBUG] Exception occurred during conversion: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if os.path.exists(temp_dir):
            print(f"[DEBUG] Cleaning up temporary directory: {temp_dir}")
            shutil.rmtree(temp_dir, ignore_errors=True)
            print("[DEBUG] Temporary directory cleaned up.")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('API_PORT', '8001'))
    uvicorn.run(app, host="0.0.0.0", port=port)