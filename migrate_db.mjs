import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hgwxngrnwfgsjbrwbsfu.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnd3huZ3Jud2Znc2picndic2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMzgwNzgsImV4cCI6MjA5NjYxNDA3OH0.SMW3ETVeH7kEyvDU7kljBu749E5dnSnlUgHOCs3hUHQ";

const supabase = createClient(url, key);

// Need a helper to handle snake_case <-> camelCase mapping manually or simply do it directly since the table columns in JS SDK map 1:1 if we just fetch and update.
// Actually, lessons_list is a JSONB column. In JS SDK it returns as an array.

async function migrate() {
  console.log("Iniciando migração da base de dados...");

  // 1. Resetar progresso dos cursos
  const { data: courses, error: errCourses } = await supabase.from('courses').select('*');
  if (errCourses) {
    console.error("Erro ao buscar cursos:", errCourses);
  } else if (courses) {
    console.log(`Encontrados ${courses.length} cursos. Atualizando progresso...`);
    const updatedCourses = courses.map(course => {
      if (course.lessons_list && Array.isArray(course.lessons_list)) {
        const newLessonsList = course.lessons_list.map((moduleObj) => {
          if (moduleObj.lessons && Array.isArray(moduleObj.lessons)) {
            moduleObj.lessons = moduleObj.lessons.map(lesson => ({
              ...lesson,
              completed: false // Reset progress
            }));
          }
          return moduleObj;
        });
        course.lessons_list = newLessonsList;
      }
      return course;
    });

    const { error: errUpsert } = await supabase.from('courses').upsert(updatedCourses);
    if (errUpsert) console.error("Erro ao atualizar cursos:", errUpsert);
    else console.log("Cursos atualizados com sucesso (Progresso resetado para 0%).");
  }

  // 2. Limpar Mock Data
  console.log("Removendo contas falsas de teste...");
  await supabase.from('students').delete().in('id', ['std-1', 'std-2', 'std-3', 'std-4']);
  await supabase.from('posts').delete().in('id', ['post-1', 'post-2']);
  await supabase.from('transactions').delete().in('id', ['txn-1', 'txn-2', 'txn-3', 'txn-4']);
  await supabase.from('notifications').delete().in('id', ['notif-1', 'notif-2']);
  
  console.log("Migração concluída com sucesso!");
}

migrate();
