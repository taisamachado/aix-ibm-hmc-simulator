# 🔧 Corrigir Erro 403 - Permission Denied

## ❌ Erro Atual:
```
remote: Permission to taisamachado/aix-ibm-hmc-simulator.git denied to taisamachado.
fatal: unable to access 'https://github.com/taisamachado/aix-ibm-hmc-simulator.git/': The requested URL returned error: 403
```

## 🔍 Causas Possíveis:

1. **Token sem permissão `repo`** (mais provável)
2. **Token expirado ou inválido**
3. **Credenciais antigas em cache**

## ✅ Solução Completa:

### Passo 1: Limpar Credenciais Antigas

```bash
# Remover credenciais antigas do macOS Keychain
git credential-osxkeychain erase
host=github.com
protocol=https

# Pressione Enter duas vezes após colar o comando acima
```

### Passo 2: Criar Novo Token (IMPORTANTE!)

1. Acesse: **https://github.com/settings/tokens**
2. Se já tem um token, **DELETE-O** e crie um novo
3. Clique em **"Generate new token (classic)"**
4. Preencha:
   - **Note**: `HMC Simulator Full Access`
   - **Expiration**: `No expiration`
   - **Scopes** - Marque TODOS estes:
     - ✅ **`repo`** (TODOS os sub-itens)
       - ✅ repo:status
       - ✅ repo_deployment
       - ✅ public_repo
       - ✅ repo:invite
       - ✅ security_events
     - ✅ **`workflow`** (se aparecer)
5. Clique em **"Generate token"**
6. **🚨 COPIE O TOKEN COMPLETO!**

### Passo 3: Configurar Git para Usar Token

```bash
cd /Users/taisacarladossantosmachado/Documents/HMC-simulator

# Remover remote antigo
git remote remove origin

# Adicionar remote com token na URL (SUBSTITUA SEU_TOKEN)
git remote add origin https://SEU_TOKEN@github.com/taisamachado/aix-ibm-hmc-simulator.git

# Fazer push
git push -u origin main
```

**IMPORTANTE**: Substitua `SEU_TOKEN` pelo token que você copiou!

Exemplo:
```bash
git remote add origin https://ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/taisamachado/aix-ibm-hmc-simulator.git
```

### Passo 4: Verificar

Se funcionar, você verá:
```
Enumerating objects: 45, done.
Counting objects: 100% (45/45), done.
Writing objects: 100% (45/45), done.
To https://github.com/taisamachado/aix-ibm-hmc-simulator.git
 * [new branch]      main -> main
```

## 🚀 Alternativa: GitHub CLI (MAIS FÁCIL!)

Se continuar com problemas, use o GitHub CLI:

```bash
# Instalar (se não tiver)
brew install gh

# Fazer logout (limpar credenciais)
gh auth logout

# Fazer login novamente
gh auth login

# Escolha:
# - GitHub.com
# - HTTPS
# - Yes (authenticate Git with GitHub credentials)
# - Login with a web browser

# Depois tente o push
git push -u origin main
```

## 🔍 Verificar Permissões do Token

Depois de criar o token, verifique se ele tem acesso ao repositório:

```bash
# Testar token (substitua SEU_TOKEN)
curl -H "Authorization: token SEU_TOKEN" https://api.github.com/user/repos
```

Se retornar uma lista de repositórios, o token está funcionando!

## 📝 Checklist de Verificação:

- [ ] Token criado com escopo `repo` completo
- [ ] Token copiado corretamente (sem espaços)
- [ ] Credenciais antigas removidas
- [ ] Remote configurado com token na URL
- [ ] Repositório existe em: https://github.com/taisamachado/aix-ibm-hmc-simulator

## 🆘 Ainda com Problemas?

### Opção 1: Usar SSH em vez de HTTPS

```bash
# Gerar chave SSH (se não tiver)
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub

# Adicionar em: https://github.com/settings/keys

# Mudar remote para SSH
git remote set-url origin git@github.com:taisamachado/aix-ibm-hmc-simulator.git

# Fazer push
git push -u origin main
```

### Opção 2: Verificar se o Repositório é Privado

Se o repositório for privado, certifique-se de que:
1. Você é o dono do repositório
2. O token tem permissão para repositórios privados

---

**Dica**: Salve o token em um gerenciador de senhas seguro!