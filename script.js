const celulas = document.querySelectorAll('[data-celula]');
const tabuleiro = document.getElementById('tabuleiro');
const botaoReiniciar = document.getElementById('botaoReiniciar');
const seletorModoJogo = document.getElementById('modoJogo');
const mensagem = document.getElementById('mensagem');
const mostradorDeVez = document.getElementById('mostradorDeVez');
const CLASSE_X = 'x';
const CLASSE_O = 'o';
let turnoO;
let modoJogo = 'jogador'; 

const COMBINACOES_VITORIA = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

seletorModoJogo.addEventListener('change', (e) => setModoJogo(e.target.value));
botaoReiniciar.addEventListener('click', iniciarJogo);

function setModoJogo(modo) {
    modoJogo = modo;
    iniciarJogo();
}

function iniciarJogo() {
    turnoO = false;
    celulas.forEach(celula => {
        celula.classList.remove(CLASSE_X);
        celula.classList.remove(CLASSE_O);
        celula.innerHTML = '';
        celula.removeEventListener('click', handleClick);
        celula.addEventListener('click', handleClick, { once: true });
    });
    mensagem.innerText = '';
    atualizarMostradorDeVez();
}

function handleClick(e) {
    const celula = e.target;
    if (celula.classList.contains(CLASSE_X) || celula.classList.contains(CLASSE_O)) {
        return; // Célula já ocupada
    }
    const classeAtual = turnoO ? CLASSE_O : CLASSE_X;
    colocarMarca(celula, classeAtual);
    if (verificarVitoria(classeAtual)) {
        finalizarJogo(false, classeAtual);
    } else if (verificarEmpate()) {
        finalizarJogo(true);
    } else {
        trocarTurno();
        atualizarMostradorDeVez();
        if (modoJogo !== 'jogador') {
            setTimeout(jogadaMaquina, 500); 
        }
    }
}

function colocarMarca(celula, classeAtual) {
    celula.classList.add(classeAtual);
    celula.innerHTML = classeAtual === CLASSE_X ? 'X' : 'O';
}

function trocarTurno() {
    turnoO = !turnoO;
}

function atualizarMostradorDeVez() {
    mostradorDeVez.innerText = `Vez do jogador: ${turnoO ? '"O"' : '"X"'}`;
}

function verificarVitoria(classeAtual) {
    return COMBINACOES_VITORIA.some(combinacao => {
        return combinacao.every(index => {
            return celulas[index].classList.contains(classeAtual);
        });
    });
}

function verificarEmpate() {
    return [...celulas].every(celula => {
        return celula.classList.contains(CLASSE_X) || celula.classList.contains(CLASSE_O);
    });
}

function finalizarJogo(empate, classeAtual) {
    if (empate) {
        mensagem.innerText = 'Empate! Ninguém venceu.';
    } else {
        mensagem.innerText = `O jogador ${classeAtual === CLASSE_X ? '"X"' : '"O"'} venceu!`;
        efeitoDeConfetes();
    }
    desativarCelulas();
}

function desativarCelulas() {
    celulas.forEach(celula => {
        celula.removeEventListener('click', handleClick);
    });
}

function jogadaMaquina() {
    if (modoJogo === 'facil') {
        jogadaAleatoria();
    } else if (modoJogo === 'medio') {
        jogadaMedia();
    } else if (modoJogo === 'dificil') {
        jogadaMinimax();
    }
}

function jogadaAleatoria() {
    const celulasDisponiveis = [...celulas].filter(celula => !celula.classList.contains(CLASSE_X) && !celula.classList.contains(CLASSE_O));
    const celulaEscolhida = celulasDisponiveis[Math.floor(Math.random() * celulasDisponiveis.length)];
    colocarMarca(celulaEscolhida, CLASSE_O);
    if (verificarVitoria(CLASSE_O)) {
        finalizarJogo(false, CLASSE_O);
    } else if (verificarEmpate()) {
        finalizarJogo(true);
    } else {
        trocarTurno();
        atualizarMostradorDeVez();
    }
}

function jogadaMedia() {
    for (const combinacao of COMBINACOES_VITORIA) {
        const [a, b, c] = combinacao;
        const cells = [celulas[a], celulas[b], celulas[c]];
        const marcas = cells.map(cell => cell.classList.contains(CLASSE_O) ? CLASSE_O : (cell.classList.contains(CLASSE_X) ? CLASSE_X : null));

        if (marcas.filter(marca => marca === CLASSE_O).length === 2 && marcas.includes(null)) {
            const index = marcas.indexOf(null);
            colocarMarca(cells[index], CLASSE_O);
            if (verificarVitoria(CLASSE_O)) {
                finalizarJogo(false, CLASSE_O);
            } else if (verificarEmpate()) {
                finalizarJogo(true);
            } else {
                trocarTurno();
                atualizarMostradorDeVez();
            }
            return;
        }
    }

    for (const combinacao of COMBINACOES_VITORIA) {
        const [a, b, c] = combinacao;
        const cells = [celulas[a], celulas[b], celulas[c]];
        const marcas = cells.map(cell => cell.classList.contains(CLASSE_O) ? CLASSE_O : (cell.classList.contains(CLASSE_X) ? CLASSE_X : null));

        if (marcas.filter(marca => marca === CLASSE_X).length === 2 && marcas.includes(null)) {
            const index = marcas.indexOf(null);
            colocarMarca(cells[index], CLASSE_O);
            if (verificarVitoria(CLASSE_O)) {
                finalizarJogo(false, CLASSE_O);
            } else if (verificarEmpate()) {
                finalizarJogo(true);
            } else {
                trocarTurno();
                atualizarMostradorDeVez();
            }
            return;
        }
    }
    jogadaAleatoria();
}

function jogadaMinimax() {
    const melhorMovimento = minimax(tabuleiro, CLASSE_O).index;
    colocarMarca(celulas[melhorMovimento], CLASSE_O);
    if (verificarVitoria(CLASSE_O)) {
        finalizarJogo(false, CLASSE_O);
    } else if (verificarEmpate()) {
        finalizarJogo(true);
    } else {
        trocarTurno();
        atualizarMostradorDeVez();
    }
}

function minimax(tabuleiro, jogador) {
    const celulasDisponiveis = [...celulas].filter(celula => !celula.classList.contains(CLASSE_X) && !celula.classList.contains(CLASSE_O));

    if (verificarVitoria(CLASSE_X)) {
        return { score: -10 };
    } else if (verificarVitoria(CLASSE_O)) {
        return { score: 10 };
    } else if (celulasDisponiveis.length === 0) {
        return { score: 0 };
    }

    const movimentos = [];
    for (let i = 0; i < celulasDisponiveis.length; i++) {
        const movimento = {};
        movimento.index = [...celulas].indexOf(celulasDisponiveis[i]);
        celulasDisponiveis[i].classList.add(jogador);
        
        if (jogador === CLASSE_O) {
            const resultado = minimax(tabuleiro, CLASSE_X);
            movimento.score = resultado.score;
        } else {
            const resultado = minimax(tabuleiro, CLASSE_O);
            movimento.score = resultado.score;
        }

        celulasDisponiveis[i].classList.remove(jogador);
        movimentos.push(movimento);
    }

    let melhorMovimento;
    if (jogador === CLASSE_O) {
        let melhorScore = -Infinity;
        for (let i = 0; i < movimentos.length; i++) {
            if (movimentos[i].score > melhorScore) {
                melhorScore = movimentos[i].score;
                melhorMovimento = i;
            }
        }
    } else {
        let melhorScore = Infinity;
        for (let i = 0; i < movimentos.length; i++) {
            if (movimentos[i].score < melhorScore) {
                melhorScore = movimentos[i].score;
                melhorMovimento = i;
            }
        }
    }

    return movimentos[melhorMovimento];
}

function efeitoDeConfetes() {
  var duration = 15 * 210;
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  var interval = setInterval(function () {
      var timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
          clearInterval(interval);
      }
      var particleCount = 50 * (timeLeft / duration);
      confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
      });
  }, 250);
}

document.addEventListener('DOMContentLoaded', iniciarJogo);