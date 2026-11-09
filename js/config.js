const CONFIG = Object.freeze({
  API_URL: 'https://google-career-dreamer-api.onrender.com/api/career-match',
  TEMPO_LIMITE_MS: 60000,
  CHAVE_RESULTADO: 'careerDreamer:resultado',
});
```[cite: 1]

### O que vai acontecer agora com essa URL correta:
1. Quando você preencher o formulário e clicar em *"Descobrir minha carreira"*, o site vai enviar os seus dados direto para o servidor oficial da professora no Render[cite: 1].
2. Se o servidor estiver "dormindo" (inativo), ele pode demorar alguns segundos na primeira vez para acordar, mas agora ele vai responder de verdade com a inteligência artificial ou com o fallback do backend dela[cite: 1].
3. E com o código com fallback automático que ajustamos antes, caso o servidor da professora demore demais ou esteja offline, o seu site não quebra e exibe a simulação na hora para você não ficar travado!
