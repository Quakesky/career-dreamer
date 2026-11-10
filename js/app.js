const formulario = document.querySelector('#form-perfil');
const modalTarde = document.querySelector('#modal-tarde');
const botaoFecharModal = document.querySelector('#fechar-modal');
const botaoEnviar = document.querySelector('#botao-enviar');

// Mesma chave usada pelo resultado.js
const CHAVE_RESULTADO =
  typeof CONFIG !== 'undefined' && CONFIG.CHAVE_RESULTADO
    ? CONFIG.CHAVE_RESULTADO
    : 'careerDreamer:resultado';

const PAGINA_RESULTADO = 'resultado.html'; // ajuste se o nome do arquivo for outro
const API_URL = 'https://google-career-dreamer-api.onrender.com/api/career-match';
const TEMPO_LIMITE_MS = 60000; // a API gratuita pode demorar ~30-60s para "acordar"

// Campo da API -> campo do formulário (para mostrar o erro no lugar certo)
const CAMPO_POR_API = { name: 'nome', hobbies: 'hobbies', interests: 'interesses' };
const MAX_ITENS = 10;       // máximo de hobbies / interesses
const MAX_TAMANHO_ITEM = 50; // máximo de caracteres por item

let enviando = false;

function abrirModalTarde() {
  if (modalTarde && typeof modalTarde.showModal === 'function') {
    modalTarde.showModal();
  } else {
    alert('Não foi possível gerar seu mapeamento agora. Tente novamente mais tarde.');
  }
}

if (botaoFecharModal && modalTarde) {
  botaoFecharModal.addEventListener('click', () => modalTarde.close());
}

/** "a, b,  , A" -> ["a", "b"] (sem vazios, sem repetidos, com limites). */
function separarLista(texto) {
  const vistos = new Set();
  const lista = [];
  for (const parte of texto.split(',')) {
    const item = parte.trim().slice(0, MAX_TAMANHO_ITEM);
    const chave = item.toLowerCase();
    if (item && !vistos.has(chave)) {
      vistos.add(chave);
      lista.push(item);
    }
  }
  return lista.slice(0, MAX_ITENS);
}

/** Mostra a mensagem no próprio campo (balão nativo, acessível) e leva o foco até ele. */
function invalidar(campo, mensagem) {
  campo.setCustomValidity(mensagem);
  campo.reportValidity();
  campo.focus();
}

class ErroApi extends Error {
  constructor(mensagem, status, detalhes) {
    super(mensagem);
    this.status = status;
    this.detalhes = Array.isArray(detalhes) ? detalhes : [];
  }
}

/** Envia o perfil para a API e devolve o JSON lido pelo resultado.js. */
async function gerarResultado(perfil) {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  try {
    const resposta = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: perfil.nome,
        hobbies: perfil.hobbies,
        interests: perfil.interesses, // a API espera "interests"
      }),
      signal: controle.signal,
    });

    let corpo = null;
    try {
      corpo = await resposta.json();
    } catch (e) {
      /* resposta sem JSON */
    }

    if (!resposta.ok) {
      throw new ErroApi((corpo && corpo.message) || `Erro ${resposta.status}`, resposta.status, corpo && corpo.details);
    }
    if (!corpo || !Array.isArray(corpo.recommended_careers) || corpo.recommended_careers.length === 0) {
      throw new ErroApi('Resposta inesperada da API', resposta.status);
    }
    return corpo;
  } finally {
    clearTimeout(timer);
  }
}

if (formulario) {
  // Ao digitar, limpa a mensagem de erro daquele campo
  formulario.addEventListener('input', (evento) => {
    if (evento.target && typeof evento.target.setCustomValidity === 'function') {
      evento.target.setCustomValidity('');
    }
  });

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (enviando) return;

    const campos = formulario.elements;
    const nome = campos.nome.value.trim();

    if (nome.length < 2 || nome.length > 60) {
      invalidar(campos.nome, 'O campo Nome deve ter entre 2 e 60 caracteres.');
      return;
    }

    const hobbies = separarLista(campos.hobbies.value);
    if (hobbies.length === 0) {
      invalidar(campos.hobbies, 'Informe pelo menos um hobby.');
      return;
    }

    const interesses = separarLista(campos.interesses.value);
    if (interesses.length === 0) {
      invalidar(campos.interesses, 'Informe pelo menos uma área de interesse.');
      return;
    }

    enviando = true;
    const textoOriginal = botaoEnviar ? botaoEnviar.textContent : '';
    if (botaoEnviar) {
      botaoEnviar.disabled = true;
      botaoEnviar.setAttribute('aria-busy', 'true');
      botaoEnviar.textContent = 'Analisando seu perfil...';
    }

    try {
      const resultado = await gerarResultado({ nome, hobbies, interesses });
      sessionStorage.setItem(CHAVE_RESULTADO, JSON.stringify(resultado));
      window.location.href = PAGINA_RESULTADO;
    } catch (erro) {
      console.error('Falha ao gerar o mapeamento:', erro);
      if (erro instanceof ErroApi && (erro.status === 400 || erro.status === 422)) {
        // Dados rejeitados pela API: mostra a mensagem no campo correspondente
        const detalhe = erro.detalhes[0] || {};
        const nomeApi = String(detalhe.field || '').split(/[.\[]/)[0];
        const campo = campos[CAMPO_POR_API[nomeApi]] || campos.nome;
        invalidar(campo, detalhe.message || erro.message);
      } else {
        // 429 (limite por minuto), 500, sem internet ou demora: "tente mais tarde"
        abrirModalTarde();
      }
    } finally {
      enviando = false;
      if (botaoEnviar) {
        botaoEnviar.disabled = false;
        botaoEnviar.removeAttribute('aria-busy');
        botaoEnviar.textContent = textoOriginal;
      }
    }
  });
}
