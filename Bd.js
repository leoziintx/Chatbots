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
async function verificarCPFBancoDeDados(cpf) {
    try {
        // Consulta SQL para verificar se o CPF existe na tabela Alunos
        const query = "SELECT CPF FROM Alunos WHERE CPF = ?";
        const result = await executarConsultaSQL(query, [cpf]);
        // Se o contador for maior que zero, significa que o CPF existe no banco de dados
        if(result[0]){
            return cpf;
        }
    } catch (error) {
        console.error("Erro ao verificar CPF no banco de dados:", error);
        return false; // Em caso de erro, retorna false por padrão
    }  
}

async function verificarDadosCPF(cpf) {
  try {
    // Consulta SQL para verificar se o CPF existe na tabela Alunos
    const query = "SELECT NOME,DESCRICAO,SITUACAO,MOTIVO FROM Alunos WHERE CPF = ?";
    const result = await executarConsultaSQL(query, [cpf]);

    // Se não houver resultado, retorna "CPF não encontrado"
    if (!result.length) {
      return "CPF não encontrado";
    }

    // Variável para armazenar a resposta
    const resposta = result.map(row => {
      return `*NOME:* ${row.NOME}\n\n*TIPO DO BENEFÍCIO:* ${row.DESCRICAO}\n\n*SITUAÇÃO:* ${row.SITUACAO}\n\n*MOTIVO:* ${row.MOTIVO}\n\n_______________________________________\n\n`;
    }).join('');

    return resposta;
  } catch (error) {
    console.error("CPF não encontrado no banco", error);
    return "CPF não encontrado"; // Em caso de erro, retorna "CPF não encontrado"
  }
}
module.exports = { db, executarConsultaSQL, verificarCPFBancoDeDados, verificarDadosCPF };
