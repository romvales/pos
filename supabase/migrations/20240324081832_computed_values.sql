
-- public.contacts.full_name
CREATE FUNCTION full_name(public.contacts) RETURNS TEXT AS $$
  SELECT $1.first_name || ' ' || $1.last_name;
$$ LANGUAGE SQL IMMUTABLE;