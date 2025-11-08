-- Remove the unique constraint that prevents multiple time slots per day
ALTER TABLE dentist_availability 
DROP CONSTRAINT IF EXISTS dentist_availability_dentist_id_day_of_week_key;