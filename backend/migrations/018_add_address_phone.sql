-- Migration 018: Add phone number to addresses
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS phone TEXT;
