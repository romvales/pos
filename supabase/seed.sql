
INSERT INTO public.invoice_types (invoice_name, code) 
VALUES
  ('DELIVERY RECEIPT', 'SI'),
  ('CHARGE INVOICE', 'CI'),
  ('SALES RETURN', 'SR'),
  ('STOCK OUT', 'BO'),
  ('STOCK IN', 'IN');

-- Create storage bucket for the uploaded files
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES
  ('images', 'images', true, '{"image/*"}'::text[]);

-- Not recommended for production
CREATE POLICY "Allow upload on `images` bucket." ON storage.objects FOR ALL TO anon WITH CHECK ( bucket_id = 'images' );
