from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__, static_folder='public')
CORS(app)

# Banco de dados simulado em memória
usuario_db = {
    "nome": "Usuário Ecológico",
    "saldoTotal": 0,
    "historico": [],
    "resgates": []
}

# Catálogo Expandido de Recompensas
recompensas_db = [
    {
        "id": 1,
        "titulo": "Desconto no Hortifruti Local",
        "descricao": "Cupom de R$ 15,00 para compras acima de R$ 50,00.",
        "custoPontos": 300,
        "icone": "🥦"
    },
    {
        "id": 2,
        "titulo": "Muda de Planta / Semente",
        "descricao": "Retire 1 muda de horta orgânica no Ecoponto da sua região.",
        "custoPontos": 200,
        "icone": "🌱"
    },
    {
        "id": 3,
        "titulo": "Ecobag de Algodão Cru",
        "descricao": "Sacola sustentável e retornável para feira e mercado.",
        "custoPontos": 500,
        "icone": "🛍️"
    },
    {
        "id": 4,
        "titulo": "Passe Livre de Transporte Público",
        "descricao": "1 passagem de ônibus municipal gratuita.",
        "custoPontos": 800,
        "icone": "🚌"
    },
    {
        "id": 5,
        "titulo": "Ingresso de Cinema Cult",
        "descricao": "Entrada para exibições e eventos de conscientização ambiental.",
        "custoPontos": 1000,
        "icone": "🎟️"
    },
    {
        "id": 6,
        "titulo": "Kit Canudo de Inox + Escova",
        "descricao": "Conjunto reutilizável com case para transporte.",
        "custoPontos": 400,
        "icone": "🥤"
    }
]

PONTOS_POR_KG = 100

# ==========================================
# ROTAS DA API
# ==========================================

@app.route('/api/usuario', methods=['GET'])
def obter_usuario():
    return jsonify(usuario_db)

@app.route('/api/descarte', methods=['POST'])
def registrar_descarte():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "Nenhum dado enviado."}), 400

    tipo_lixo = dados.get('tipoLixo')
    peso = dados.get('peso')
    ponto_coleta = dados.get('pontoColeta')

    if not tipo_lixo or peso is None or peso <= 0 or not ponto_coleta:
        return jsonify({"erro": "Por favor, preencha todos os campos corretamente."}), 400

    pontos_ganhos = int(round(peso * PONTOS_POR_KG))

    usuario_db["saldoTotal"] += pontos_ganhos
    
    novo_registro = {
        "id": int(datetime.now().timestamp() * 1000),
        "tipo": tipo_lixo,
        "peso": peso,
        "local": ponto_coleta,
        "pontosGanhos": pontos_ganhos,
        "data": datetime.now().strftime("%d/%m/%Y %H:%M")
    }
    
    usuario_db["historico"].insert(0, novo_registro)

    return jsonify({
        "mensagem": f"Descarte registrado! Você acumulou +{pontos_ganhos} pontos.",
        "usuario": usuario_db
    })

@app.route('/api/recompensas', methods=['GET'])
def listar_recompensas():
    return jsonify(recompensas_db)

@app.route('/api/resgatar', methods=['POST'])
def resgatar_recompensa():
    dados = request.get_json()
    recompensa_id = dados.get('recompensaId')

    recompensa = next((r for r in recompensas_db if r['id'] == recompensa_id), None)

    if not recompensa:
        return jsonify({"erro": "Recompensa não encontrada."}), 404

    if usuario_db["saldoTotal"] < recompensa["custoPontos"]:
        return jsonify({"erro": "Saldo insuficiente de pontos para este resgate."}), 400

    usuario_db["saldoTotal"] -= recompensa["custoPontos"]

    resgate = {
        "id": int(datetime.now().timestamp() * 1000),
        "titulo": recompensa["titulo"],
        "custoPontos": recompensa["custoPontos"],
        "data": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "codigoCupom": f"ECO-{usuario_db['saldoTotal']}{recompensa_id}-CUPOM"
    }

    usuario_db["resgates"].insert(0, resgate)

    return jsonify({
        "mensagem": f"Recompensa '{recompensa['titulo']}' resgatada com sucesso!",
        "usuario": usuario_db,
        "resgate": resgate
    })

import os

# (Mantenha todas as suas rotas e códigos anteriores do app.py aqui em cima)

if __name__ == '__main__':
    # O Render define a variável PORT no ambiente de produção
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)