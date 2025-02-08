# MarkItDown

A powerful document to Markdown converter with optional AI enhancement.

## Setup Instructions

1. Clone this repository
2. Create a `.env` file in the root directory with the following variables:
```env
# Required for Supabase
SUPABASE_URL='your-supabase-project-url'
SUPABASE_KEY='your-supabase-anon-key'


# Optional: For AI enhancement (if not provided, standard conversion will be used)
## (the rpogram uses GITTOKEN as it is in developmental phase users can also put openaai-key directly from the frontend )

GITTOKEN='GITTOKEN'
API_PORT=8000
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Setting up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Once your project is created, go to Project Settings > API
3. Copy the `Project URL` and `anon/public` key
4. Add these to your `.env` file as `SUPABASE_URL` and `SUPABASE_KEY` respectively
5. In your Supabase dashboard:
   - Go to SQL Editor
   - Create a "New Query"
   - Copy and paste the following SQL schema:
   ```sql
   -- Create the table
   CREATE TABLE conversations (
       id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
       title TEXT NOT NULL,
       content TEXT NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security (RLS)
   alter table conversations enable row level security;

   -- Create policy to allow all operations (since this is a basic setup)
   create policy "Allow all operations" 
   on conversations for all 
   using (true);
   ```
   - Click "Run" to create your table and policy

   Note: The RLS policy above allows all operations for simplicity. In a production environment, you might want to restrict access based on user authentication.

## Features

- Convert various document formats to Markdown
- Optional AI enhancement using OpenAI API
- Persistent storage of conversion history
- Simple REST API interface

## Usage

Start the server:
```bash
python app.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `POST /convert` - Convert a file to Markdown
- `GET /conversions` - List all conversions
- `POST /save-conversion` - Save a conversion
- `GET /conversions/{conversion_id}` - Get a specific conversion

## Environment Variables

- `SUPABASE_URL` (required): Your Supabase project URL
- `SUPABASE_KEY` (required): Your Supabase anon/public key
- `GITTOKEN` (optional): OpenAI API key for AI enhancement
- `API_PORT` (optional): Port for the API server (default: 8000)

## License

[MIT License](LICENSE)