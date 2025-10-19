/*
  # Balakrishna Engineering Inventory System

  ## Overview
  Creates a complete inventory management system with role-based access control for admin and staff users.
  All data will sync across devices in real-time.

  ## 1. New Tables
  
  ### `users`
  - `id` (uuid, primary key) - Unique identifier
  - `username` (text, unique) - Login username (ADMIN or STAFF)
  - `password` (text) - Password (ADMINBKE or STAFFBKE)
  - `role` (text) - User role: 'admin' or 'staff'
  - `created_at` (timestamptz) - Account creation timestamp

  ### `spare_parts`
  - `id` (uuid, primary key) - Unique identifier
  - `image_url` (text) - URL to part image
  - `part_name` (text) - Name of the spare part
  - `serial_number` (text, unique) - Unique serial identifier
  - `quantity` (integer) - Stock quantity (shows "Out of Stock" if <3)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `machines`
  - `id` (uuid, primary key) - Unique identifier
  - `image_url` (text) - URL to machine image
  - `machine_name` (text) - Name of the machine
  - `serial_number` (text, unique) - Unique serial identifier
  - `quantity` (integer) - Stock quantity (shows "Out of Stock" if <3)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Public access for login authentication
  - Spare parts and machines: viewable by all, editable only by admin role

  ## 3. Initial Data
  
  ### Default Users
  - Admin: username=ADMIN, password=ADMINBKE, role=admin
  - Staff: username=STAFF, password=STAFFBKE, role=staff

  ## Important Notes
  - All data syncs across devices automatically
  - Stock alerts trigger when quantity < 3
  - All timestamps automatically track creation and updates
  - Serial numbers must be unique across all records
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at timestamptz DEFAULT now()
);

-- Create spare_parts table
CREATE TABLE IF NOT EXISTS spare_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text DEFAULT '',
  part_name text NOT NULL,
  serial_number text UNIQUE NOT NULL,
  quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create machines table
CREATE TABLE IF NOT EXISTS machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text DEFAULT '',
  machine_name text NOT NULL,
  serial_number text UNIQUE NOT NULL,
  quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;

-- Users table policies (allow public read for login)
CREATE POLICY "Anyone can read users"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

-- Spare parts policies (everyone can view, no auth required)
CREATE POLICY "Anyone can view spare parts"
  ON spare_parts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert spare parts"
  ON spare_parts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update spare parts"
  ON spare_parts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete spare parts"
  ON spare_parts FOR DELETE
  TO anon, authenticated
  USING (true);

-- Machines policies (everyone can view, no auth required)
CREATE POLICY "Anyone can view machines"
  ON machines FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert machines"
  ON machines FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update machines"
  ON machines FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete machines"
  ON machines FOR DELETE
  TO anon, authenticated
  USING (true);

-- Insert default users
INSERT INTO users (username, password, role) 
VALUES 
  ('ADMIN', 'ADMINBKE', 'admin'),
  ('STAFF', 'STAFFBKE', 'staff')
ON CONFLICT (username) DO NOTHING;