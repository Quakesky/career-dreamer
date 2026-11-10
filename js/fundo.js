/* ==========================================================================
   Fundo animado: nebulosa de partículas (ciano, azul e violeta)

   COMO USAR: basta incluir este arquivo no HTML (no <head> ou antes de </body>).
     <script src="fundo-nebulosa-v2.js" defer></script>
   Não precisa de CSS nem de <canvas> no HTML: o script cria tudo sozinho.
   (Se já existir um elemento com id="fundo-animado", ele é reaproveitado.)
   ========================================================================== */
(function () {
  'use strict';

  // ---- Ajustes rápidos ----------------------------------------------------
  var VELOCIDADE = 1.3;   // 0 = parado, 1 = normal, 2 = rápido
  // Se true, o fundo fica parado para quem desativou animações no sistema operacional.
  // Deixe false para a animação rodar sempre.
  var RESPEITAR_REDUCAO_DE_MOVIMENTO = false;
  var DENSIDADE  = 1;     // 1 = normal, 0.5 = metade das partículas (celular fraco)
  var BOKEH      = 45;    // bolinhas maiores e brilhantes

  function iniciar() {
    try {
      montar();
    } catch (erro) {
      console.error('[fundo-nebulosa] erro:', erro);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

  function montar() {
    // 1) Canvas: reaproveita #fundo-animado ou cria um novo
    var canvas = document.getElementById('fundo-animado');
    if (!canvas || canvas.tagName !== 'CANVAS') {
      var novo = document.createElement('canvas');
      novo.id = 'fundo-animado-canvas';
      if (canvas) { canvas.appendChild(novo); } else { document.body.insertBefore(novo, document.body.firstChild); }
      canvas = novo;
    }
    // Estilo inline: não depende de nenhum CSS externo
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.style.display = 'block';
    canvas.setAttribute('aria-hidden', 'true');

    var ctx = canvas.getContext('2d');
    var reduzir = RESPEITAR_REDUCAO_DE_MOVIMENTO && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2) Nuvens: posição (0–1), tamanho, rotação, cor RGB e peso
    var NUVENS = [
      { x: 0.74, y: 0.18, rx: 0.17, ry: 0.08, a: -0.5, c: '70,255,225',  w: 3.0 },
      { x: 0.60, y: 0.30, rx: 0.12, ry: 0.06, a: -0.7, c: '60,235,230',  w: 2.0 },
      { x: 0.88, y: 0.10, rx: 0.10, ry: 0.07, a: -0.3, c: '90,255,215',  w: 1.5 },
      { x: 0.40, y: 0.30, rx: 0.14, ry: 0.08, a:  0.2, c: '60,150,255',  w: 2.0 },
      { x: 0.26, y: 0.46, rx: 0.22, ry: 0.12, a: -0.2, c: '70,90,255',   w: 3.5 },
      { x: 0.10, y: 0.66, rx: 0.20, ry: 0.12, a: -0.4, c: '120,60,255',  w: 3.0 }
    ];
    var pesoTotal = 0;
    NUVENS.forEach(function (n) { pesoTotal += n.w; });

    var W = 0, H = 0, S = 1, dpr = 1;
    var grupos = [];   // partículas agrupadas por nuvem
    var bokehs = [];
    var sprites = [];
    var glows = [];   // brilho suave no corpo de cada nuvem

    function gauss() {
      return (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 1.2;
    }

    function criarSprite(rgb) {
      var c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      var x = c.getContext('2d');
      var gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0,    'rgba(' + rgb + ',1)');
      gr.addColorStop(0.35, 'rgba(' + rgb + ',0.75)');
      gr.addColorStop(1,    'rgba(' + rgb + ',0)');
      x.fillStyle = gr;
      x.fillRect(0, 0, 64, 64);
      return c;
    }

    function criarElementos() {
      var total = Math.min(14000, Math.round((W * H) / 70)) * DENSIDADE;
      grupos = NUVENS.map(function (n) {
        var qtd = Math.round(total * n.w / pesoTotal);
        var cos = Math.cos(n.a), sin = Math.sin(n.a);
        var lista = [];
        for (var k = 0; k < qtd; k++) {
          var gx = gauss() * n.rx, gy = gauss() * n.ry;
          lista.push({
            ox: gx * cos - gy * sin,
            oy: gx * sin + gy * cos,
            ph: Math.random() * 6.283,
            amp: 6 + Math.random() * 24,
            tam: Math.random() < 0.07 ? 1.8 : 0.7 + Math.random() * 0.8,
            alfa: 0.25 + Math.random() * 0.6
          });
        }
        return lista;
      });

      var cores = ['90,255,230', '80,200,255', '110,130,255', '190,230,255'];
      sprites = cores.map(criarSprite);
      glows = NUVENS.map(function (n) { return criarSprite(n.c); });
      bokehs = [];
      for (var i = 0; i < BOKEH; i++) {
        bokehs.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 2 + Math.random() * 5,
          vx: (Math.random() - 0.5) * 14,
          vy: -(10 + Math.random() * 28),
          s: Math.floor(Math.random() * cores.length),
          ph: Math.random() * 6.283
        });
      }
    }

    function redimensionar() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = Math.min(W, H) / 800;
      criarElementos();
    }

    function pintarFundo(alfa) {
      var gr = ctx.createLinearGradient(0, 0, W * 0.45, H);
      gr.addColorStop(0,   '#0b0522');
      gr.addColorStop(0.5, '#0d0a4f');
      gr.addColorStop(1,   '#1a0a8e');
      ctx.globalAlpha = alfa;
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, W, H);

      var v = ctx.createRadialGradient(0, H, 0, 0, H, Math.max(W, H) * 0.6);
      v.addColorStop(0, 'rgba(120,40,255,0.35)');
      v.addColorStop(1, 'rgba(120,40,255,0)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    function desenhar(t, dt, primeira) {
      ctx.globalCompositeOperation = 'source-over';
      pintarFundo(primeira ? 1 : 0.4);   // alfa < 1 deixa rastro suave de fumaça

      ctx.globalCompositeOperation = 'lighter';

      for (var i = 0; i < NUVENS.length; i++) {
        var n = NUVENS[i];
        var lista = grupos[i];
        var cx = (n.x + 0.07 * Math.sin(t * 0.20 + i * 1.7)) * W;
        var cy = (n.y + 0.07 * Math.cos(t * 0.17 + i * 2.3)) * H;
        var esc = 1 + 0.12 * Math.sin(t * 0.30 + i);
        // corpo brilhante da nuvem (dá o aspecto de fumaça luminosa)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(n.a);
        ctx.globalAlpha = 0.20;
        ctx.drawImage(glows[i], -n.rx * W * 2.6 * esc, -n.ry * H * 2.6 * esc, n.rx * W * 5.2 * esc, n.ry * H * 5.2 * esc);
        ctx.restore();
        ctx.fillStyle = 'rgb(' + n.c + ')';
        for (var k = 0; k < lista.length; k++) {
          var p = lista[k];
          var onda = 22 * S * Math.sin(p.oy * 9 + t * 0.6);
          var x = cx + p.ox * W * esc + onda + Math.sin(t * 0.5 + p.ph) * p.amp * S;
          var y = cy + p.oy * H * esc + Math.cos(t * 0.42 + p.ph * 1.3) * p.amp * S;
          ctx.globalAlpha = p.alfa;
          ctx.fillRect(x, y, p.tam, p.tam);
        }
      }
      ctx.globalAlpha = 1;

      for (var j = 0; j < bokehs.length; j++) {
        var b = bokehs[j];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.y < -20) { b.y = H + 20; b.x = Math.random() * W; }
        if (b.x < -20) b.x = W + 20;
        if (b.x > W + 20) b.x = -20;
        var pisca = 0.55 + 0.45 * Math.sin(t * 0.9 + b.ph);
        var d = b.r * 4 * (0.8 + 0.2 * pisca);
        ctx.globalAlpha = 0.35 + 0.5 * pisca;
        ctx.drawImage(sprites[b.s], b.x - d / 2, b.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    redimensionar();
    window.addEventListener('resize', function () {
      redimensionar();
      if (reduzir) desenhar(5, 0, true);
    });

    if (reduzir) { desenhar(5, 0, true); return; }  // respeita quem desativa animações

    var ultimo = performance.now();
    var t = 0;
    var primeira = true;
    function loop(agora) {
      var dt = Math.min((agora - ultimo) / 1000, 0.05) * VELOCIDADE;
      ultimo = agora;
      t += dt;
      desenhar(t, dt, primeira);
      primeira = false;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
})();
