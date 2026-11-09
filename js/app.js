const formulario = document.querySelector('#form-perfil');
const modalTarde = document.querySelector('#modal-tarde');
const botaoFecharModal = document.querySelector('#fechar-modal');
const botaoEnviar = document.querySelector('#botao-enviar');

function abrirModalTarde() {
  if (modalTarde && typeof modalTarde.showModal === 'function') {
    modalTarde.showModal();
  }
}

if (botaoFecharModal) {
  botaoFecharModal.addEventListener('click', () => {
    modalTarde.close();
  });
}

if (modalTarde) {
  modalTarde.addEventListener('cancel', () => {
    modalTarde.close();
  });
}

if (formulario) {
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const campos = formulario.elements;
    const nome = campos.nome.value.trim();
    const hobbiesRaw = campos.hobbies.value;
    const interessesRaw = campos.interesses.value;

    if (!nome || nome.length < 2 || nome.length > 60) {
      alert('O campo Nome deve ter entre 2 e 60 caracteres.');
      campos.nome.focus();
      return;
    }

    const hobbies = hobbiesRaw.split(',').map((item) => item.trim()).filter(Boolean);
    const interesses = interessesRaw.split(',').map((item) => item.trim()).filter(Boolean);

    if (hobbies.length === 0 || interesses.length === 0) {
      alert('Preencha pelo menos um hobby e uma área de interesse.');
      return;
    }

    // Exibe diretamente o modal de aviso "Tente mais tarde" ao enviar
    abrirModalTarde();
  });
}
