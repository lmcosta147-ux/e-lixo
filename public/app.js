// URL apontando explicitamente para o IP do Flask
const API_URL = 'http://127.0.0.1:5000/api';

// Seleção de elementos do DOM
const formDescarte = document.getElementById('formDescarte');
const saldoTotalEl = document.getElementById('saldoTotal');
const listaHistoricoEl = document.getElementById('listaHistorico');
const mensagemEl = document.getElementById('mensagem');

// 1. Atualiza os elementos da tela
function atualizarInterface(usuario) {
  if (!usuario) return;

  // Atualiza saldo total
  if (saldoTotalEl) {
    saldoTotalEl.innerText = usuario.saldoTotal || 0;
  }

  // Atualiza a lista de histórico
  if (listaHistoricoEl) {
    listaHistoricoEl.innerHTML = '';

    if (!usuario.historico || usuario.historico.length === 0) {
      listaHistoricoEl.innerHTML = '<li class="vazio">Nenhum descarte registrado ainda.</li>';
      return;
    }

    usuario.historico.forEach(item => {
      const li = document.createElement('li');
      li.className = 'historico-item';
      li.innerHTML = `
        <div class="item-info">
          <strong>${item.tipo} (${item.peso} kg)</strong>
          <small>${item.local} • ${item.data}</small>
        </div>
        <span class="item-pontos">+${item.pontosGanhos} pts</span>
      `;
      listaHistoricoEl.appendChild(li);
    });
  }
}

// 2. Busca dados Iniciais no Backend (GET)
async function carregarDadosUsuario() {
  try {
    const resposta = await fetch(`${API_URL}/usuario`);
    if (resposta.ok) {
      const usuario = await resposta.json();
      console.log('✅ Conectado ao Flask! Dados recebidos:', usuario);
      atualizarInterface(usuario);
    }
  } catch (erro) {
    console.error('❌ Erro de Conexão:', erro);
    if (mensagemEl) {
      mensagemEl.style.color = '#e53e3e';
      mensagemEl.innerText = 'Servidor Python fora do ar ou inacessível.';
    }
  }
}

// 3. Envio do Formulário de Descarte (POST)
if (formDescarte) {
  formDescarte.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dadosEnvio = {
      tipoLixo: document.getElementById('tipoLixo').value,
      peso: parseFloat(document.getElementById('peso').value),
      pontoColeta: document.getElementById('pontoColeta').value
    };

    try {
      const resposta = await fetch(`${API_URL}/descarte`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosEnvio)
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        if (mensagemEl) {
          mensagemEl.style.color = '#2e7d32';
          mensagemEl.innerText = resultado.mensagem;
        }
        // Atualiza a interface com os novos pontos e histórico
        atualizarInterface(resultado.usuario);
        formDescarte.reset();
      } else {
        if (mensagemEl) {
          mensagemEl.style.color = '#e53e3e';
          mensagemEl.innerText = resultado.erro || 'Erro ao processar requisição.';
        }
      }
    } catch (erro) {
      console.error('❌ Erro no envio:', erro);
      if (mensagemEl) {
        mensagemEl.style.color = '#e53e3e';
        mensagemEl.innerText = 'Servidor Python fora do ar ou inacessível.';
      }
    }
  });
 // ... (código existente do seu arquivo script.js) ...

// Cole no final do arquivo:
async function reiniciarHistorico() {
    const confirmacao = confirm("Tem certeza de que deseja apagar todo o histórico de descartes e zerar seus pontos?");
    if (!confirmacao) return;

    try {
        const resposta = await fetch('/api/reset', { method: 'POST' });
        const dados = await resposta.json();

        if (resposta.ok) {
            alert(dados.mensagem);
            window.location.reload();
        } else {
            alert("Erro ao reiniciar histórico: " + (dados.erro || "Tente novamente."));
        }
    } catch (erro) {
        console.error("Erro na requisição:", erro);
        alert("Ocorreu um erro ao tentar conectar com o servidor.");
    }
}
}

// Inicializa a chamada ao carregar a página
carregarDadosUsuario();