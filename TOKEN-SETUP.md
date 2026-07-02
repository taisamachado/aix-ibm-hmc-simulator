# 🔑 Como Criar e Usar Personal Access Token do GitHub

## ❌ Problema Atual
```
fatal: Authentication failed for 'https://github.com/taisamachado/aix-ibm-hmc-simulator.git/'
```

O GitHub não aceita mais senha normal. Você precisa de um **Personal Access Token**.

## ✅ Solução: Criar Token em 3 Passos

### Passo 1: Criar o Token

1. **Acesse**: https://github.com/settings/tokens
2. Clique no botão verde **"Generate new token"**
3. Escolha **"Generate new token (classic)"**
4. Preencha:
   - **Note**: `HMC Simulator` (nome para identificar)
   - **Expiration**: `No expiration` (ou escolha um período)
   - **Select scopes**: Marque apenas ✅ **`repo`** (acesso completo aos repositórios)
5. Role até o final e clique em **"Generate token"**
6. **🚨 COPIE O TOKEN AGORA!** (você não verá ele novamente)
   - Exemplo: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Passo 2: Usar o Token

Execute novamente o comando push:

```bash
cd /Users/taisacarladossantosmachado/Documents/HMC-simulator
git push -u origin main
```

Quando pedir:
- **Username**: `taisamachado`
- **Password**: Cole o token que você copiou (não sua senha do GitHub!)

### Passo 3: Salvar Credenciais (Opcional)

Para não precisar digitar toda vez:

```bash
# Salvar credenciais no macOS Keychain
git config --global credential.helper osxkeychain
```

Depois disso, você só precisará digitar o token uma vez!

## 🔄 Alternativa: GitHub CLI (Mais Fácil!)

Se preferir uma forma mais simples:

```bash
# Instalar GitHub CLI
brew install gh

# Fazer login (abre o navegador automaticamente)
gh auth login

# Escolha:
# - GitHub.com
# - HTTPS
# - Yes (authenticate Git)
# - Login with a web browser

# Depois, tente o push novamente
git push -u origin main
```

## 📝 Resumo dos Comandos

```bash
# 1. Criar token em: https://github.com/settings/tokens
# 2. Copiar o token
# 3. Executar:
cd /Users/taisacarladossantosmachado/Documents/HMC-simulator
git push -u origin main

# Username: taisamachado
# Password: [COLE O TOKEN AQUI]
```

## ✅ Sucesso!

Quando funcionar, você verá algo como:

```
Enumerating objects: 45, done.
Counting objects: 100% (45/45), done.
Delta compression using up to 8 threads
Compressing objects: 100% (40/40), done.
Writing objects: 100% (45/45), 125.67 KiB | 8.38 MiB/s, done.
Total 45 (delta 5), reused 0 (delta 0), pack-reused 0
To https://github.com/taisamachado/aix-ibm-hmc-simulator.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

Depois acesse: **https://github.com/taisamachado/aix-ibm-hmc-simulator** 🎉

## 🆘 Problemas?

### Token não funciona?
- Verifique se marcou o escopo `repo`
- Certifique-se de copiar o token completo
- Tente criar um novo token

### Esqueceu de copiar o token?
- Crie um novo em: https://github.com/settings/tokens
- Delete o antigo se quiser

### Quer mudar a URL do repositório?
```bash
git remote set-url origin https://github.com/taisamachado/NOVO-NOME.git
```

---

**Dica**: Salve o token em um lugar seguro (gerenciador de senhas) caso precise usar novamente!