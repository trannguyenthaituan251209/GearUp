-- Fix: Remove large contract template strings from user_metadata in auth.users
-- This resolves the "400 Bad Request" issue caused by JWT tokens exceeding HTTP header size limits.
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data - 'contractTemplate' - 'contractTemplates';
