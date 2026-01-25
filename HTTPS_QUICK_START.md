# HTTPS com Cloudflare - Guia Rápido

## 🚀 Configuração em 5 Passos

### 1. Criar Conta no Cloudflare
- Acesse [cloudflare.com](https://www.cloudflare.com)
- Crie uma conta gratuita
- Adicione seu domínio

### 2. Configurar DNS
- No painel Cloudflare, adicione um registro **A**:
  - **Name**: @ (ou subdomínio)
  - **IPv4**: IP do seu servidor
  - **Proxy**: 🟠 **Proxied** (laranja) - **IMPORTANTE!**

### 3. Alterar Nameservers
- Copie os nameservers do Cloudflare
- No seu registrador de domínio, substitua os nameservers
- Aguarde propagação (algumas horas)

### 4. Ativar SSL/TLS
- No painel Cloudflare: **SSL/TLS > Overview**
- Escolha **Full** ou **Full (strict)**
- Ative **Always Use HTTPS**

### 5. Configurar Servidor

```bash
# 1. Atualizar .env
echo "URL=https://seu-dominio.com" >> .env

# 2. Iniciar containers
docker-compose up -d

# 3. Verificar
docker-compose ps
```

## ✅ Pronto!

O Cloudflare cuida de tudo automaticamente:
- ✅ Certificados SSL renovados automaticamente
- ✅ Proteção DDoS
- ✅ CDN global
- ✅ Sem manutenção necessária

## 📝 Checklist

- [ ] Conta Cloudflare criada
- [ ] Domínio adicionado
- [ ] Registro A configurado (com proxy 🟠)
- [ ] Nameservers alterados no registrador
- [ ] SSL/TLS configurado como "Full"
- [ ] Always Use HTTPS ativado
- [ ] URL atualizada no .env
- [ ] Containers iniciados
- [ ] HTTPS testado no navegador

## 🔍 Verificação

```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs nginx

# Testar
curl -I https://seu-dominio.com
```

## ⚠️ Importante

- O proxy deve estar **🟠 Proxied** (laranja), não cinza
- Aguarde a propagação do DNS (pode levar horas)
- Use **Full** mode no SSL/TLS para começar

## 🆘 Problemas?

Consulte `HTTPS_SETUP.md` para troubleshooting detalhado.
