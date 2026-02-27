const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/wallets.json');

// Garante que o arquivo existe
function ensureFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}));
  }
}

function getWallets() {
  ensureFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveWallets(data) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function addWallet(address, label, channelId) {
  const wallets = getWallets();
  const key = address.toLowerCase();

  if (wallets[key]) return false; // já existe

  wallets[key] = {
    address: address.toLowerCase(),
    label: label || address.slice(0, 6) + '...' + address.slice(-4),
    channelId,
    lastBlock: '0', // será atualizado na primeira verificação
    addedAt: new Date().toISOString()
  };

  saveWallets(wallets);
  return true;
}

function removeWallet(address) {
  const wallets = getWallets();
  const key = address.toLowerCase();

  if (!wallets[key]) return false;

  delete wallets[key];
  saveWallets(wallets);
  return true;
}

function updateLastBlock(address, blockNumber) {
  const wallets = getWallets();
  const key = address.toLowerCase();

  if (wallets[key]) {
    wallets[key].lastBlock = blockNumber;
    saveWallets(wallets);
  }
}

module.exports = { getWallets, addWallet, removeWallet, updateLastBlock };
