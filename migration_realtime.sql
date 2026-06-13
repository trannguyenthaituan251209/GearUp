-- Enable realtime for tables
begin;
  -- Remove tables from publication if they exist to avoid duplicate errors, then add them
  -- Note: You can just safely run the ADD TABLE if they aren't there yet
  alter publication supabase_realtime add table messages;
  alter publication supabase_realtime add table bookings;
  alter publication supabase_realtime add table assets;
commit;
