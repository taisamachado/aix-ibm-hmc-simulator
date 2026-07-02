# 🎓 Guia de Treinamento HMC - Instalação de AIX em LPAR

## 📚 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Conceitos Fundamentais](#conceitos-fundamentais)
3. [Exercício Prático: Instalação Completa](#exercício-prático-instalação-completa)
4. [Troubleshooting Comum](#troubleshooting-comum)
5. [Comandos Úteis](#comandos-úteis)

---

## 🎯 Pré-requisitos

### O que você precisa saber antes:
- ✅ O que é HMC (Hardware Management Console)
- ✅ O que é LPAR (Logical Partition)
- ✅ Diferença entre System e LPAR
- ✅ O que é VIOS (Virtual I/O Server)

### Ferramentas necessárias:
- ✅ HMC Simulator (já instalado)
- ✅ Navegador web
- ✅ Acesso ao simulador de console (vou criar agora!)

---

## 📖 Conceitos Fundamentais

### 1. Processo de Instalação AIX - Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│ FASE 1: Preparação no HMC                               │
│ - Criar LPAR                                            │
│ - Alocar recursos (CPU, memória)                       │
│ - Configurar boot device                                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ FASE 2: Preparar Mídia de Instalação                   │
│ - DVD virtual OU                                        │
│ - NIM (Network Installation Management) OU              │
│ - ISO montado via VIOS                                  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ FASE 3: Boot e Instalação (via Console)                │
│ - Abrir console da LPAR                                 │
│ - Bootar da mídia de instalação                        │
│ - Seguir wizard de instalação                          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ FASE 4: Configuração Pós-Instalação                    │
│ - Configurar rede                                       │
│ - Atualizar sistema                                     │
│ - Instalar aplicações                                   │
└─────────────────────────────────────────────────────────┘
```

### 2. Tipos de Instalação

#### **A) Instalação via NIM (Mais Comum em Produção)**
- Servidor NIM centralizado
- Instalação via rede
- Automatizada
- Rápida (10-15 minutos)

#### **B) Instalação via DVD/ISO (Mais Comum em Lab)**
- Mídia física ou virtual
- Manual
- Mais lenta (30-45 minutos)
- Boa para aprender

#### **C) Clonagem (Mais Rápida)**
- Clonar LPAR existente
- Usar mksysb (backup do sistema)
- 5-10 minutos
- Requer LPAR modelo

---

## 🎮 Exercício Prático: Instalação Completa de AIX

### **Cenário:**
Você precisa criar uma nova LPAR para hospedar um banco de dados Oracle. A LPAR deve ter AIX 7.3 instalado.

### **Especificações Requeridas:**
- Nome: `AIX-PROD-ORACLE02`
- Sistema: Power9-Server-03 (tem mais recursos disponíveis)
- OS: AIX 7.3
- CPU: 4 cores (min: 2, max: 8)
- Memória: 32 GB (min: 16 GB, max: 64 GB)
- Disco: 100 GB (será configurado via VIOS)

---

## 📝 PARTE 1: Criar LPAR no HMC

### Passo 1: Login no HMC
```
1. Abra o navegador: http://localhost:5001
2. Login: hscroot
3. Password: abc123
```

### Passo 2: Navegar para LPARs
```
1. Clique em "LPARs" no menu superior
2. Clique em "Create New LPAR"
```

### Passo 3: Preencher Formulário
```
LPAR Name: AIX-PROD-ORACLE02
Target System: sys_9009_42a_003 (Power9-Server-03)
Operating System: AIX 7.3
Desired CPU Cores: 4
Minimum CPU Cores: 2
Maximum CPU Cores: 8
Desired Memory (MB): 32768
Minimum Memory (MB): 16384
Maximum Memory (MB): 65536
```

### Passo 4: Criar LPAR
```
1. Clique em "Create LPAR"
2. Aguarde confirmação
3. LPAR criada com status "Not Activated"
```

**✅ Checkpoint 1:** LPAR aparece na lista com status "Not Activated"

---

## 📝 PARTE 2: Preparar Storage (Conceitual)

### Na Vida Real (não no simulador):

#### Via VIOS:
```bash
# 1. SSH no VIOS
ssh padmin@vios-05

# 2. Criar disco virtual de 100GB
mkvdev -vdev hdisk5 -vadapter vhost2 -dev AIXvg01

# 3. Mapear para a LPAR
mkvdev -vdev AIXvg01 -vadapter vhost2 -dev oracle02_rootvg
```

#### Via HMC (GUI):
```
1. Systems → Power9-Server-03 → VIOS-05
2. Virtual Storage → Create Virtual Disk
3. Size: 100 GB
4. Assign to: AIX-PROD-ORACLE02
```

**No simulador:** Vamos assumir que o disco já está configurado.

---

## 📝 PARTE 3: Instalação AIX via Console (SIMULADOR)

### Passo 1: Abrir Console Simulado
```
1. No HMC, vá para LPARs
2. Encontre AIX-PROD-ORACLE02
3. Clique em "Open Console" (vou adicionar este botão!)
```

### Passo 2: Iniciar LPAR
```
1. No HMC, clique em "Start" na LPAR
2. Console mostra o boot
```

### Passo 3: Entrar no SMS (System Management Services)
```
Console mostra:
┌──────────────────────────────────────────────┐
│ IBM PowerPC Firmware                         │
│ Version: VH950_105                           │
│                                              │
│ Press 1 for SMS Menu                         │
│ Press 5 to continue boot                     │
│                                              │
│ Waiting... (5 seconds)                       │
└──────────────────────────────────────────────┘

Ação: Pressione "1" rapidamente!
```

### Passo 4: SMS Menu - Selecionar Boot Device
```
┌──────────────────────────────────────────────┐
│ SMS Main Menu                                │
│                                              │
│ 1. Select Boot Options                       │
│ 2. Setup Remote IPL                          │
│ 3. Change SCSI Settings                      │
│ 4. Select Console                            │
│ 5. Exit to Open Firmware                     │
│                                              │
│ Selection: _                                 │
└──────────────────────────────────────────────┘

Ação: Digite "1" e Enter
```

### Passo 5: Selecionar Dispositivo de Boot
```
┌──────────────────────────────────────────────┐
│ Select Boot Options                          │
│                                              │
│ 1. Select Install/Boot Device                │
│ 2. Configure Boot Device Order               │
│ 3. Multiboot                                 │
│ 4. Return to Main Menu                       │
│                                              │
│ Selection: _                                 │
└──────────────────────────────────────────────┘

Ação: Digite "1" e Enter
```

### Passo 6: Escolher Mídia de Instalação
```
┌──────────────────────────────────────────────┐
│ Select Device Type                           │
│                                              │
│ 1. CD/DVD                                    │
│ 2. Hard Drive                                │
│ 3. Network                                   │
│ 4. Tape                                      │
│                                              │
│ Selection: _                                 │
└──────────────────────────────────────────────┘

Ação: Digite "1" (CD/DVD) e Enter
```

### Passo 7: Selecionar DVD Virtual
```
┌──────────────────────────────────────────────┐
│ Select Media                                 │
│                                              │
│ 1. SCSI CD-ROM (AIX 7.3 Install Media)      │
│ 2. Virtual CD-ROM                            │
│                                              │
│ Selection: _                                 │
└──────────────────────────────────────────────┘

Ação: Digite "1" e Enter
```

### Passo 8: Confirmar e Bootar
```
┌──────────────────────────────────────────────┐
│ Selected: SCSI CD-ROM                        │
│ AIX 7.3 Installation Media                  │
│                                              │
│ 1. Boot from this device                     │
│ 2. Return to previous menu                   │
│                                              │
│ Selection: _                                 │
└──────────────────────────────────────────────┘

Ação: Digite "1" e Enter
```

**✅ Checkpoint 2:** Sistema começa a bootar do DVD

---

## 📝 PARTE 4: Wizard de Instalação AIX

### Tela 1: Welcome
```
┌──────────────────────────────────────────────┐
│ Welcome to AIX Installation                  │
│                                              │
│ AIX Version 7.3                              │
│ Technology Level 00                          │
│                                              │
│ 1. Start Installation                        │
│ 2. Start Maintenance Mode                    │
│ 3. Exit to Shell                             │
│                                              │
│ >>> _                                        │
└──────────────────────────────────────────────┘

Ação: Digite "1" e Enter
```

### Tela 2: Selecionar Idioma
```
┌──────────────────────────────────────────────┐
│ Select Language                              │
│                                              │
│ 1. English (United States)                   │
│ 2. Portuguese (Brazil)                       │
│ 3. Spanish                                   │
│ 4. French                                    │
│ 5. German                                    │
│                                              │
│ >>> _                                        │
└──────────────────────────────────────────────┘

Ação: Digite "1" (English) e Enter
```

### Tela 3: Tipo de Instalação
```
┌──────────────────────────────────────────────┐
│ Installation Type                            │
│                                              │
│ 1. New and Complete Overwrite               │
│ 2. Preservation Install                      │
│ 3. Migration Install                         │
│                                              │
│ >>> _                                        │
└──────────────────────────────────────────────┘

Ação: Digite "1" (New Install) e Enter
```

### Tela 4: Selecionar Disco
```
┌──────────────────────────────────────────────┐
│ Select Target Disk                           │
│                                              │
│ Available Disks:                             │
│ 1. hdisk0 (100 GB) - VIOS Virtual Disk      │
│                                              │
│ >>> _                                        │
└──────────────────────────────────────────────┘

Ação: Digite "1" e Enter
```

### Tela 5: Confirmar Formatação
```
┌──────────────────────────────────────────────┐
│ WARNING!                                     │
│                                              │
│ All data on hdisk0 will be DESTROYED!       │
│                                              │
│ Are you sure? (yes/no)                       │
│                                              │
│ >>> _                                        │
└──────────────────────────────────────────────┘

Ação: Digite "yes" e Enter
```

### Tela 6: Particionamento Automático
```
┌──────────────────────────────────────────────┐
│ Disk Layout                                  │
│                                              │
│ 1. Automatic (Recommended)                   │
│ 2. Custom                                    │
│                                              │
│ >>> _                                        │
└──────────────────────────────────────────────┘

Ação: Digite "1" (Automatic) e Enter
```

### Tela 7: Instalação em Progresso
```
┌──────────────────────────────────────────────┐
│ Installing AIX 7.3...                        │
│                                              │
│ [████████████████░░░░░░░░░░░░] 60%          │
│                                              │
│ Current: Installing base packages            │
│ Elapsed: 8 minutes                           │
│ Remaining: ~5 minutes                        │
│                                              │
│ Please wait...                               │
└──────────────────────────────────────────────┘

Ação: Aguarde (15-20 minutos na vida real)
```

### Tela 8: Configuração de Root Password
```
┌──────────────────────────────────────────────┐
│ Set Root Password                            │
│                                              │
│ Enter new password: ___________              │
│ Confirm password: ___________                │
│                                              │
│ Password requirements:                       │
│ - Minimum 8 characters                       │
│ - At least 1 uppercase                       │
│ - At least 1 number                          │
│                                              │
└──────────────────────────────────────────────┘

Ação: Digite senha forte (ex: AIXadmin123)
```

### Tela 9: Instalação Completa
```
┌──────────────────────────────────────────────┐
│ Installation Complete!                       │
│                                              │
│ AIX 7.3 has been successfully installed      │
│                                              │
│ System will reboot in 10 seconds...          │
│                                              │
│ Press Enter to reboot now                    │
└──────────────────────────────────────────────┘

Ação: Pressione Enter
```

**✅ Checkpoint 3:** Sistema reinicia automaticamente

---

## 📝 PARTE 5: Primeiro Boot e Configuração

### Tela 1: Boot do AIX
```
┌──────────────────────────────────────────────┐
│ AIX Version 7.3                              │
│ Copyright IBM Corporation, 1982-2023         │
│                                              │
│ Booting...                                   │
│                                              │
│ Starting system services...                  │
│ [OK] Network                                 │
│ [OK] Cron                                    │
│ [OK] SSH                                     │
│                                              │
└──────────────────────────────────────────────┘
```

### Tela 2: Login Prompt
```
┌──────────────────────────────────────────────┐
│ AIX Version 7.3                              │
│ AIX-PROD-ORACLE02                            │
│                                              │
│ login: _                                     │
│                                              │
└──────────────────────────────────────────────┘

Ação: Digite "root" e Enter
```

### Tela 3: Password
```
┌──────────────────────────────────────────────┐
│ AIX Version 7.3                              │
│ AIX-PROD-ORACLE02                            │
│                                              │
│ login: root                                  │
│ Password: _                                  │
│                                              │
└──────────────────────────────────────────────┘

Ação: Digite a senha que configurou
```

### Tela 4: Primeiro Login - Welcome
```
┌──────────────────────────────────────────────┐
│ *************************************        │
│ *                                   *        │
│ *    Welcome to AIX Version 7.3    *        │
│ *                                   *        │
│ *************************************        │
│                                              │
│ Last login: Never                            │
│                                              │
│ # _                                          │
└──────────────────────────────────────────────┘

Ação: Você está dentro do AIX! 🎉
```

**✅ Checkpoint 4:** Login bem-sucedido no AIX

---

## 📝 PARTE 6: Configuração Pós-Instalação

### Passo 1: Verificar Sistema
```bash
# Verificar versão do AIX
# oslevel -s
7300-00-00-0000

# Verificar hostname
# hostname
AIX-PROD-ORACLE02

# Verificar memória
# lsattr -El sys0 -a realmem
realmem 32768 Amount of usable physical memory in Mbytes

# Verificar CPUs
# lsdev -Cc processor
proc0 Available 00-00 Processor
proc1 Available 00-01 Processor
proc2 Available 00-02 Processor
proc3 Available 00-03 Processor
```

### Passo 2: Configurar Rede
```bash
# Listar interfaces
# ifconfig -a
lo0: flags=8000<LOOPBACK>
        inet 127.0.0.1 netmask 0xff000000
en0: flags=0<>
        inet 0.0.0.0 netmask 0x0

# Configurar IP via SMIT
# smitty tcpip

Selecione:
1. Minimum Configuration & Startup
2. Configure TCP/IP
3. Network Interfaces
4. Standard Ethernet
5. Add an Ethernet Interface

Preencha:
IP Address: 10.10.3.150
Netmask: 255.255.255.0
Gateway: 10.10.3.1
```

### Passo 3: Configurar DNS
```bash
# Editar /etc/resolv.conf
# vi /etc/resolv.conf

Adicione:
nameserver 8.8.8.8
nameserver 8.8.4.4
domain example.com
```

### Passo 4: Testar Conectividade
```bash
# Ping gateway
# ping 10.10.3.1
PING 10.10.3.1: (56 data bytes)
64 bytes from 10.10.3.1: icmp_seq=0 ttl=64 time=0.123 ms

# Ping internet
# ping google.com
PING google.com: (56 data bytes)
64 bytes from 142.250.185.46: icmp_seq=0 ttl=117 time=10.5 ms
```

### Passo 5: Atualizar Sistema
```bash
# Verificar patches disponíveis
# oslevel -r
7300-00-00-0000

# Instalar service pack (se disponível)
# smitty update_all
```

### Passo 6: Configurar SSH
```bash
# Verificar se SSH está rodando
# lssrc -s sshd
Subsystem         Group            PID          Status
 sshd             tcpip            12345        active

# Permitir login root via SSH (se necessário)
# vi /etc/ssh/sshd_config
PermitRootLogin yes

# Reiniciar SSH
# stopsrc -s sshd
# startsrc -s sshd
```

**✅ Checkpoint 5:** Sistema configurado e acessível via rede

---

## 📝 PARTE 7: Validação Final

### Checklist de Validação:

```bash
# 1. Sistema operacional
# oslevel -s
✅ 7300-00-00-0000

# 2. Hostname
# hostname
✅ AIX-PROD-ORACLE02

# 3. Recursos
# lsattr -El sys0 -a realmem
✅ 32768 MB

# lsdev -Cc processor | wc -l
✅ 4 CPUs

# 4. Rede
# ifconfig en0
✅ IP: 10.10.3.150

# ping 10.10.3.1
✅ Gateway acessível

# 5. Serviços
# lssrc -a | grep active
✅ SSH, cron, syslogd ativos

# 6. Disco
# lsvg rootvg
✅ rootvg criado e ativo

# df -g
✅ Filesystems montados
```

### Teste de SSH Externo:
```bash
# Do seu computador
ssh root@10.10.3.150

# Se conectar com sucesso:
✅ INSTALAÇÃO COMPLETA!
```

---

## 🎓 O que Você Aprendeu

### Conceitos:
- ✅ Processo completo de instalação AIX
- ✅ SMS (System Management Services)
- ✅ Boot devices e ordem de boot
- ✅ Particionamento de disco
- ✅ Configuração de rede no AIX
- ✅ Comandos básicos AIX

### Habilidades:
- ✅ Criar LPAR no HMC
- ✅ Navegar no SMS menu
- ✅ Instalar AIX do zero
- ✅ Configurar rede via SMIT
- ✅ Validar instalação

---

## 🚨 Troubleshooting Comum

### Problema 1: LPAR não boota
**Sintoma:** Console fica em branco ou trava
**Solução:**
```
1. No HMC, desligar LPAR
2. Verificar recursos alocados (CPU/memória suficientes?)
3. Verificar se VIOS está rodando
4. Tentar boot novamente
```

### Problema 2: Não encontra disco de instalação
**Sintoma:** SMS não mostra DVD/CD
**Solução:**
```
1. Verificar se mídia está montada no VIOS
2. No HMC: LPAR → Properties → Virtual Devices
3. Verificar se virtual optical está mapeado
```

### Problema 3: Instalação trava em 60%
**Sintoma:** Barra de progresso para
**Solução:**
```
1. Aguardar 10 minutos (pode ser normal)
2. Verificar logs no console
3. Se persistir, reiniciar instalação
```

### Problema 4: Não consegue configurar rede
**Sintoma:** IP não funciona
**Solução:**
```bash
# Verificar interface
ifconfig -a

# Verificar roteamento
netstat -rn

# Reconfigurar via SMIT
smitty tcpip
```

---

## 📚 Comandos Úteis AIX

### Informações do Sistema:
```bash
oslevel -s              # Versão do AIX
prtconf                 # Configuração completa
lsattr -El sys0         # Atributos do sistema
bootinfo -r             # Memória real
bootinfo -p             # Tipo de processador
```

### Gerenciamento de Disco:
```bash
lspv                    # Listar discos físicos
lsvg                    # Listar volume groups
lsvg rootvg             # Detalhes do rootvg
df -g                   # Espaço em disco
```

### Rede:
```bash
ifconfig -a             # Interfaces de rede
netstat -rn             # Tabela de roteamento
netstat -i              # Estatísticas de interface
ping <host>             # Testar conectividade
```

### Serviços:
```bash
lssrc -a                # Listar todos os serviços
startsrc -s <service>   # Iniciar serviço
stopsrc -s <service>    # Parar serviço
refresh -s <service>    # Recarregar serviço
```

### Processos:
```bash
ps -ef                  # Listar processos
topas                   # Monitor de performance
vmstat 1                # Estatísticas de VM
iostat 1                # Estatísticas de I/O
```

---

## 🎯 Próximos Passos

Agora que você sabe instalar AIX, pratique:

1. **Instalar Oracle Database** na LPAR
2. **Configurar backup** com mksysb
3. **Criar mais LPARs** para diferentes ambientes
4. **Praticar troubleshooting** simulando problemas
5. **Aprender DLPAR** (adicionar recursos dinamicamente)

---

## 📞 Recursos Adicionais

- IBM AIX Documentation: https://www.ibm.com/docs/en/aix
- IBM Redbooks: https://www.redbooks.ibm.com/
- AIX Community: https://community.ibm.com/community/user/power/communities/community-home?CommunityKey=f3a3ce7c-e0e0-4e7f-8e6c-e7e8e7e7e7e7

---

**Parabéns! Você completou o treinamento de instalação AIX! 🎉**

Use o simulador de console (próximo passo) para praticar quantas vezes quiser!