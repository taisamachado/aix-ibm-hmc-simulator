# 🚀 Como Subir o HMC Simulator para o GitHub

## Passo 1: Criar um Novo Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha os campos:
   - **Repository name**: `hmc-simulator` (ou o nome que preferir)
   - **Description**: `Interactive IBM Hardware Management Console (HMC) and AIX Installation Simulator for training and learning`
   - **Visibility**: Public (ou Private se preferir)
   - ⚠️ **NÃO marque** "Add a README file"
   - ⚠️ **NÃO marque** "Add .gitignore"
   - ⚠️ **NÃO marque** "Choose a license"
3. Clique em **"Create repository"**

## Passo 2: Inicializar Git Local

Abra o terminal e execute os comandos abaixo:

```bash
# Navegue até o diretório do projeto
cd /Users/taisacarladossantosmachado/Documents/HMC-simulator

# Inicialize o repositório Git
git init

# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "Initial commit: HMC Simulator with AIX installation console"
```

## Passo 3: Conectar ao GitHub

**IMPORTANTE**: Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub!

```bash
# Adicione o repositório remoto
git remote add origin https://github.com/SEU_USUARIO/hmc-simulator.git

# Renomeie a branch para main (se necessário)
git branch -M main

# Envie o código para o GitHub
git push -u origin main
```

## Passo 4: Autenticação

Quando pedir credenciais, você tem duas opções:

### Opção A: Personal Access Token (Recomendado)
1. Vá para: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Dê um nome: "HMC Simulator"
4. Marque o escopo: `repo` (acesso completo aos repositórios)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (você não verá ele novamente!)
7. Use o token como senha quando o Git pedir

### Opção B: GitHub CLI
```bash
# Instale o GitHub CLI (se não tiver)
brew install gh

# Faça login
gh auth login

# Siga as instruções interativas
```

## Passo 5: Verificar

Após o push, acesse:
```
https://github.com/SEU_USUARIO/hmc-simulator
```

Você deve ver todos os arquivos do projeto! 🎉

## Comandos Úteis para o Futuro

```bash
# Ver status dos arquivos
git status

# Adicionar mudanças
git add .

# Fazer commit
git commit -m "Descrição das mudanças"

# Enviar para o GitHub
git push

# Baixar mudanças do GitHub
git pull

# Ver histórico de commits
git log --oneline
```

## Estrutura do Projeto no GitHub

```
hmc-simulator/
├── README.md                 # Documentação principal
├── TRAINING-GUIDE.md        # Guia de treinamento completo
├── CONTRIBUTING.md          # Guia para contribuidores
├── LICENSE                  # Licença MIT
├── .gitignore              # Arquivos ignorados pelo Git
├── backend/                # Backend Flask
│   ├── app.py
│   └── requirements.txt
├── frontend/               # Frontend HTML/CSS/JS
│   ├── pages/
│   ├── js/
│   └── css/
└── data/                   # Dados mock
    ├── systems.json
    ├── lpars.json
    └── events.json
```

## Próximos Passos

1. ✅ Adicione uma imagem/screenshot no README
2. ✅ Configure GitHub Pages (se quiser hospedar online)
3. ✅ Adicione badges ao README (build status, license, etc.)
4. ✅ Crie releases/tags para versões
5. ✅ Adicione issues e milestones para melhorias futuras

## Dicas

- Faça commits frequentes com mensagens descritivas
- Use branches para novas features: `git checkout -b feature/nova-funcionalidade`
- Mantenha o README atualizado
- Responda issues e pull requests da comunidade

---

**Precisa de ajuda?** Abra uma issue no repositório!