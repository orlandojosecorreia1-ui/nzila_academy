import { createClient } from '@supabase/supabase-js';

const url = "https://hgwxngrnwfgsjbrwbsfu.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnd3huZ3Jud2Znc2picndic2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMzgwNzgsImV4cCI6MjA5NjYxNDA3OH0.SMW3ETVeH7kEyvDU7kljBu749E5dnSnlUgHOCs3hUHQ";

const supabase = createClient(url, key);

async function test() {
  console.log("Testing Supabase connection...");
  const { data, error } = await supabase.from('courses').select('id').limit(1);
  if (error) {
    console.error("Error connecting to Supabase:", error);
  } else {
    console.log("Connected successfully. Data:", data);
  }
}
test();
