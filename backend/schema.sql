-- Create the conversations table
DROP TABLE IF EXISTS conversations;

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

