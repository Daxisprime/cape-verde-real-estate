-- =============================================
-- QUICK VERIFICATION QUERY
-- Run this first to check if your table exists
-- =============================================

-- Check if properties table exists and show columns
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;

-- If empty result, run verify-properties-table.sql to create the table

-- =============================================
-- REQUIRED COLUMNS FOR MAP MARKERS:
-- =============================================
-- id           (uuid)
-- title        (text/varchar)
-- price        (numeric)
-- price_currency (varchar) - 'CVE' or 'EUR'
-- coordinates  (double precision[]) - [latitude, longitude]
-- images       (text[]) - array of image URLs
-- bedrooms     (integer)
-- bathrooms    (integer)
-- property_type (varchar/enum)
-- city         (varchar)
-- island       (varchar)
-- status       (varchar/enum) - must be 'active' to show on map
-- =============================================
