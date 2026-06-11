# Remoção Total de Mocks e Transição para Dados Estritos

Este plano detalha as alterações estruturais necessárias para remover todos os dados fictícios do sistema, forçando o dashboard, tokens, e módulos a consultarem e refletirem unicamente o estado verídico do banco de dados (Supabase).

## User Review Required

> [!WARNING]
> A implementação destas mudanças significa que, se não houver nenhum curso, o sistema vai parecer "vazio". O faturamento será exatamente `0 KZ`, e os gráficos não terão curvas artificiais (se não houver vendas reais registradas hoje, o gráfico estará plano). Você aprova essa mudança brusca na interface inicial?

> [!CAUTION]
> A função de registrar novo aluno (`registerStudent`) será convertida para **async** e vai chamar o `supabase.auth.signUp`. Isto significa que **apenas contas reais** validadas via e-mail e Supabase conseguirão ingressar. Além disso, a validação do voucher/token vai ser feita com `SELECT` direto no banco (`access_codes`), e não mais no cache local. Isso corrigirá o erro relatado de "código inexistente". Está de acordo?

## Proposed Changes

### Dashboard Financeiro e CRM (`AdminDashboard.tsx`)
O painel administrativo baseia-se em funções que adicionavam um `offset` simulado para parecer que o sistema tinha alta tração diária. Vamos expurgar esse código:

- **[DELETE]** Função `executeRandomRegistrationSimulation` e `simulateRandomRegistration` (usados para criar leads falsos).
- **[DELETE]** Função `getSimulatedBaseForDate` (que injetava valores aleatórios ao faturamento a cada renderização).
- **[MODIFY]** `getBillingForRange`: Modificar para iterar **exclusivamente** no array `transactions`, sem a variável `totalSimulated`. O `accumulatedBaseValue` artificial (2.8M KZ) será removido.
- **[MODIFY]** Retirar o "14282" estático adicionado ao `totalStudents`. O número de estudantes passará a ser exatamente o tamanho da tabela de alunos real.
- **[MODIFY]** Remover o botão da UI "Simular Nova Inscrição" do módulo *Novos Alunos Cadastrados Hoje*.

### Validação de Tokens e Registo (Auth Real)
- **[MODIFY]** `lib/context/AppContext.tsx`: A função `registerStudent` passará a ser assíncrona (`async`). Ela fará:
  1. Consulta do código direto no Supabase: `await supabase.from('access_codes').select('*').eq('code', accessCode)`.
  2. Criação real de Auth: `await supabase.auth.signUp({ email, password })`.
  3. Atualização das tabelas: Inserção do aluno em `students`, atualização do código para `resgatado` e criação de registro em `transactions` com o valor **real** do preço do curso (recuperado da base de dados e não estático).
- **[MODIFY]** `components/RegisterForm.tsx`: Alterar a chamada do `registerStudent` para `await registerStudent(...)`. 

### Plataforma de Estudos (`StudentVitrine.tsx` e `StudentPlayer.tsx`)
- **[MODIFY]** `StudentVitrine.tsx`: Remover simulações de I.A que recomendavam cursos (`simulatedMatch`). A página será populada com os `courses` reais. Caso seja zero, exibirá estado vazio ("Nenhum curso disponível").
- **[MODIFY]** `StudentPlayer.tsx`: Retirar a pontuação "fake" acoplada à visualização das masterclasses (`handleSimulateWatch`). 

### Gestão de Cursos e Fórum (`AdminCourses.tsx` e `ProfileSettings.tsx`)
- **[MODIFY]** `AdminCourses.tsx`: Remover as funções `handleSimulatedFileUploadChange` que emulavam uploads com timers falsos e exibiam metadados inventados (ex: "simulação de infraestrutura H100s"). Os uploads agora serão formulários puros que guardam o link do arquivo real.
- **[MODIFY]** `ProfileSettings.tsx`: Remoção do botão `Simular Log` na parte da auditoria de sistema. Os logs agora refletirão estritamente os cliques reais e autenticações feitas.

## Verification Plan

### Manual Verification
- Acessar o sistema com a conta de Administrador. O Faturamento deve apresentar `0 KZ` (sem dados).
- Criar um Curso na aba "Gestão de Conteúdo" e colocar um preço nele.
- Gerar um novo Voucher/Token associado ao curso na aba "Gerador de Access Codes".
- Clicar em "Sair da Conta". No portal de "Registo Seguro", cadastrar um novo aluno utilizando o e-mail, senha e o Voucher gerado.
- Validar se o registro passa sem o erro de "token inexistente".
- Fazer login com o Admin novamente e verificar se o Faturamento reflete o exato valor do curso recém-registrado e o CRM mostra "1 aluno".
