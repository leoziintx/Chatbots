const fs = require('fs');
const wppconnect = require('@wppconnect-team/wppconnect');
const {
  showMainMenu,
  showSubMenuAssistenciaEstudantil,
  showSubMenuAvaliacaoSocioeconomica,
  showSubMenuAtividadesApoioAcadêmico,
  showSubMenuPasseLivreUniversitário,
  showSubMenuInformacaoCartãoPasseLivre,
  showSubMenuReavaliacaoSocioeconomica,
  showSubMenuProcAvaliacaoSocioeconomica,
  showSubDadosBancarios,
  showSubMenuProcASEAnteriores2023,
  showSubMenuProcASEEmCurso,
  showSubMenuInscricao,
  showSubMenuRecursoInscricao,
  showSubMenuASE20222,
  showSubMenuASE20231,
  showSubMenuAuxiliosEBolsas,
  showSubMenuAuxilioAlimentacao,
  showSubMenuAuxilioAlimentacaoResultados,
  showSubMenuAuxilioAlimentacaoNormativos,
  showSubMenuBolsaPermanencia,
  showSubMenuCalendario,
  showSubMenuMaterialDidatico,
  showSubMenuMaterialDidaticoResultados,
  showSubMenuMaterialDidaticoResultados20232,
  showSubMenuMaterialDidaticoResultados20231,
  showSubMenuMaterialDidaticoResultados20221,
  showSubMenuBolsaPermanenciaNormativos,
  encerramentoConversa
} = require('./menu');

// Objeto para armazenar o estado da conversa com cada usuário
const conversationState = {};

const sqlite3 = require('sqlite3').verbose();

// Crie uma nova instância do banco de dados SQLite e conecte-se a ele
const db = new sqlite3.Database('C:/Users/DAIAIE/Documents/BD/bd_teste.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conexão bem-sucedida com o banco de dados SQLite.');
  }
});

// Função para executar consultas SQL no banco de dados SQLite
function executarConsultaSQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Função para verificar se o CPF existe no banco de dados
async function verificarCPFBancoDeDados(cpfOuMatricula) {
  try {
    // Consulta SQL para verificar se o CPF/matrícula existe na tabela RU
    const query = "SELECT CPF, MATRICULA FROM RU WHERE CPF = ? OR MATRICULA = ?";
    const result = await executarConsultaSQL(query, [cpfOuMatricula, cpfOuMatricula]);

    // Se o contador for maior que zero, significa que o CPF/matrícula existe no banco de dados
    if (result.length) {
      return result; // Retorna o resultado da consulta
    }
  } catch (error) {
    console.error("Erro ao verificar CPF/matrícula no banco de dados:", error);
    return false; // Em caso de erro, retorna false por padrão
  }
}

async function verificarDadosCPF(cpfOuMatricula) {
  try {
    const result = await verificarCPFBancoDeDados(cpfOuMatricula);

    // Se não houver resultado, retorna "CPF/matrícula não encontrado"
    if (!result.length) {
      return "CPF/matrícula não encontrado";
    }

    // Se a matrícula tiver duas partes, verifica se uma delas está presente no banco de dados
    if (cpfOuMatricula.includes("/")) {
      const partesMatricula = cpfOuMatricula.split("/");
      const matriculaEncontrada = result.find(row => row.MATRICULA === partesMatricula[0] || row.MATRICULA === partesMatricula[1]);

      if (matriculaEncontrada) {
        return `*NOME:* ${matriculaEncontrada.NOME}\n\n*SITUAÇÃO:* ${matriculaEncontrada.SITUACAO}\n\n______________________________________\n\n`;
      }
    }

    // Retorna os dados do cliente
    return result.map(row => {
      return `*NOME:* ${row.NOME}\n\n*SITUAÇÃO:* ${row.SITUACAO}\n\n______________________________________\n\n`;
    }).join('');
  } catch (error) {
    console.error("CPF/matrícula não encontrado no banco", error);
    return "CPF/matrícula não encontrado"; // Em caso de erro, retorna "CPF/matrícula não encontrado"
  }
}

module.exports = { db, executarConsultaSQL, verificarCPFBancoDeDados, verificarDadosCPF };function getConversationState(from) {
  if (!conversationState[from]) {
    conversationState[from] = {
      waitingForCPF: false,
      momento: 'menuInicial'
    };
  }
  return conversationState[from];
}

function updateConversationState(from, newState) {
  conversationState[from] = newState;
}

function start(client) {
  client.onMessage((message) => {
    const lowerCaseMessage = message.body.toLowerCase();
    const { from } = message;

    // Obtém o estado da conversa para o usuário atual
    const conversation = getConversationState(from);

    if (conversation.waitingForCPF) {
      // Se estamos esperando o CPF, podemos processá-lo aqui.
      const cpf = message.body.trim();
      
      if (cpf.length === 11 && /^\d+$/.test(cpf)) {
        // Se o CPF tiver 11 dígitos e for composto apenas de números, exiba o menu principal.
        showMainMenu(client, from);

        // Responda ao CPF registrado e redefina o estado da conversa.
        client
          .sendText(from, `CPF ${cpf} registrado. Obrigado!`)
          .then((result) => {
            console.log('Result: ', result);
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro);
          });

        // Atualiza o estado da conversa
        updateConversationState(from, { waitingForCPF: false, momento: 'menuInicial' });
      } else {
        // Se o CPF não tiver 11 dígitos ou conter caracteres não numéricos, solicite novamente o CPF.
        client
          .sendText(from, 'O CPF deve ter 11 dígitos numéricos. Por favor, insira um CPF válido:')
          .then((result) => {
            console.log('Result: ', result);
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro);
          });
      }
    } else {
      // Se não estamos esperando o CPF, verificamos se a mensagem começa com uma das palavras-chave.
      if (
        lowerCaseMessage.startsWith('oi') ||
        lowerCaseMessage.startsWith('ola') ||
        lowerCaseMessage.startsWith('alguém aí') ||
        lowerCaseMessage.startsWith('opa') ||
        lowerCaseMessage.startsWith('boa tarde') ||
        lowerCaseMessage.startsWith('bom dia') ||
        lowerCaseMessage.startsWith('boa noite')
      ) {
        // Solicitamos o CPF.
        client
          .sendText(from, 'Olá! Meu nome é IaPr4, estou aqui para ajudar. Por favor, insira seu CPF:')
          .then((result) => {
            console.log('Result: ', result);
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro);
          });

        // Atualiza o estado da conversa para esperar o CPF
        updateConversationState(from, { waitingForCPF: true, momento: 'menuInicial' });
      } else if ( conversation.momento === 'menuInicial' ) {
        switch (lowerCaseMessage){
          case '1':
            showSubMenuAssistenciaEstudantil (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAssistenciaEstudantil' });
                    // Resetando o subMenu para que retorne ao menu principal após escolher uma opção
        
                    break;
          case '2':
            showSubMenuAuxiliosEBolsas (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAuxiliosEBolsas' });
        
                    break;
          case '3':
            client.sendText(from, `Estamos gerando o link para os normativos, pode levar alguns minutos.`);
            client.sendText(from, `https://www.pr4.uerj.br/index.php/normativos/`).then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
                    break;
          case '4':
            client.sendText(from, `Estamos gerando o link para os eventos, pode levar alguns minutos.`);
            client.sendText(from, `https://www.pr4.uerj.br/index.php/eventos/`).then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
                  
                    break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuAssistenciaEstudantil') {
        switch (lowerCaseMessage){
          case '1':
            showSubMenuAvaliacaoSocioeconomica (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAvaliacaoSocioeconomica' });
            break;
          case '2':
            showSubDadosBancarios (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuDadosBancarios' });
            break;
          case '3':
            showSubMenuAtividadesApoioAcadêmico (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAtividadesApoioAcadêmico' });
            break;
          case '4':
            showSubMenuPasseLivreUniversitário (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuPasseLivreUniversitário' }); 
            break;
          case '5':
            showSubMenuReavaliacaoSocioeconomica (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuReavaliacaoSocioeconomica' }); 
            
            break;
          case '6':
            showMainMenu (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuInicial' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuAuxiliosEBolsas') {
        switch (lowerCaseMessage){
          case '1':
            showSubMenuBolsaPermanencia(client, from);
            updateConversationState(from, { ...conversation, momento: 'BolsaPermanencia' });
            break;
          case '2':
            showSubMenuMaterialDidatico(client, from);
            updateConversationState(from, {...conversation, momento: 'menuMaterialDidatico'});
            break;
          case'3':
            showSubMenuAuxilioAlimentacao(client, from);
            updateConversationState(from, {...conversation, momento:'menuAuxilioAlimentacao'});
          break;
          case '9':
            showMainMenu (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuInicial' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuAuxilioAlimentacao') {
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, '● *O que é?* \n É o pagamento de auxílio financeiro no valor de R$ 300,00 mensais, a fim de garantir a segurança alimentar do estudante da UERJ. Está regulamentado pelos normativos: AEDA 005/Reitoria/2022, AEDA 001/Reitoria/2024 e pelo Edital PR4 003/2023.\n *o link do : AEDA 005/Reitoria/2022, AEDA 001/Reitoria/2024 e Edital PR4 003/2023 estará na opção 6 - Normativos* \n \n ● *Quem pode participar?* \nEstudantes cotistas ou da ampla concorrência em comprovada situação de vulnerabilidade social dos cursos presenciais de Graduação e Pós-graduação Stricto Sensu, matriculados, inscritos em disciplinas e frequentando as aulas.Para os estudantes da ampla concorrência é obrigatória a comprovação documental da situação de vulnerabilidade social, através do Processo de Avaliação Socioeconômica. Veja orientações no link correspondente neste site. \n \n ● *Quem precisa se inscrever?* \n Todos os estudantes interessados em receber o Auxílio Alimentação, ou seja, cotistas e estudantes da ampla concorrência em situação de vulnerabilidade comprovada semestralmente.O estudante que optar pelo Auxílio Alimentação não terá direito ao subsídio que gera desconto no valor das refeições no Restaurante Universitário, devendo pagar o valor integral da refeição. \n \n ● *Como se inscrever?* \n Os estudantes da Graduação interessados em receber o Auxílio Alimentação devem se inscrever no menu Auxílio Alimentação, no Aluno Online.Os estudantes da Pós-graduação Stricto Sensu interessados em receber o Auxílio Alimentação devem se inscrever no Formulário de Inscrição EXCLUSIVA para Pós-graduação – Auxílio Alimentação, disponibilizado abaixo.').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case '2':
            showSubMenuAuxilioAlimentacaoNormativos(client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAuxilioAlimentacaoNormativos' });
            break;
          case'3':
          client.sendText(from, 'Só um momento que estamos pegando o link do calendário, pode levar alguns minutos.');
          client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2024/01/AA-Calendario-2024.1.pdf').then(() => {
            encerramentoConversa(client, from);
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
        }).catch((error) => {
            console.error('Erro ao enviar a mensagem sobre o recurso:', error);
        });
          break;
          case'4':
          showSubMenuAuxilioAlimentacaoResultados (client, from);
          updateConversationState(from, { ...conversation, momento: 'menuAuxilioAlimentacaoResultados' });
          break;
          case'5':
          break;
          case '6':
            showSubMenuAuxiliosEBolsas (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAuxiliosEBolsas' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuAuxilioAlimentacaoResultados') {
        switch (lowerCaseMessage){
          case '1':
            
          break;
          case '2':
          break;
          case'3':
          break;
          case '4':
            showSubMenuAuxilioAlimentacao (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAuxilioAlimentacao' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuAuxilioAlimentacaoNormativos') {
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, 'Só um momento que estamos pegando o link para o AEDA 005/Reitoria/2022, pode levar alguns minutos.');
            client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2022/06/AEDA005AuxilioAlimentacao.pdf').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case '2':
            client.sendText(from, 'Só um momento que estamos pegando o link para o AEDA 001/Reitoria/2024, pode levar alguns minutos.');
            client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2024/01/AEDA-001_2024-Prorroga-AA.pdf').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case '3':
            client.sendText(from, 'Só um momento que estamos pegando o link para o Edital PR4 003/2023, pode levar alguns minutos.');
            client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2023/05/EDITAL-No-003_PR4_2023-Auxilio-Alimentacao.pdf').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case '4':
            showSubMenuAuxilioAlimentacao (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAuxilioAlimentacao' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }
      
      
      } else if (conversation.momento === 'BolsaPermanencia') {
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, 'É o pagamento de auxílio financeiro mensal, destinado a apoiar a permanência do estudante ingressante pela reserva de vaga (cotas) da Educação Básica do Instituto de Aplicação Fernando Rodrigues da Silveira (CAp-UERJ) e dos cursos de graduação presencial da Universidade do Estado do Rio de Janeiro (UERJ).').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case '2':
            client.sendText(from, ' ● Estar regularmente matriculado em vaga de cota.\n\n● Estar inscrito em disciplinas na Graduação. \n\n ●Estar participando das aulas da Educação Básica. \n\n ●Possuir conta corrente individual no Banco Bradesco, cadastrada no DAIAIE/PR4. \n\n ●Obter frequência de, no mínimo, 75% nas disciplinas em que estiver inscrito no semestre, ou seja, sem trancamento automático (proveniente de reprovação por frequência em todas as matérias inscritas no período/semestre). \n\n ●Comprovar sua condição de carência durante o período máximo de integralização do curso. \n\n ●Atender às convocações comprobatórias de carência, feitas a qualquer tempo a cargo do DAIAIE, como previsto na legislação interna.').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case'3':
          client.sendText(from, 'O valor da bolsa permanência é de *R$706,00* e é *pago Mensalmente*').then(() => {
            encerramentoConversa(client, from);
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
        }).catch((error) => {
            console.error('Erro ao enviar a mensagem sobre o recurso:', error);
        });
            break; 
          case'4':
          client.sendText(from, 'Estudante da Educação Básica do CAp-UERJ ou dos cursos presenciais da Graduação da UERJ que ingressaram em vaga reservada para cotas, prevista nas leis do Estado do Rio de Janeiro e que se mantenha em situação de carência ao longo do curso. \n  Graduação = Lei nº 8121/2018. \n Educação Básica – CAp-UERJ = Lei nº 6434/2013.').then(() => {
            encerramentoConversa(client, from);
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
        }).catch((error) => {
            console.error('Erro ao enviar a mensagem sobre o recurso:', error);
        });
            break;
          case'5':
          client.sendText(from, 'O estudante cotista está automaticamente apto a receber a Bolsa Permanência quando cadastra os dados de sua conta bancária individual no DAIAIE/PR4. \n Os estudantes cotistas da Graduação devem cadastrar seus dados bancários diretamente no Aluno Online. \n Os estudantes cotistas da Educação Básica devem cadastrar seus dados bancários no link Cadastramento de Dados Bancários, disponível no site da PR4 www.pr4.uerj.br.').then(() => {
            encerramentoConversa(client, from);
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
        }).catch((error) => {
            console.error('Erro ao enviar a mensagem sobre o recurso:', error);
        });
            break;
          case'6':
          showSubMenuBolsaPermanenciaNormativos (client, from);
          updateConversationState(from, {...conversation, momento: 'MenuBolsaPermanenciaNormativo'})
          break;
          case '7':
            showSubMenuAuxiliosEBolsas (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAuxiliosEBolsas' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }
      

      
      
      } else if (conversation.momento === 'menuMaterialDidatico') {
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, 'É o pagamento de auxílio financeiro, destinado à aquisição de material didático.Está regulamentado pelo AEDA 024/Reitoria/2022. \n *o link do AEDA 024/Reitoria/2022 estará na opção 6 - Normativos*').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case '2':
              client.sendText(from, '●Ser estudante que ingressou pelo sistema de reserva de vagas, prevista em lei de cotas OU estudante da ampla concorrência em situação de vulnerabilidade social comprovada pela PR4. \n\n ●Ter renda familiar per capita bruta inferior ou igual a 1,5 (um e meio) salário mínimo nacional vigente. \n\n ●Estar regularmente matriculado, inscrito em disciplinas e efetivamente cursando o ano ou período letivo, com frequência igual ou superior à 75% das aulas. \n\n ●Estar recebendo, no respectivo semestre letivo, a Bolsa Permanência ou Bolsa Apoio à Vulnerabilidade Social. \n\n ●Assinar o Termo de Compromisso de Uso do Auxílio Material Didático e entregar na Unidade Acadêmica.').then(() => {
                encerramentoConversa(client, from);
                updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
            }).catch((error) => {
                console.error('Erro ao enviar a mensagem sobre o recurso:', error);
            });
              break;
          case'3':
          client.sendText(from, 'O valor do Auxílio material didático é de *R$ 600,00* e é *pago semestralmente*').then(() => {
            encerramentoConversa(client, from);
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
        }).catch((error) => {
            console.error('Erro ao enviar a mensagem sobre o recurso:', error);
        });
          break;
          case'4':
          client.sendText(from, 'Estudante da Educação Básica do Instituto de Aplicação Fernando Rodrigues da Silveira (CAp-UERJ) e dos cursos de graduação presencial da Universidade do Estado do Rio de Janeiro (UERJ).').then(() => {
            encerramentoConversa(client, from);
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
        }).catch((error) => {
            console.error('Erro ao enviar a mensagem sobre o recurso:', error);
        });
          break;
          case'5':
          showSubMenuCalendario (client, from);
          updateConversationState(from, {...conversation, momento: 'menuCalendario'});
          break;
          case'6':
          client.sendText(from, 'Só um momento que estamos pegando o link, pode levar alguns minutos.');
          client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2022/06/AEDA0242022.pdf').then(() => {
            encerramentoConversa(client, from);
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
        }).catch((error) => {
            console.error('Erro ao enviar a mensagem sobre o recurso:', error);
        });
          break;
          case'7':
          showSubMenuMaterialDidaticoResultados(client, from);
          updateConversationState(from, {...conversation, momento: 'menuMaterialDidaticoResultados'});
            break;
          case'8':
          showSubMenuBolsaPermanencia(client, from);
          updateConversationState(from, {...conversation, momento: 'BolsaPermanencia'});
          break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuMaterialDidaticoResultados') {
        switch (lowerCaseMessage){
          case '1':
            showSubMenuMaterialDidaticoResultados20232(client, from);
            updateConversationState(from, { ...conversation, momento: 'menuMaterialDidaticoResultados20232' });
            break;
          case '2':
            showSubMenuMaterialDidaticoResultados20231(client, from);
            updateConversationState(from, { ...conversation, momento: 'menuMaterialDidaticoResultados20231' });
            break;
          case '3':
            showSubMenuMaterialDidaticoResultados20221(client, from);
            updateConversationState(from, { ...conversation, momento: 'menuMaterialDidaticoResultados20221' });
            break;
          case '4':
            showSubMenuMaterialDidatico (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuMaterialDidatico' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }
      } else if (conversation.momento === 'menuMaterialDidaticoResultados20232') {
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, 'Só um momento que estamos pegando o link do AMD  Resultado Graduação, pode levar alguns minutos.');
            client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2023/10/AMD-2023.2-Resultado-Graduacao-Outubro_2023-1-1.pdf').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            
            break;
          case '2':
            client.sendText(from, 'Só um momento que estamos pegando o link do AMD - Resultado CAP, pode levar alguns minutos.');
            client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2023/10/AMD-2023.2-Resultado-CAp-UERJ-Outubro_2023.pdf').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            
            break;
          case '3':
            showSubMenuMaterialDidaticoResultados (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuMaterialDidaticoResultados' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuMaterialDidaticoResultados20231') {
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, 'Só um momento que estamos pegando o link do AMD Resultado Graduação e Educação Básica (CAp-UERJ), pode levar alguns minutos.');
            client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2023/05/C_AMD-2023.1-Resultado-Graduacao-e-CAp-UERJ-Maio_2023_09.05.pdf').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            
            break;
          case '2':
            showSubMenuMaterialDidaticoResultados (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuMaterialDidaticoResultados' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuMaterialDidaticoResultados20221') {
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, 'Só um momento que estamos pegando o link do AMD Resultado Graduação, pode levar alguns minutos.');
            client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2023/03/Resultado-divulgacao_AMD-GRAD_DEZEMBRO22-Atualizado_compressed.pdf').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
          break;
          case '2':
            client.sendText(from, 'Só um momento que estamos pegando o link do AMD Resultado CAP, pode levar alguns minutos.');
            client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2023/03/Resultado-divulgacao_AMD-CAP_DEZEMBRO22-Atualizado-06.02.pdf').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
          break;
          case '3':
            showSubMenuMaterialDidaticoResultados (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuMaterialDidaticoResultados' });
             break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }


      } else if (conversation.momento === 'menuCalendario') {
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, 'Só um momento que irei enviar o link do calendário.');
            client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2024/02/AMD-Calendario-Graduacao-2024.1-2.pdf').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case '2':
            client.sendText(from, 'Só um momento que irei enviar o link do calendário.');
            client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2024/02/AMD-Calendario-CAp-UERJ-2024.1-1.pdf').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
        
          case'3':
          showSubMenuMaterialDidatico (client, from);
          updateConversationState(from, {...conversation, momento:'menuMaterialDidatico'})
          break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'MenuBolsaPermanenciaNormativo') {
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, 'Só um momento que estamos pegando o Normativo 09/2019');
            client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2023/03/AEDA0092019.pdf').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
          break;
          case '2':
            client.sendText(from, 'Só um momento que estamos pegando o Normativo 32/2016');
            client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2023/03/aeda232016.pdf').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
          break;
          case '3':
            client.sendText(from, 'Só um momento que estamos pegando o Normativo 72/2022');
            client.sendText(from, 'https://www.pr4.uerj.br/wp-content/uploads/2023/03/AEDA_072_2022.pdf').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
          break;
          case '4':
            showSubMenuBolsaPermanencia (client, from);
            updateConversationState(from, { ...conversation, momento: 'BolsaPermanencia' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuReavaliacaoSocioeconomica'){
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, 'A equipe da Coordenadoria de Serviço Social e Assistência Estudantil do DAIAIE é responsável pela aplicação do processo de reavaliação socioeconômica, objetivando atender ao item E do Artigo 2º do AEDA 009/2019, que estabelece como critério para recebimento da Bolsa Permanência o atendimento a todas as convocações para comprovação da situação de carência do estudante cotista. O não atendimento à convocação, bem como a não comprovação da situação de carência, que tem como critério de renda per capita mensal bruta o valor de um salário mínimo e meio nacional do ano vigente, acarretará na suspensão da Bolsa Permanência. Neste sentido, é importante salientar que o estudante é responsável por manter seus dados de contato atualizados junto à UERJ ou ao CAp-UERJ e por acompanhar os canais de comunicação da PR4 para que não perca o prazo da reavaliação socioeconômica. Uma vez perdido este prazo, a Bolsa será suspensa e só poderá se submeter a nova reavaliação após nova convocação.').then(() => {
                encerramentoConversa(client, from);
                updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
            }).catch((error) => {
                console.error('Erro ao enviar a mensagem sobre o recurso:', error);
            });
            break;
          case '2':
            client.sendText(from, 'Estamos gerando o link, pode levar alguns minutos.');
            client.sendText(from, "https://www.pr4.uerj.br/wp-content/uploads/2022/06/NormaAvaliacaoSocioeconomicaExcepcionalidade.pdf").then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            
            break;
          case'3':
            showSubMenuAssistenciaEstudantil (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAssistenciaEstudantil' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuPasseLivreUniversitário'){
        switch (lowerCaseMessage){
          case '1':
          client.sendText(from, ' A Prefeitura da Cidade do Rio de Janeiro, através do Decreto 38.280/2014, instituiu o Passe Livre Universitário, que permite o uso gratuito dos ônibus municipais, BRTs e VLTs, pelos estudantes cotistas ou por estudantes de ampla concorrência com renda familiar per capta de até 01 salário mínimo, matriculados no semestre letivo em instituições de ensino superior com sede localizada no Município do Rio de Janeiro. Para atender à legislação vigente, o DAIAIE/UERJ envia, a cada semestre letivo, a relação dos estudantes beneficiários do sistema de cotas nas datas e formatos especificados nas Resoluções e Leis para o atendimento das gratuidades.').then(() => {
            encerramentoConversa(client, from);
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
        }).catch((error) => {
            console.error('Erro ao enviar a mensagem sobre o recurso:', error);
        });
            break;
          case '2':
          showSubMenuInformacaoCartãoPasseLivre (client, from);
          updateConversationState(from, { ...conversation, momento: 'menuInformacaoCartãoPasseLivre' });
            break;
          case'3':
          showSubMenuAssistenciaEstudantil (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAssistenciaEstudantil' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuInformacaoCartãoPasseLivre') {
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, `Estamos gerando o link para lhe auxiliar a como adquirir o passe liver universitário, pode levar alguns minutos.`);
            client.sendText(from, 'https://www.cartaoriocard.com.br/rcc/gratuidade/plu-comoadquirir').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case '2':
            client.sendText(from, `Estamos gerando o link para lhe auxiliar a como renovar o passe liver universitário, pode levar alguns minutos.`);
            client.sendText(from, 'https://www.cartaoriocard.com.br/rcc/gratuidade/plu-comorenovar').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case '3':
            client.sendText(from, `Estamos gerando o link para lhe auxiliar a como pedir a 2ª do passe liver universitário, pode levar alguns minutos.`);
            client.sendText(from, 'https://www.cartaoriocard.com.br/rcc/gratuidade/plu-segundavia').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case'4':
            showSubMenuPasseLivreUniversitário (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuPasseLivreUniversitário' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuAtividadesApoioAcadêmico'){
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, 'Como parte do Programa de Ações Afirmativas previsto na lei de cotas, a UERJ oferece atividades de apoio pedagógico que contribuem para o desenvolvimento acadêmico e a interação discente e docente, complementando a formação pessoal e profissional. Essas atividades podem também ser aproveitadas para composição da carga horária necessária para as Atividades Acadêmico-Científico-Culturais – AACCs (Atividades Complementares da grade curricular), através da emissão de certificados após a conclusão das atividades.             ').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case '2':
            client.sendText(from, `Estamos gerando o link para as atividades acadêmicas e pedagógicas, pode levar alguns minutos.`);
            client.sendText(from, 'https://proiniciar.uerj.br/').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case'3':
            showSubMenuAssistenciaEstudantil (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAssistenciaEstudantil' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuDadosBancarios') {
          switch (lowerCaseMessage){
            case '1':
              client.sendText(from, 'Todos os benefícios financeiros da Assistência Estudantil são pagos via depósito em conta *bancária individual* do Bradesco (em conta sem portabilidade), exclusivamente em nome do estudante da UERJ ou do CAp-UERJ. Para receber um auxílio ou bolsa com valor em dinheiro, o estudante deverá cadastrar seus dados bancários ao solicitar o benefício.').then(() => {
                encerramentoConversa(client, from);
                updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
            }).catch((error) => {
                console.error('Erro ao enviar a mensagem sobre o recurso:', error);
            });
               break;
            case'2':
            client.sendText(from,  'Estudante de *GRADUAÇÃO* só consegue efetuar o cadastro bancário no aluno online, só um momento que irei enviar o link do aluno online.');
            client.sendText(from, 'https://www.alunoonline.uerj.br/requisicaoaluno/').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
            case'3':
            client.sendText(from, 'Estudante de *PÓS-GRADUAÇÃO* só consegue efetuar o cadastro bancário pelo formulário de solicitação do benefício, só um momento que irei enviar o link.' );
            client.sendText(from, 'https://www.formularios.uerj.br/index.php/34139').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
            case'4':
            client.sendText(from, 'Estudante do *CAp-UERJ* só consegue efetuar o cadastro bancário pelo formulário de solicitação do benefício, só um momento que irei enviar o link.' );
            client.sendText(from, 'https://www.formularios.uerj.br/index.php/34139').then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
            case'5':
            showSubMenuAssistenciaEstudantil (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAssistenciaEstudantil' });
            break;
            default:
              client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
              break;
          }
        
      } else if (conversation.momento === 'menuAvaliacaoSocioeconomica') {
        switch (lowerCaseMessage){
          case '1':
            showSubMenuProcAvaliacaoSocioeconomica (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuProcAvaliacaoSocioeconomica' });
            break;
          case '2':
            client.sendText(from, `Alunos de *reserva de vagas* não precisam fazer a avaliação socioeconômica, somente a *reavaliação socioeconômica*.`).then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
           break;
          case '3':
            showSubMenuAssistenciaEstudantil (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAssistenciaEstudantil' });
            break;
          case '4':
            // TODO
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }
        
      } else if (conversation.momento === 'menuProcAvaliacaoSocioeconomica') {
        switch (lowerCaseMessage){
          case '1':
            showSubMenuProcASEAnteriores2023 (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuProcASEAnteriores2023' });
            break;
          case '2':
            showSubMenuProcASEEmCurso (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuProcASEEmCurso' });
           break;
          case '3':
            client.sendText(from, `No momento não foi aberto o processos ASE 2024.1.`).then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case '4':
            showSubMenuAvaliacaoSocioeconomica (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAvaliacaoSocioeconomica' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuProcASEEmCurso') {
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, `Só um momento, estamos buscando a informação e pode demorar alguns minutos`);
            client.sendText(from, `Para verificar o Edital ASE 2023.2 é só acessar: https://www.pr4.uerj.br/wp-content/uploads/2023/10/SEI_61453704_Edital_de_Chamamento_Publico.pdf`).then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
          case '2':
            client.sendText(from, `Só um momento, estamos buscando a informação e pode demorar alguns minutos`);
            client.sendText(from, `Para verificar a instrução normativa ASE 2023.2 é só acessar: https://www.pr4.uerj.br/wp-content/uploads/2023/10/SEI_61454534_Instrucao_Normativa-1.pdf`).then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
          
           break;
          case '3':
            client.sendText(from, `Só um momento, estamos buscando a informação e pode demorar alguns minutos`);
            client.sendText(from, `O tutorial ASE 23.2 pode ser verificado em:https://www.pr4.uerj.br/wp-content/uploads/2023/10/Tutorial-ASE-UERJ-2023.2-1.pdf`).then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            break;
           case '4':
            client.sendText(from, `Só um momento, estamos buscando a informação e pode demorar alguns minutos`)
            client.sendText(from, `Para verificar o calendário ASE 2023.2 é só acessar: https://www.pr4.uerj.br/wp-content/uploads/2023/12/ASE-2023.2-Calendario-Oficial.pdf`).then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            
            break;
           case '5':
            showSubMenuInscricao (client, from);
            updateConversationState(from, { ...conversation, momento: 'MenuInscricao' });

            break;
           case '6':
            client.sendText(from, `No momento os resultados estão encerrados, só será aberta no dia *26/02/2024*.`).then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            // verificar e alterar no dia 26/02
            break;
           case '7':
            showSubMenuRecursoInscricao (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuRecursoInscricao' });
            // TODO
            break;
           case '8':
            client.sendText(from, `No momento o resultado final ainda não foi divulgado.`).then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
            // TODO
            break;
           case '9':
            showSubMenuProcAvaliacaoSocioeconomica (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuProcAvaliacaoSocioeconomica' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.')
            break;
        }

      } else if (conversation.momento === 'menuRecursoInscricao') {
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, `O recurso estará aberto do dia *27/02/2024* a *29/02/2024*.`).then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre o recurso:', error);
          });
          break;
          case '2':
          client.sendText(from, `A validação do recurso ainda não tem data definida. Recomendamos que verifique o calendário em: https://www.pr4.uerj.br/wp-content/uploads/2023/12/ASE-2023.2-Calendario-Oficial.pdf.`).then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem sobre a validação do recurso:', error);
          });
            break;
           case '3':
            showSubMenuProcASEEmCurso (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuProcASEEmCurso' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'MenuInscricao') {
        switch (lowerCaseMessage){
          case '1':
            client.sendText(from, `No momento as inscrições estão *Encerradas*`).then(() => {
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem de inscrição encerrada:', error);
          });
          break;

          case '2':
            client.sendText(from, `Só um momento, estamos buscando a informação e pode demorar alguns minutos`).then(() =>{
            client.sendText(from, `Para verificar a sua inscrições é só acessar:https://www.pr4.uerj.br/wp-content/uploads/2024/02/Homologacao-das-Inscricoes-ASE-2023.2-Inscricoes-finalizadas-e-Inscricoes-nao-finalizadas.pdf`).then(() =>{
            encerramentoConversa(client, from);
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
        }).catch((error) => {
            console.error('Erro ao enviar o link:', error);
            // Se houver um erro ao enviar o link, você pode querer lidar com isso aqui
        });
    }).catch((error) => {
        console.error('Erro ao enviar a mensagem inicial:', error);
        // Se houver um erro ao enviar a mensagem inicial, você pode querer lidar com isso aqui
    });
            break;
           case '3':
            showSubMenuProcASEEmCurso (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuProcASEEmCurso' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuProcASEAnteriores2023') {
        switch (lowerCaseMessage){
          case '1':
            showSubMenuASE20222 (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuASE20222' });
            break;
          case '2':
            showSubMenuASE20231 (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuASE20231' });
           break;
          case '3':
            showSubMenuAvaliacaoSocioeconomica (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuAvaliacaoSocioeconomica' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }


      } else if (conversation.momento === 'menuASE20222') {
        switch (lowerCaseMessage) {
          case '1':
            client.sendText(from, `Só um momento, estamos buscando a informação e pode demorar alguns minutos`).then(() =>{
            client.sendText(from, 'A Resultado / Validade ASE  pode ser verificada em: https://www.pr4.uerj.br/wp-content/uploads/2023/09/ASE-Resultado-Final-2020-e-2023.1_26.09.23.pdf').then(() =>{
            encerramentoConversa(client, from);
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
        }).catch((error) => {
            console.error('Erro ao enviar o link:', error);
            // Se houver um erro ao enviar o link, você pode querer lidar com isso aqui
        });
    }).catch((error) => {
        console.error('Erro ao enviar a mensagem inicial:', error);
        // Se houver um erro ao enviar a mensagem inicial, você pode querer lidar com isso aqui
    });  
            break;
          case '2':
            client.sendText(from, `Só um momento, estamos buscando a informação e pode demorar alguns minutos`).then(() =>{
            client.sendText(from, 'O Edital pode ser verificado em: https://www.pr4.uerj.br/wp-content/uploads/2023/03/Edital-de-Chamamento-Publico_Avaliacao-Socioeconomica-2022.2-com-Calendario.pdf').then(() =>{
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar o link:', error);
              // Se houver um erro ao enviar o link, você pode querer lidar com isso aqui
          });
      }).catch((error) => {
          console.error('Erro ao enviar a mensagem inicial:', error);
          // Se houver um erro ao enviar a mensagem inicial, você pode querer lidar com isso aqui
      });
            break;
          case '3':
            client.sendText(from, `Só um momento, estamos buscando a informação e pode demorar alguns minutos`).then(() =>{
            client.sendText(from, 'A instrucão normativa GRADUAÇÃO podem ser verificados em: https://www.pr4.uerj.br/wp-content/uploads/2023/03/Instrucao-Normativa-Avaliacao-Socioeconomica-2022.2-1-com-Calendario.pdf').then(() =>{
            encerramentoConversa(client, from);
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
        }).catch((error) => {
            console.error('Erro ao enviar o link:', error);
            // Se houver um erro ao enviar o link, você pode querer lidar com isso aqui
        });
    }).catch((error) => {
        console.error('Erro ao enviar a mensagem inicial:', error);
        // Se houver um erro ao enviar a mensagem inicial, você pode querer lidar com isso aqui
    });
            break;

          case '4':
            client.sendText(from, `Só um momento, estamos buscando a informação e pode demorar alguns minutos`).then(() =>{
            client.sendText(from, 'A instrucão normativa PÓS-GRADUAÇÃO podem ser verificados em: https://www.pr4.uerj.br/wp-content/uploads/2023/03/Instrucao-Normativa-Avaliacao-Socioeconomica-Pos-Graduacao-UERJ-e-UERJ-ZO-2022.2-2.pdf').then(() =>{
              encerramentoConversa(client, from);
              updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
          }).catch((error) => {
              console.error('Erro ao enviar o link:', error);
              // Se houver um erro ao enviar o link, você pode querer lidar com isso aqui
          });
      }).catch((error) => {
          console.error('Erro ao enviar a mensagem inicial:', error);
          // Se houver um erro ao enviar a mensagem inicial, você pode querer lidar com isso aqui
      });
            break;
            
          case '5':
            showSubMenuProcASEAnteriores2023 (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuProcASEAnteriores2023' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'menuASE20231') {
        switch (lowerCaseMessage) {
          case '1':
            client.sendText(from, `Só um momento, estamos buscando a informação e pode demorar alguns minutos`).then(() => {
              // A mensagem foi enviada com sucesso, agora envie o link
            client.sendText(from, 'A Resultado / Validade ASE pode ser verificada em: https://www.pr4.uerj.br/wp-content/uploads/2023/09/ASE-Resultado-Final-2020-e-2023.1_26.09.23.pdf').then(() => {
                  // O link também foi enviado com sucesso, agora encerre a conversa
                  encerramentoConversa(client, from);
                  updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
              }).catch((error) => {
                  console.error('Erro ao enviar o link:', error);
                  // Se houver um erro ao enviar o link, você pode querer lidar com isso aqui
              });
          }).catch((error) => {
              console.error('Erro ao enviar a mensagem inicial:', error);
              // Se houver um erro ao enviar a mensagem inicial, você pode querer lidar com isso aqui
          });
            break;
          case '2':
            client.sendText(from, `Só um momento, estamos buscando a informação e pode demorar alguns minutos`).then(() =>{
            client.sendText(from, 'O Edital pode ser verificado em: https://www.pr4.uerj.br/wp-content/uploads/2023/05/ASE-2023.1-Edital_de_Chamamento_Publico.pdf').then(() =>{
            encerramentoConversa(client, from);
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
        }).catch((error) => {
            console.error('Erro ao enviar o link:', error);
            // Se houver um erro ao enviar o link, você pode querer lidar com isso aqui
        });
    }).catch((error) => {
        console.error('Erro ao enviar a mensagem inicial:', error);
        // Se houver um erro ao enviar a mensagem inicial, você pode querer lidar com isso aqui
    });
            break;
          case '3':
            client.sendText(from, `Só um momento, estamos buscando a informação e pode demorar alguns minutos`).then(() =>{
            client.sendText(from, 'A instrucão normativa podem ser verificados em: https://www.pr4.uerj.br/wp-content/uploads/2023/08/ASE-2023.1_Instrucao-Normativa-e-Calendario-Oficial.pdf').then(() =>{
            encerramentoConversa(client, from);
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
        }).catch((error) => {
            console.error('Erro ao enviar o link:', error);
            // Se houver um erro ao enviar o link, você pode querer lidar com isso aqui
        });
    }).catch((error) => {
        console.error('Erro ao enviar a mensagem inicial:', error);
        // Se houver um erro ao enviar a mensagem inicial, você pode querer lidar com isso aqui
    });
            break;

          case '4':
            showSubMenuProcASEAnteriores2023 (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuProcASEAnteriores2023' });
            break;
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }

      } else if (conversation.momento === 'encerramentoConversa'){
        switch (lowerCaseMessage){
          case '1':
            showMainMenu (client, from);
            updateConversationState(from, { ...conversation, momento: 'menuInicial' });
            break;
          case '2':
            client.sendText(from, 'Ficamos muito felizes em lhe ajudar!')
           
            updateConversationState(from, { ...conversation, momento: 'encerramentoConversa' });
            break;
          
          default:
            client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
            break;
        }


      } else {
        // Se não estiver em nenhum submenu, informa a opção inválida
        client.sendText(from, 'Opção inválida. Por favor, selecione uma opção válida.');
      }
    }
  });
}
