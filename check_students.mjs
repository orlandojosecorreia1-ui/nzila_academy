import { createClient } from '@supabase/supabase-js';

const url = "https://hgwxngrnwfgsjbrwbsfu.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnd3huZ3Jud2Znc2picndic2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMzgwNzgsImV4cCI6MjA5NjYxNDA3OH0.SMW3ETVeH7kEyvDU7kljBu749E5dnSnlUgHOCs3hUHQ";

const supabase = createClient(url, key);

async function checkStudent() {
  const { data, error } = await supabase.from('students').select('*');
  if (error) {
    console.error("Erro:", error);
  } else {
    console.log("ALUNOS REGISTADOS NA TUA BASE DE DADOS SUPABASE:");
    console.table(data.map(d => ({ Nome: d.name, Email: d.email, Curso: d.course_title, RegistadoEm: d.registered_at })));
  }
}
checkStudent();
