import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos no .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runSetup() {
  console.log("Iniciando limpeza do banco de dados...");

  const tables = ['courses', 'access_codes', 'students', 'posts', 'transactions', 'notifications', 'activity_logs'];

  for (const table of tables) {
    console.log(`Limpando tabela: ${table}...`);
    try {
        if (table === 'access_codes') {
            await supabase.from(table).delete().neq('code', 'mock_impossible_id');
        } else {
            await supabase.from(table).delete().neq('id', 'mock_impossible_id');
        }
        console.log(`Tabela ${table} limpa.`);
    } catch (err) {
        console.log(`Erro ao limpar ${table}: ${err.message}`);
    }
  }

  console.log("Banco de dados limpo.");

  const adminEmail = 'orlandojosecorreia1@gmail.com';
  const adminPassword = 'Orlando@#792003';
  
  console.log(`Criando utilizador admin: ${adminEmail}`);
  
  const { data: user, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { role: 'admin', name: 'Orlando Correia' }
  });

  if (authError) {
    if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        console.log(`Utilizador ${adminEmail} já existe. Atualizando metadados e senha...`);
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const existingUser = usersData.users.find(u => u.email === adminEmail);
        
        if (existingUser) {
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                { password: adminPassword, user_metadata: { role: 'admin', name: 'Orlando Correia' } }
            );
            if (updateError) {
                console.error(`Erro ao atualizar admin:`, updateError.message);
            } else {
                console.log(`Administrador atualizado com sucesso!`);
            }
        }
    } else {
        console.error("Erro ao criar admin:", authError.message);
    }
  } else {
    console.log("Administrador criado com sucesso:", user.user.id);
  }

  console.log("Configuração concluída!");
}

runSetup();
