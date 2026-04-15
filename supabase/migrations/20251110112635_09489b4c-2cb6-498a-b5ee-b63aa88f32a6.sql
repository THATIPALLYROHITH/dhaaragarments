-- Add support for multiple product images
-- First, rename the old image column to images and change it to text array
ALTER TABLE products 
  RENAME COLUMN image TO images_old;

-- Add new images column as text array
ALTER TABLE products 
  ADD COLUMN images text[] DEFAULT '{}';

-- Migrate existing data: convert single image URLs to array format
UPDATE products 
  SET images = ARRAY[images_old]
  WHERE images_old IS NOT NULL;

-- Drop the old column
ALTER TABLE products 
  DROP COLUMN images_old;