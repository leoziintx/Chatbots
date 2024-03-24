// menu.js

// Função para exibir o menu principal
function showMainMenu(client, from) {
  const menuText = `
Selecione a opção desejada!
*1* - Assistência Estudantil
*2* - Auxílios e Bolsas
*3* - Normativos
*4* - Eventos
`;
  
  return client.sendText(from, menuText, { isForwarded: true });
}

// Submenu da Assistência Estudantil
function showSubMenuAssistenciaEstudantil(client, from) {
  const submenuText = `
Assistência Estudantil:
*1* - Avaliação Socioeconômica
*2* - Dados Bancários
*3* - Atividades de Apoio Acadêmico
*4* - Passe Livre Universitário
*5* - Reavaliação Socioeconômica
*6* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}


function showSubMenuReavaliacaoSocioeconomica(client, from) {
  const submenuText = `
Reavaliação Socioeconomica:
*1* - Informações gerais
*2* - Normas
*3* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubMenuPasseLivreUniversitário(client, from) {
  const submenuText = `
Passe Livre Universitário:
*1* - Informações gerais
*2* - Informações sobre o Cartão do Passe Livre
*3* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubMenuInformacaoCartãoPasseLivre(client, from) {
  const submenuText = `
Você deseja:
*1* - Como Adquirir o Passe Livre Universitário
*2* - Como Renovar o Passe Livre Universitário
*3* - 2ª Via do Passe Livre Universitário
*4* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}


function showSubMenuAtividadesApoioAcadêmico(client, from) {
  const submenuText = `
Atividades de Apoio Acadêmico:
*1* - Informações gerais
*2* - Atividades acadêmicas e pedagógicas
*3* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubDadosBancarios(client, from) {
  const submenuText = `
Dados Bancários:
*1* - Informações gerais
*2* - Estudante da Graduação
*3* - Estudante da Pós Graduação
*4* - Estudante do Cap Uerj
*5* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

function encerramentoConversa(client, from) {
  const submenuText = `
Posso ajudar em algo mais?
*1* - Sim
*2* - Não
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}


function encerramentoConversa(client, from) {
  const submenuText = `
Posso ajudar em algo mais?
*1* - Sim
*2* - Não
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

// Submenu para a Avaliação Socioeconômica
function showSubMenuAvaliacaoSocioeconomica(client, from) {
  const submenuText = `
Você é aluno de:
*1* - Ampla Concorrência
*2* - Reserva de Vagas
*3* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubMenuProcAvaliacaoSocioeconomica(client, from) {
  const submenuText = `
Avaliação Socioeconômica:
*1* - Processos ASE anteriores a 2023.2
*2* - Processos ASE em curso 2023.2
*3* - Processos ASE 2024.1
*4* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubMenuProcASEEmCurso(client, from) {
  const submenuText = `
Deseja vererificar:
*1* - Edital
*2* - Instrução Normativa
*3* - Tutotial
*4* - Calendário
*5* - Validação de inscrição
*6* - 1º Resultado
*7* - Recurso para inscrição
*8* - Resultado final
*9* - Voltar ao menu anterior
`

  return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubMenuInscricao(client, from) {
  const submenuText = `
Deseja verificar:
*1* - Inscrição em curso
*2* - Verificar inscrição
*3* - Voltar ao menu anterior
`;

return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubMenuRecursoInscricao(client, from) {
  const submenuText = `
Deseja verificar:
*1* - Recurso em curso
*2* - Validação do recurso
*3* - Voltar ao menu anterior
`;

return client.sendText(from, submenuText, { isForwarded: true });
}


function showSubMenuProcASEAnteriores2023(client, from) {
  const submenuText = `
Deseja ver o processo:
*1* - ASE 2022.2
*2* - ASE 2023.1
*3* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}


function showSubMenuASE20231(client, from) {
  const submenuText = `
Processos ASE Anteriores:
*1* - Resultado / Validade
*2* - Edital 
*3* - Instrucão Normativa
*4* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubMenuASE20222(client, from) {
  const submenuText = `
Processos ASE Anteriores:
*1* - Resultado / Validade
*2* - Edital 
*3* - Instrucão Normativa GRADUAÇÃO
*4* - Instrucão Normativa PÓS-GRADUAÇÃO
*5* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

// Submenu para Auxílios e Bolsas
function showSubMenuAuxiliosEBolsas(client, from) {
  const submenuText = `
Auxílios e Bolsas:
*1* - Bolsa Permanência
*2* - Auxílio material didático
*3* - Auxílio Alimentação
*4* - Auxílio Transporte
*5* - Auxílio Creche
*6* - Auxílio Uniforme escolar
*7* - Bolsa apoio à vulnerabilidade social
*8* - Bolsa Permanência da PÓS-GRADUAÇÃO
*9* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubMenuAuxilioAlimentacao(client, from) {
  const submenuText = `
Auxílio Alimentação:
*1* - Informações Gerais
*2* - Normativos
*3* - Calendário
*4* - resultados
*5* - Formulário
*6* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubMenuAuxilioAlimentacaoResultados(client, from) {
  const submenuText = `
Auxílio Alimentação:
*1* - Resultados 2024
*2* - Resultados 2023
*3* - Resultados 2022
*4* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubMenuAuxilioAlimentacaoNormativos(client, from) {
  const submenuText = `
Auxílio Alimentação:
*1* - AEDA 005/Reitoria/2022
*2* - AEDA 001/Reitoria/2024
*3* - Edital PR4 003/2023
*4* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubMenuBolsaPermanencia(client, from) {
  const submenuText = `
  Bolsa Permanência:
  *1* - Informações Gerais
  *2* - Critérios para receber a Bolsa Permanência
  *3* - valor da Bolsa Permanência
  *4* - Qualificação para Bolsa Permanência
  *5* - Como receber a Bolsa Permanência
  *6* - Normativos
  *7* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubMenuMaterialDidatico(client, from) {
const submenuText = `
Auxílio material didático:
*1* - Informações Gerais
*2* - Critérios para receber o Auxílio Material Didático
*3* - valor do Auxílio Material Didático
*4* - Qualificação para o Auxílio Material Didático
*5* - Calendário
*6* - Normativos
*7* - Resultados
*8* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}

function showSubMenuMaterialDidaticoResultados(client, from) {
  const submenuText = `
  Auxílio material didático Resultados:
  *1* - Resultados 2023.2
  *2* - Resultados 2023.1
  *3* - Resultados 2022.2
  *4* - Voltar ao menu anterior
  `
    return client.sendText(from, submenuText, { isForwarded: true });
  }
  
function showSubMenuMaterialDidaticoResultados20232(client, from) {
  const submenuText = `
  Auxílio material didático Resultados:
  *1* - AMD  Resultado Graduação
  *2* - AMD  Resultado CAP
  *3* - Voltar ao menu anterior
   `
      return client.sendText(from, submenuText, { isForwarded: true });
    }
function showSubMenuMaterialDidaticoResultados20231(client, from) {
  const submenuText = `
  Auxílio material didático Resultados:
  *1* - AMD Resultado Graduação e Educação Básica (CAp-UERJ)
  *2* - Voltar ao menu anterior
   `
    return client.sendText(from, submenuText, { isForwarded: true });
  }
function showSubMenuMaterialDidaticoResultados20221(client, from) {
  const submenuText = `
  Auxílio material didático Resultados:
  *1* - AMD Resultado Graduação
  *2* - AMD Resultado CAP
  *3* - Voltar ao menu anterior
   `
  return client.sendText(from, submenuText, { isForwarded: true });
    }

function showSubMenuCalendario(client, from){
  const submenuText = `
  *1* - Calendário Graduação
  *2* - Calendário CAp-UERJ
  *3* - Voltar ao menu anterior
  `;
  return client.sendText(from, submenuText, { isForwarded: true });
}


function showSubMenuBolsaPermanenciaNormativos(client, from) {
  const submenuText = `
  Bolsa Permanência:
  *1* - 09/2019 – Dispõe sobre a Bolsa Permanência.
  *2* - 32/2016 – Dispõe sobre a Bolsa Permanência para Alunos da Educação Básica.
  *3* - 72/2022 – Altera o AEDA 009/2019 da Bolsa Permanência.
  *4* - Voltar ao menu anterior
`;

  return client.sendText(from, submenuText, { isForwarded: true });
}


module.exports = {
  showMainMenu,
  showSubMenuAssistenciaEstudantil,
  showSubMenuAvaliacaoSocioeconomica,
  showSubMenuInformacaoCartãoPasseLivre,
  showSubMenuReavaliacaoSocioeconomica,
  showSubMenuAtividadesApoioAcadêmico,
  showSubMenuPasseLivreUniversitário,
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
};
