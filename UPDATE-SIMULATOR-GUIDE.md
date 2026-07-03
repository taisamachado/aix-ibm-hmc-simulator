# 🎮 Guia do Simulador de Updates AIX

## 🎯 O Que Foi Adicionado

Um simulador COMPLETO e INTERATIVO de patching do AIX! Agora você pode:

✅ **Simular 3 tipos de updates:**
- Technology Level (TL) - Grande atualização
- Service Pack (SP) - Atualização menor  
- Security Fix - Patch de segurança

✅ **Processo completo com mudanças reais:**
- Download de updates (com barra de progresso)
- Backup do sistema (com animação)
- Instalação de filesets (com progresso)
- Reboot do sistema (com animação)
- Mudança REAL da versão do AIX!

✅ **Sistema de estado persistente:**
- Versão do AIX muda de verdade
- Filesets são atualizados
- Estado APPLIED vs COMMITTED
- Flags de reboot necessário

---

## 🚀 Como Usar o Simulador

### **Passo 1: Abrir Console de uma LPAR**

1. Acesse o HMC Simulator
2. Vá para a página "LPARs"
3. Clique em "🖥️ Console" em qualquer LPAR
4. Faça login (root/admin123)

### **Passo 2: Verificar Versão Atual**

```bash
# Ver versão atual
oslevel -s
# Output: 7300-00-00-0000 (versão base)

# Ver filesets instalados
lslpp -L
```

### **Passo 3: Workflow Completo de Update**

#### **Opção A: Technology Level (Grande Update)**

```bash
# 1. Verificar updates disponíveis
suma -x -a Action=Preview -a RqType=TL

# 2. Baixar update (com barra de progresso!)
suma -x -a Action=Download -a RqType=TL

# 3. Criar backup (IMPORTANTE!)
mksysb -i /backup/backup_before_tl1.img

# 4. Preview da instalação
installp -apXd /updates all

# 5. Instalar updates
installp -acgXd /updates all

# 6. Reboot (com animação!)
shutdown -Fr now

# 7. Verificar nova versão
oslevel -s
# Output: 7300-01-00-0000 (TL1 instalado!)

# 8. Commit (tornar permanente)
installp -c all
```

#### **Opção B: Service Pack (Update Menor)**

```bash
# 1. Verificar updates disponíveis
suma -x -a Action=Preview -a RqType=SP

# 2. Baixar update
suma -x -a Action=Download -a RqType=SP

# 3. Backup
mksysb -i /backup/backup_before_sp2.img

# 4. Instalar
installp -acgXd /updates all

# 5. Reboot
shutdown -Fr now

# 6. Verificar
oslevel -s
# Output: 7300-01-02-2148 (SP2 instalado!)

# 7. Commit
installp -c all
```

#### **Opção C: Security Fix (Patch de Segurança)**

```bash
# 1. Verificar security fixes disponíveis
suma -x -a Action=Preview -a RqType=Security

# 2. Baixar patch
suma -x -a Action=Download -a RqType=Security

# 3. Backup (sempre!)
mksysb -i /backup/backup_before_security.img

# 4. Instalar
installp -acgXd /updates all

# 5. Reboot
shutdown -Fr now

# 6. Verificar
oslevel -s
# Output: 7300-00-01-2301 (Security fix aplicado!)
```

---

## 🎨 Recursos Visuais

### **Barras de Progresso Animadas**

```
Download:
[████████████████████] 100%

Backup:
[██████████░░░░░░░░░░] 50% - Backing up rootvg...

Installation:
Installing bos.rte 7.3.1.0...
Installing bos.net.tcp.client 7.3.1.0...
```

### **Animação de Reboot**

```
╔══════════════════════════════════════════════════════════════╗
║                    SYSTEM REBOOTING                         ║
╚══════════════════════════════════════════════════════════════╝

Booting AIX...
Loading kernel...                                    [OK]
Initializing devices...                              [OK]
Starting system services...                          [OK]

═══════════════════════════════════════════════════════
  AIX Version 7300-01-00-0000
  Copyright IBM Corporation, 1982-2024
═══════════════════════════════════════════════════════

✓ System updated successfully!
  New version: 7300-01-00-0000
```

---

## 📊 Estados do Sistema

### **Versões Disponíveis:**

| Tipo | Versão | Descrição | Tamanho |
|------|--------|-----------|---------|
| Base | 7300-00-00-0000 | AIX 7.3 Base | - |
| TL | 7300-01-00-0000 | Technology Level 1 | 4.2 GB |
| SP | 7300-01-02-2148 | TL1 Service Pack 2 | 1.8 GB |
| Security | 7300-00-01-2301 | CVE-2024-1234 Fix | 245 MB |

### **Estados de Filesets:**

- **COMMITTED** - Permanente, não pode fazer rollback
- **APPLIED** - Aplicado, pode fazer rollback
- **BROKEN** - Corrompido, precisa reinstalar

---

## 🎓 Comandos Disponíveis

### **Verificação:**
```bash
oslevel           # Versão atual
oslevel -s        # Versão detalhada
oslevel -r        # Technology Level
lslpp -L          # Listar filesets
lppchk -v         # Verificar consistência
instfix -i        # Verificar fixes
df -g             # Espaço em disco
```

### **Updates:**
```bash
suma -x -a Action=Preview -a RqType=TL       # Preview TL
suma -x -a Action=Preview -a RqType=SP       # Preview SP
suma -x -a Action=Preview -a RqType=Security # Preview Security
suma -x -a Action=Download -a RqType=TL      # Download TL
```

### **Instalação:**
```bash
mksysb -i /backup/backup.img    # Backup
installp -apXd /updates all     # Preview
installp -acgXd /updates all    # Instalar
shutdown -Fr now                # Reboot
installp -c all                 # Commit
```

### **Ajuda:**
```bash
help              # Ver todos os comandos
suma              # Ajuda do suma
installp          # Ajuda do installp
mksysb            # Ajuda do mksysb
```

---

## 💡 Dicas e Truques

### **1. Sempre Faça Backup!**
```bash
# Antes de qualquer update
mksysb -i /backup/backup_$(date +%Y%m%d).img
```

### **2. Preview Antes de Instalar**
```bash
# Ver o que será instalado
installp -apXd /updates all
```

### **3. Verificar Espaço em Disco**
```bash
# Antes de baixar updates
df -g
```

### **4. Verificar Consistência**
```bash
# Após instalação
lppchk -v
```

### **5. Commit Apenas Após Testar**
```bash
# Testar o sistema primeiro
# Depois tornar permanente
installp -c all
```

---

## 🔄 Fluxo Completo Recomendado

```
1. Verificar versão atual
   └─> oslevel -s

2. Verificar espaço em disco
   └─> df -g

3. Verificar updates disponíveis
   └─> suma -x -a Action=Preview -a RqType=TL

4. Baixar updates
   └─> suma -x -a Action=Download -a RqType=TL

5. Criar backup
   └─> mksysb -i /backup/backup.img

6. Preview instalação
   └─> installp -apXd /updates all

7. Instalar updates
   └─> installp -acgXd /updates all

8. Reboot
   └─> shutdown -Fr now

9. Verificar nova versão
   └─> oslevel -s

10. Testar sistema
    └─> (testar aplicações)

11. Commit updates
    └─> installp -c all

12. Verificar estado final
    └─> lslpp -L
```

---

## 🎯 Cenários de Prática

### **Cenário 1: Update de Produção**
```bash
# Simular update em produção
# 1. Backup
mksysb -i /backup/prod_backup.img

# 2. Download TL
suma -x -a Action=Download -a RqType=TL

# 3. Instalar
installp -acgXd /updates all

# 4. Reboot
shutdown -Fr now

# 5. Verificar
oslevel -s
```

### **Cenário 2: Security Patch Urgente**
```bash
# Patch de segurança crítico
# 1. Verificar patch
suma -x -a Action=Preview -a RqType=Security

# 2. Baixar
suma -x -a Action=Download -a RqType=Security

# 3. Backup rápido
mksysb -i /backup/security_backup.img

# 4. Instalar
installp -acgXd /updates all

# 5. Reboot
shutdown -Fr now
```

### **Cenário 3: Update Incremental**
```bash
# Base → TL1 → SP2
# 1. Base para TL1
suma -x -a Action=Download -a RqType=TL
installp -acgXd /updates all
shutdown -Fr now

# 2. TL1 para SP2
suma -x -a Action=Download -a RqType=SP
installp -acgXd /updates all
shutdown -Fr now
```

---

## 🐛 Troubleshooting

### **Problema: "No updates downloaded"**
```bash
# Solução: Baixar updates primeiro
suma -x -a Action=Download -a RqType=TL
```

### **Problema: "No backup detected"**
```bash
# Solução: Criar backup
mksysb -i /backup/backup.img
```

### **Problema: Versão não mudou**
```bash
# Solução: Fazer reboot
shutdown -Fr now
```

---

## 📚 Recursos Adicionais

- **AIX-UPDATE-GUIDE.md** - Guia completo de 500 linhas
- **TRAINING-GUIDE.md** - Guia de instalação AIX
- **help** - Comando help no console

---

## 🎉 Resumo

Agora você tem um simulador COMPLETO de updates AIX com:

✅ 3 tipos de updates (TL, SP, Security)
✅ Processo completo com animações
✅ Mudanças reais na versão do sistema
✅ Barras de progresso visuais
✅ Sistema de estado persistente
✅ Comandos interativos realistas

**Pratique o workflow completo e domine o processo de patching do AIX! 🚀**