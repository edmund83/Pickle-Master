-- Storage Bucket Setup for Pickle Master
-- Run this in Supabase SQL Editor

-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'item-images',
    'item-images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Users can view tenant images" ON storage.objects;
CREATE POLICY "Users can view tenant images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'item-images' AND
        (storage.foldername(name))[1] = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Editors can upload images" ON storage.objects;
CREATE POLICY "Editors can upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'item-images' AND
        (storage.foldername(name))[1] = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid()) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update images" ON storage.objects;
CREATE POLICY "Editors can update images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'item-images' AND
        (storage.foldername(name))[1] = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid()) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can delete images" ON storage.objects;
CREATE POLICY "Editors can delete images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'item-images' AND
        (storage.foldername(name))[1] = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid()) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

-- Public access for item images (since bucket is public)
DROP POLICY IF EXISTS "Public can view item images" ON storage.objects;
CREATE POLICY "Public can view item images" ON storage.objects
    FOR SELECT USING (bucket_id = 'item-images');
