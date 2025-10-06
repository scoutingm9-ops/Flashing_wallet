const consoleInput = document.getElementById('console-input');
const consoleOutput = document.getElementById('console-output');
const sourceAddressInput = document.getElementById('source-address');
const destinationAddressInput = document.getElementById('destination-address');
const walletTypeSelect = document.getElementById('wallet-type');
const coinTypeSelect = document.getElementById('coin-type');
const customTokenAddressInput = document.getElementById('custom-token-address');

function appendOutput(text) {
consoleOutput.textContent += text + '\n';
consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsole() {
consoleOutput.textContent = '';
consoleInput.value = '';
appendOutput('Console cleared. Type code or use buttons.');
}

function validateInputs() {
const source = sourceAddressInput.value.trim();
const destination = destinationAddressInput.value.trim();
if (!source || !destination) {
appendOutput('Error: Please enter both source and destination addresses.');
return false;
}
const customAddress = customTokenAddressInput.value.trim();
return {
sourceAddress: source,
destinationAddress: destination,
tokenSymbol: coinPointTypeSelect.value,
customTokenAddress: customAddress || undefined
};
}

consoleInput.addEventListener('keypress', async (e) => {
if (e.key === 'Enter' && !e.shiftKey) {
e.preventDefault();
const input = consoleInput.value.trim();

if (input.toLowerCase() === 'clear') {  
  clearConsole();  
  return;  
}  

try {  
  const result = eval(input);  
  if (result !== undefined) {  
    appendOutput(`Result: ${result}`);  
  }  
} catch (error) {  
  appendOutput(`Error: ${error.message}`);  
}  

consoleInput.value = '';

}
});

async function getBalance() {
const params = validateInputs();
if (!params) return;

appendOutput('Fetching balance...');
try {
const response = await fetch('http://localhost:3000/api/balance', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(params),
});
const data = await response.json();
if (data.error) {
appendOutput(Error: ${data.error});
} else {
appendOutput(${data.symbol} balance: ${data.balance});
}
} catch (error) {
appendOutput(Error: ${error.message});
}
}

async function prepareTransaction() {
const params = validateInputs();
if (!params) return;

appendOutput('Preparing unsigned transaction...');
try {
const response = await fetch('http://localhost:3000/api/prepare-tx', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(params),
});
const data = await response.json();
if (data.error) {
appendOutput(Error: ${data.error});
} else if (data.message) {
appendOutput(data.message);
} else {
appendOutput(Unsigned transaction: ${JSON.stringify(data.unsignedTx, null, 2)});
appendOutput(Amount to send: ${data.amount} ${data.symbol});
const walletInstructions = getWalletInstructions(walletTypeSelect.value);
appendOutput(✅ ${walletInstructions});
}
} catch (error) {
appendOutput(Error: ${error.message});
}
}

function getWalletInstructions(walletType) {
const instructions = {
'Trust Wallet': 'Copy this transaction object into Trust Wallet to sign and send safely. For TON, use TON-specific features.',
'Coinbase': 'Import this unsigned tx into Coinbase Wallet for signing.',
'MetaMask': 'Paste this into MetaMask's advanced transaction feature to sign. TON not supported.',
'Ledger': 'Use Ledger Live or MyEtherWallet to sign this unsigned tx with your Ledger device. TON may require additional tools.',
'Other': 'Copy this transaction object into your preferred wallet to sign and send safely.',
};
return instructions[walletType] || instructions['Other'];
}