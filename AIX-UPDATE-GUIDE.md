# 🔄 Guia de Updates, Patches e Atualizações no AIX

## 📋 Conceitos Importantes

### HMC vs AIX - Onde Fazer Updates?

**❌ HMC (Hardware Management Console):**
- Gerencia hardware virtual (CPU, memória, I/O)
- Cria e gerencia LPARs
- Fornece console de acesso
- **NÃO faz updates do sistema operacional**

**✅ AIX (Dentro da LPAR):**
- Updates do sistema operacional
- Patches de segurança
- Service Packs
- Technology Levels (TL)
- **Aqui que fazemos as atualizações!**

---

## 🎯 Hierarquia de Versões do AIX

```
AIX 7.3.0.0  ← Versão Base
    ↓
AIX 7.3.1.0  ← Technology Level 1 (TL1)
    ↓
AIX 7.3.1.1  ← Service Pack 1 (SP1)
    ↓
AIX 7.3.1.2  ← Service Pack 2 (SP2)
```

### Tipos de Updates:

1. **Technology Level (TL)** - Grande atualização
   - Exemplo: 7.3.0 → 7.3.1
   - Novos recursos e correções
   - Requer planejamento

2. **Service Pack (SP)** - Atualização menor
   - Exemplo: 7.3.1.1 → 7.3.1.2
   - Correções de bugs e segurança
   - Mais frequente

3. **Interim Fix (ifix)** - Correção pontual
   - Patch específico para um problema
   - Temporário até próximo SP

4. **Security Fix** - Patch de segurança
   - Correção de vulnerabilidades
   - Crítico e urgente

---

## 🛠️ Ferramentas de Update no AIX

### 1. **suma** (Service Update Management Assistant)
Ferramenta principal para download de updates

```bash
# Baixar último Technology Level
suma -x -a Action=Preview -a RqType=TL

# Baixar último Service Pack
suma -x -a Action=Preview -a RqType=SP

# Download efetivo
suma -x -a Action=Download -a RqType=Latest -a FilterML=7300-01
```

### 2. **smitty** (System Management Interface Tool)
Interface de menu para administração

```bash
# Acessar menu de updates
smitty update_all

# Instalar filesets
smitty install_latest
```

### 3. **installp** (Install Package)
Comando direto para instalar software

```bash
# Listar filesets instalados
lslpp -L

# Instalar fileset
installp -acgXd /mnt/updates all

# Verificar se precisa reboot
lslpp -l | grep -i reboot
```

### 4. **nim** (Network Installation Management)
Para gerenciar updates em múltiplos servidores

---

## 📝 Processo Completo de Atualização

### **Fase 1: Planejamento e Preparação**

#### 1.1 Verificar Versão Atual
```bash
# Versão do AIX
oslevel -s
# Exemplo output: 7300-01-02-2148

# Decodificando:
# 7300 = AIX 7.3
# 01 = TL1
# 02 = SP2
# 2148 = Build number
```

#### 1.2 Verificar Espaço em Disco
```bash
# Verificar espaço disponível
df -g

# Mínimo recomendado:
# /usr  - 5 GB livre
# /tmp  - 2 GB livre
# /var  - 1 GB livre
# /opt  - 1 GB livre
```

#### 1.3 Fazer Backup
```bash
# Backup do rootvg (volume group raiz)
mksysb -i /backup/mksysb_$(hostname)_$(date +%Y%m%d).img

# Backup de configurações
savevg -i -f /backup/datavg_$(date +%Y%m%d).savevg datavg

# Listar backups
ls -lh /backup/
```

#### 1.4 Verificar Pré-requisitos
```bash
# Verificar se há filesets quebrados
lppchk -v

# Verificar consistência
instfix -i | grep ML

# Verificar espaço no /tmp
du -sg /tmp
```

---

### **Fase 2: Download dos Updates**

#### 2.1 Configurar suma
```bash
# Criar diretório para downloads
mkdir -p /updates/aix73tl01sp02

# Configurar suma
suma -x -a Action=Preview \
     -a RqType=TL \
     -a FilterML=7300-01-02 \
     -a DLTarget=/updates/aix73tl01sp02
```

#### 2.2 Download via Fix Central (Manual)
```
1. Acesse: https://www.ibm.com/support/fixcentral/
2. Selecione: AIX
3. Escolha a versão: 7.3
4. Baixe o Technology Level ou Service Pack
5. Transfira para o servidor AIX via FTP/SCP
```

#### 2.3 Verificar Integridade
```bash
# Verificar checksums
cd /updates/aix73tl01sp02
ls -l *.bff

# Verificar se os arquivos estão corretos
inutoc .
```

---

### **Fase 3: Instalação**

#### 3.1 Modo Interativo (smitty)
```bash
# Acessar menu de instalação
smitty update_all

# Navegação:
# 1. Install and Update Software
# 2. Update Installed Software to Latest Level
# 3. Selecionar diretório: /updates/aix73tl01sp02
# 4. Selecionar "all" para instalar tudo
# 5. Confirmar
```

#### 3.2 Modo Comando (installp)
```bash
# Instalar todos os filesets do diretório
cd /updates/aix73tl01sp02

# Preview (não instala, apenas mostra)
installp -apXd . all

# Instalação real
installp -acgXd . all

# Flags:
# -a = apply (instalar)
# -c = commit (tornar permanente)
# -g = install dependencies
# -X = expand filesystem se necessário
# -d = diretório fonte
```

#### 3.3 Monitorar Instalação
```bash
# Em outro terminal, monitorar logs
tail -f /var/adm/ras/installp.log

# Verificar progresso
lslpp -L | grep -i installing
```

---

### **Fase 4: Pós-Instalação**

#### 4.1 Verificar Instalação
```bash
# Verificar nova versão
oslevel -s

# Verificar se todos os filesets foram instalados
instfix -i | grep ML

# Verificar se há filesets quebrados
lppchk -v

# Listar filesets instalados recentemente
lslpp -l | grep -i "$(date +%b)"
```

#### 4.2 Verificar se Precisa Reboot
```bash
# Verificar filesets que requerem reboot
lslpp -l | grep -i reboot

# Ou verificar diretamente
instfix -ik | grep reboot
```

#### 4.3 Reboot (se necessário)
```bash
# Avisar usuários
wall "Sistema será reiniciado em 5 minutos para aplicar updates"

# Agendar reboot
shutdown -Fr +5

# Ou reboot imediato
shutdown -Fr now

# Após reboot, verificar
oslevel -s
uptime
```

#### 4.4 Commit das Mudanças
```bash
# Após testar e confirmar que está tudo OK
# Commit torna as mudanças permanentes (não pode fazer rollback)

installp -c all

# Verificar
lslpp -l | grep COMMITTED
```

---

### **Fase 5: Rollback (Se Necessário)**

#### 5.1 Verificar se Pode Fazer Rollback
```bash
# Listar filesets que podem ser revertidos
lslpp -l | grep APPLIED

# Filesets APPLIED podem ser revertidos
# Filesets COMMITTED não podem
```

#### 5.2 Fazer Rollback
```bash
# Rejeitar updates aplicados (voltar versão anterior)
installp -r fileset_name

# Ou rejeitar todos
installp -r all

# Reboot
shutdown -Fr now
```

---

## 🔒 Boas Práticas

### ✅ Antes de Atualizar:

1. **Backup completo** (mksysb)
2. **Documentar versão atual** (oslevel -s)
3. **Verificar espaço em disco** (df -g)
4. **Ler release notes** do update
5. **Testar em ambiente de desenvolvimento** primeiro
6. **Agendar janela de manutenção**
7. **Avisar usuários**

### ✅ Durante a Atualização:

1. **Monitorar logs** (tail -f /var/adm/ras/installp.log)
2. **Não interromper** o processo
3. **Manter console aberto** (via HMC)
4. **Ter plano B** (rollback)

### ✅ Após a Atualização:

1. **Verificar versão** (oslevel -s)
2. **Testar aplicações críticas**
3. **Verificar logs** de erro
4. **Monitorar performance**
5. **Commit apenas após validação**
6. **Documentar mudanças**

---

## 🚨 Troubleshooting Comum

### Problema 1: Espaço Insuficiente
```bash
# Erro: Not enough space in /usr

# Solução: Expandir filesystem
chfs -a size=+2G /usr

# Ou limpar espaço
find /tmp -type f -mtime +7 -delete
```

### Problema 2: Filesets Quebrados
```bash
# Erro: Filesets in BROKEN state

# Solução: Reinstalar fileset quebrado
installp -acgXd /updates/aix73tl01sp02 broken_fileset_name
```

### Problema 3: Dependências Não Resolvidas
```bash
# Erro: Missing requisites

# Solução: Instalar com flag -g (resolve dependências)
installp -acgXd /updates/aix73tl01sp02 all
```

### Problema 4: Sistema Não Boota Após Update
```bash
# Solução: Bootar em maintenance mode via HMC

# 1. No HMC, abrir console da LPAR
# 2. Reiniciar LPAR
# 3. Pressionar F5 ou 5 no SMS menu
# 4. Selecionar "Maintenance Mode"
# 5. Fazer rollback:
installp -r all
# 6. Reboot
shutdown -Fr now
```

---

## 📊 Comandos de Verificação Rápida

```bash
# Versão do AIX
oslevel -s

# Último TL instalado
oslevel -r

# Listar todos os filesets
lslpp -L | more

# Verificar filesets de um pacote específico
lslpp -l bos.rte*

# Histórico de instalações
lslpp -h bos.rte

# Verificar se há updates disponíveis (via suma)
suma -x -a Action=Preview -a RqType=Latest

# Espaço em disco
df -g

# Verificar integridade do sistema
lppchk -v

# Verificar se precisa reboot
lslpp -l | grep -i reboot
```

---

## 🎓 Resumo do Processo

```
1. PLANEJAMENTO
   ├── Verificar versão atual (oslevel -s)
   ├── Verificar espaço (df -g)
   ├── Fazer backup (mksysb)
   └── Ler release notes

2. DOWNLOAD
   ├── Usar suma ou Fix Central
   ├── Verificar checksums
   └── Preparar diretório (/updates)

3. INSTALAÇÃO
   ├── installp -apXd /updates all (preview)
   ├── installp -acgXd /updates all (instalar)
   └── Monitorar logs

4. VERIFICAÇÃO
   ├── oslevel -s (nova versão)
   ├── lppchk -v (integridade)
   ├── Testar aplicações
   └── Verificar se precisa reboot

5. REBOOT (se necessário)
   ├── shutdown -Fr +5
   └── Verificar após boot

6. COMMIT
   └── installp -c all (após validação)
```

---

## 🔗 Recursos Úteis

- **IBM Fix Central**: https://www.ibm.com/support/fixcentral/
- **AIX Documentation**: https://www.ibm.com/docs/en/aix
- **Release Notes**: Sempre ler antes de atualizar!
- **IBM Support**: Para casos complexos

---

**Lembre-se**: Updates são críticos para segurança e estabilidade, mas devem ser feitos com planejamento e cuidado! 🎯