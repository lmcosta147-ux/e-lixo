const API_URL = 'http://127.0.0.1:5000/api';

const saldoTotalEl = document.getElementById('saldoTotal');
const gridRecompensasEl = document.getElementById('gridRecompensas');
const listaResgatesEl = document.getElementById('listaResgates');
const mensagemEl = document.getElementById('mensagem');

let saldoAtual = 0;

// Atualiza a interface
function atualizarInterface(usuario) {
  if (!usuario) return;

  saldoAtual = usuario.saldoTotal || 0;
  if (saldoTotalEl) saldoTotalEl.innerText = saldoAtual;

  // Atualiza cupons resgatados
  if (listaResgatesEl) {
    listaResgatesEl.innerHTML = '';

    if (!usuario.resgates || usuario.resgates.length === 0) {
      listaResgatesEl.innerHTML = '<li class="vazio">Nenhum cupom resgatado ainda.</li>';
      return;
    }

    usuario.resgates.forEach(item => {
      const li = document.createElement('li');
      li.className = 'historico-item';
      li.innerHTML = `
        <div class="item-info">
          <strong>${item.titulo}</strong>
          <small>Código: <code>${item.codigoCupom}</code> • ${item.data}</small>
        </div>
        <span class="item-pontos" style="background: #e3f2fd; color: #1976d2;">-${item.custoPontos} pts</span>
      `;
      listaResgatesEl.appendChild(li);
    });
  }
}

// Carrega as Recompensas disponíveis
async function carregarRecompensas() {
  try {
    const res = await fetch(`${API_URL}/recompensas`);
    const recompensas = await res.json();

    gridRecompensasEl.innerHTML = '';

    recompensas.forEach(rec => {
      const card = document.createElement('div');
      card.className = 'recompensa-card';
      card.innerHTML = `
        <div class="recompensa-icone">${rec.icone}</div>
        <div class="recompensa-detalhes">
          <h3>${rec.titulo}</h3>
          <p>${rec.descricao}</p>
          <div class="recompensa-footer">
            <span class="custo-pontos">${rec.custoPontos} pontos</span>
            <button onclick="resgatarItem(${rec.id})" class="btn-resgatar">Resgatar</button>
          </div>
        </div>
      `;
      gridRecompensasEl.appendChild(card);
    });
  } catch (erro) {
    console.error('Erro ao buscar recompensas:', erro);
  }
}

// Executa o resgate
async function resgatarItem(recompensaId) {
  try {
    const resposta = await fetch(`${API_URL}/resgatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recompensaId })
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      mensagemEl.style.color = '#2e7d32';
      mensagemEl.innerText = resultado.mensagem;
      atualizarInterface(resultado.usuario);
    } else {
      mensagemEl.style.color = '#e53e3e';
      mensagemEl.innerText = resultado.erro;
    }
  } catch (erro) {
    mensagemEl.style.color = '#e53e3e';
    mensagemEl.innerText = 'Erro ao se conectar ao servidor.';
  }
}

// Inicializa dados do usuário e recompensas
async function iniciar() {
  try {
    const res = await fetch(`${API_URL}/usuario`);
    if (res.ok) {
      const usuario = await res.json();
      atualizarInterface(usuario);
    }
  } catch (err) {
    console.error('Servidor offline:', err);
  }
  carregarRecompensas();
}

iniciar();