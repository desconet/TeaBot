# 🤖 NFT Tracker Bot

Bot Discord que monitora carteiras Ethereum e notifica compras/vendas de NFTs em tempo real, igual ao CoffeeBot.

---

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- Conta no [Discord Developer Portal](https://discord.com/developers/applications)
- API Key gratuita da [Etherscan](https://etherscan.io/apis)

---

## ⚙️ Configuração Passo a Passo

### 1. Clone e instale as dependências
```bash
npm install
```

### 2. Configure as variáveis de ambiente
Renomeie `.env.example` para `.env` e preencha:

```env
DISCORD_TOKEN=     # Token do bot (Discord Developer Portal)
CLIENT_ID=         # ID do bot (Application ID no portal)
GUILD_ID=          # ID do seu servidor Discord
ETHERSCAN_API_KEY= # Sua API Key da Etherscan
DEFAULT_CHANNEL_ID=# ID do canal padrão de notificações
```

#### Como pegar cada valor:
- **DISCORD_TOKEN**: [discord.com/developers](https://discord.com/developers/applications) → Seu App → Bot → Reset Token
- **CLIENT_ID**: [discord.com/developers](https://discord.com/developers/applications) → Seu App → Application ID
- **GUILD_ID**: No Discord, clique com botão direito no seu servidor → Copiar ID (ative Modo Desenvolvedor em Configurações → Avançado)
- **ETHERSCAN_API_KEY**: [etherscan.io/myapikey](https://etherscan.io/myapikey) → Add (gratuito)

### 3. Convide o bot para seu servidor
No Developer Portal → OAuth2 → URL Generator:
- Marque: `bot` + `applications.commands`
- Permissões: `Send Messages`, `Embed Links`, `View Channels`
- Copie a URL gerada e abra no navegador

### 4. Registre os comandos Slash
```bash
node src/deploy-commands.js
```

### 5. Inicie o bot
```bash
npm start
```

---

## 💬 Comandos

| Comando | Descrição |
|---|---|
| `/addwallet` | Adiciona uma carteira para monitorar |
| `/removewallet` | Remove uma carteira do monitoramento |
| `/listwallets` | Lista todas as carteiras monitoradas |

### Exemplos de uso:
```
/addwallet address:0x71F9... label:pastel canal:#nft-pastel
/removewallet address:0x71F9...
/listwallets
```

---

## 🚀 Hospedagem Gratuita no Railway

1. Suba o projeto no GitHub
2. Acesse [railway.app](https://railway.app) e faça login com GitHub
3. New Project → Deploy from GitHub repo
4. Vá em Variables e adicione as variáveis do `.env`
5. Pronto! O bot ficará online 24/7

---

## 📁 Estrutura do Projeto

```
nft-tracker-bot/
├── src/
│   ├── index.js          # Arquivo principal
│   ├── tracker.js        # Lógica de monitoramento (Etherscan)
│   ├── walletManager.js  # Gerenciamento de carteiras (JSON)
│   ├── deploy-commands.js# Registra os slash commands
│   └── commands/
│       ├── addwallet.js
│       ├── removewallet.js
│       └── listwallets.js
├── data/
│   └── wallets.json      # Carteiras salvas (gerado automaticamente)
├── .env.example
├── package.json
└── README.md
```

---

## ⚠️ Limites da API Etherscan Gratuita

- 5 requests/segundo
- 100.000 requests/dia

Para muitas carteiras, considere espaçar as verificações aumentando o `POLL_INTERVAL` em `tracker.js`.
