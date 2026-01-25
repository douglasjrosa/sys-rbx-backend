# Configuração HTTPS com Cloudflare

Este guia explica passo a passo como configurar HTTPS usando Cloudflare como proxy reverso.

## Vantagens do Cloudflare

- ✅ **Sem renovação de certificados** - Cloudflare gerencia tudo automaticamente
- ✅ **Configuração simples** - Apenas configuração de DNS
- ✅ **Proteção DDoS incluída** - Gratuita no plano básico
- ✅ **CDN gratuito** - Acelera o carregamento globalmente
- ✅ **Firewall e segurança adicional** - WAF básico incluso
- ✅ **Analytics** - Estatísticas de tráfego básicas

## Passo a Passo Completo

### 1. Criar Conta no Cloudflare

1. Acesse [cloudflare.com](https://www.cloudflare.com)
2. Clique em **Sign Up** (Cadastrar)
3. Preencha seus dados e confirme o email

### 2. Adicionar Seu Domínio

1. No painel do Cloudflare, clique em **Add a Site** (Adicionar um Site)
2. Digite seu domínio (ex: `meudominio.com`)
3. Escolha o plano **Free** (Gratuito)
4. Clique em **Continue**

### 3. Verificar Registros DNS

1. O Cloudflare irá escanear seus registros DNS existentes
2. Revise os registros encontrados
3. Certifique-se de que há um registro **A** apontando para o IP do seu servidor
4. Se não houver, você precisará adicionar:
   - **Type**: A
   - **Name**: @ (ou seu subdomínio)
   - **IPv4 address**: IP do seu servidor
   - **Proxy status**: 🟠 Proxied (laranja) - **IMPORTANTE!**

5. Clique em **Continue**

### 4. Alterar Nameservers

1. O Cloudflare mostrará dois nameservers (ex: `alice.ns.cloudflare.com` e `bob.ns.cloudflare.com`)
2. **Copie esses nameservers**
3. Acesse o painel do seu registrador de domínio (onde você comprou o domínio)
4. Procure por **DNS Settings** ou **Nameservers**
5. **Substitua** os nameservers atuais pelos do Cloudflare
6. Salve as alterações

**⚠️ Importante:** A propagação pode levar de 24 a 48 horas, mas geralmente acontece em algumas horas.

### 5. Configurar SSL/TLS

1. No painel do Cloudflare, vá em **SSL/TLS**
2. Na seção **Overview**, escolha:
   - **Full** - Recomendado (Cloudflare faz HTTPS com o servidor)
   - **Full (strict)** - Mais seguro, mas requer certificado válido no servidor
3. Para começar, use **Full**

### 6. Configurar Firewall (Opcional mas Recomendado)

1. No painel, vá em **Security > WAF**
2. Ative o **Web Application Firewall** (gratuito no plano básico)
3. Configure regras básicas se necessário

### 7. Configurar o Servidor

1. **Atualize o arquivo `.env`:**
   ```
   URL=https://seu-dominio.com
   ```
   (Substitua `seu-dominio.com` pelo seu domínio real)

2. **Inicie os containers:**
   ```bash
   docker-compose up -d
   ```

3. **Verifique se está funcionando:**
   ```bash
   # Ver status dos containers
   docker-compose ps
   
   # Ver logs do Nginx
   docker-compose logs nginx
   
   # Testar acesso
   curl -I http://seu-dominio.com
   ```

### 8. Verificar HTTPS

1. Aguarde a propagação do DNS (pode levar algumas horas)
2. Acesse `https://seu-dominio.com` no navegador
3. Você deve ver o cadeado verde indicando HTTPS ativo

## Como Funciona

```
Usuário → Cloudflare (HTTPS) → Seu Servidor (HTTP) → Strapi
```

1. O usuário acessa `https://seu-dominio.com`
2. O Cloudflare termina a conexão HTTPS (certificado SSL)
3. O Cloudflare faz proxy para seu servidor via HTTP (porta 80)
4. O Nginx recebe a requisição e encaminha para o Strapi
5. O Cloudflare adiciona headers para identificar o IP real do cliente

## Configurações Adicionais Recomendadas

### 1. Sempre Usar HTTPS

No painel Cloudflare:
- Vá em **SSL/TLS > Edge Certificates**
- Ative **Always Use HTTPS**

### 2. Redirecionar HTTP para HTTPS

No painel Cloudflare:
- Vá em **SSL/TLS > Edge Certificates**
- Ative **Automatic HTTPS Rewrites**

### 3. Configurar Cache (Opcional)

No painel Cloudflare:
- Vá em **Caching > Configuration**
- Configure regras de cache para arquivos estáticos

## Verificação e Troubleshooting

### Verificar Status

```bash
# Verificar containers
docker-compose ps

# Ver logs
docker-compose logs nginx
docker-compose logs strapiVendas

# Testar conectividade
curl -I https://seu-dominio.com
```

### Problemas Comuns

#### 1. **502 Bad Gateway**
- **Causa**: Servidor não está acessível ou Nginx não está rodando
- **Solução**: 
  ```bash
  docker-compose ps
  docker-compose logs nginx
  ```

#### 2. **DNS não propagou**
- **Causa**: Nameservers ainda não foram atualizados
- **Solução**: Aguarde até 48 horas ou verifique se alterou corretamente

#### 3. **HTTPS não funciona**
- **Causa**: SSL/TLS não está configurado como "Full" ou "Full (strict)"
- **Solução**: Verifique em **SSL/TLS > Overview** no painel Cloudflare

#### 4. **Erro de certificado no navegador**
- **Causa**: Certificado ainda não foi emitido
- **Solução**: Aguarde alguns minutos após configurar o DNS

#### 5. **IP real do cliente não aparece**
- **Causa**: Headers do Cloudflare não estão sendo lidos
- **Solução**: O `nginx.cloudflare.conf` já está configurado para isso

## Segurança Adicional

### Restringir Acesso Direto ao Servidor

Para maior segurança, você pode configurar o firewall do servidor para aceitar apenas conexões do Cloudflare:

```bash
# Lista de IPs do Cloudflare (atualize periodicamente)
# https://www.cloudflare.com/ips/

# Exemplo com ufw (Ubuntu)
sudo ufw allow from 173.245.48.0/20 to any port 80
sudo ufw allow from 103.21.244.0/22 to any port 80
# ... adicione todos os ranges do Cloudflare
```

Ou use o script automático do Cloudflare:
```bash
# Baixar e executar script do Cloudflare
curl https://www.cloudflare.com/ips-v4 -o /tmp/cf_ips.txt
# Configure seu firewall com esses IPs
```

## Próximos Passos

Após configurar o HTTPS:

1. ✅ Teste todas as rotas da API
2. ✅ Verifique se os webhooks estão funcionando
3. ✅ Configure backups regulares
4. ✅ Monitore os logs do Cloudflare
5. ✅ Configure alertas (opcional, plano pago)

## Suporte

- [Documentação Cloudflare](https://developers.cloudflare.com/)
- [Status do Cloudflare](https://www.cloudflarestatus.com/)
- [Community Cloudflare](https://community.cloudflare.com/)
