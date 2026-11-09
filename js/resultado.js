const secaoResultado = document.querySelector('#resultado');
const secaoSemResultado = document.querySelector('#sem-resultado');
const nomeUsuarioEl = document.querySelector('#nome-usuario');
const sinteseEl = document.querySelector('#sintese');
const listaCarreirasEl = document.querySelector('#lista-carreiras');
const templateCarreira = document.querySelector('#modelo-carreira');

function carregarDados() {
  const chave = (typeof CONFIG !== 'undefined' && CONFIG.CHAVE_RESULTADO) ? CONFIG.CHAVE_RESULTADO : 'careerDreamer:resultado';
  const dadosSalvos = sessionStorage.getItem(chave);
  
  if (dadosSalvos) {
    try {
      return JSON.parse(dadosSalvos);
    } catch (e) {
      console.error('Erro ao analisar dados salvos:', e);
    }
  }

  // Fallback de exemplo caso não haja dados salvos na sessão
  return {
    user_name: "Aline Santos (Exemplo)",
    career_identity_statement: "Olá! Este é um perfil de exemplo demonstrando o mapeamento vocacional gerado pelo sistema.",
    recommended_careers: [
      {
        id: "desenvolvedor-frontend",
        title: "Desenvolvedor(a) Front-End",
        match_score: 96,
        summary: "Cria interfaces web interativas, responsivas e modernas.",
        key_skills: ["JavaScript", "HTML5", "CSS3", "React"],
        learning_path: ["Lógica", "JavaScript moderno", "Frameworks"]
      }
    ]
  };
}

function inicializar() {
  const dados = carregarDados();

  // Força sempre a exibição da seção de resultados e esconde a mensagem de erro
  if (secaoSemResultado) secaoSemResultado.hidden = true;
  if (secaoResultado) secaoResultado.hidden = false;

  if (nomeUsuarioEl) {
    nomeUsuarioEl.textContent = `Perfil de ${dados.user_name || 'Usuário'}`;
  }
  if (sinteseEl) {
    sinteseEl.textContent = dados.career_identity_statement || '';
  }

  if (listaCarreirasEl && templateCarreira && Array.isArray(dados.recommended_careers)) {
    listaCarreirasEl.innerHTML = '';

    dados.recommended_careers.forEach((carreira, indice) => {
      const clone = templateCarreira.content.cloneNode(true);

      const li = clone.querySelector('li');
      const selo = clone.querySelector('.carreira__selo');
      const titulo = clone.querySelector('.carreira__titulo');
      const percentual = clone.querySelector('.carreira__percentual');
      const barraNivel = clone.querySelector('.barra__nivel');
      const barraContainer = clone.querySelector('.barra');
      const resumo = clone.querySelector('.carreira__resumo');
      const chipsList = clone.querySelector('.chips');
      const roteiroList = clone.querySelector('.roteiro');

      if (indice === 0) {
        if (li) li.classList.add('carreira--principal');
        if (selo) selo.hidden = false;
      } else {
        if (selo) selo.hidden = true;
      }

      if (titulo) titulo.textContent = carreira.title || '';
      const nota = carreira.match_score ?? 0;
      if (percentual) percentual.textContent = `${nota}%`;
      if (barraNivel) barraNivel.style.setProperty('--nivel', `${nota}%`);
      if (barraContainer) {
        barraContainer.setAttribute('aria-valuenow', nota);
      }
      if (resumo) resumo.textContent = carreira.summary || '';

      if (chipsList && Array.isArray(carreira.key_skills)) {
        chipsList.innerHTML = '';
        carreira.key_skills.forEach((skill) => {
          const chipLi = document.createElement('li');
          chipLi.textContent = skill;
          chipsList.appendChild(chipLi);
        });
      }

      if (roteiroList && Array.isArray(carreira.learning_path)) {
        roteiroList.innerHTML = '';
        carreira.learning_path.forEach((passo) => {
          const passoLi = document.createElement('li');
          passoLi.textContent = passo;
          roteiroList.appendChild(passoLi);
        });
      }

      listaCarreirasEl.appendChild(clone);
    });
  }
}

document.addEventListener('DOMContentLoaded', inicializar);
