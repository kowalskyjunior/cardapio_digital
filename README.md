# Cardápio Digital • NFC + QR + WhatsApp

Sistema completo de cardápio digital **mobile first**, feito com HTML5, CSS3 e JavaScript puro, com persistência local em localStorage.

> A senha do painel é uma proteção básica no front-end. Para produção com dados sensíveis, use autenticação e backend.

## 1. Arquitetura e fluxo

Fluxo principal:

NFC NDEF/URL → https://dominio.com/index.html?mesa=12 → validação da mesa → cardápio → produto/adicionais → carrinho → checkout → WhatsApp.

A camada de dados fica isolada em js/data.js. A interface não acessa localStorage diretamente; chama a API interna Data. Isso reduz o acoplamento e facilita a migração futura para REST/GraphQL.

Módulos:

- js/data.js — seed, persistência, pedidos, importação/exportação.
- js/utils.js — moeda, URLs de mesa, clipboard, imagens, tema e helpers.
- js/i18n.js — PT/EN/ES com detecção pelo idioma do navegador.
- js/cart.js — carrinho, quantidade, adicionais e cupom.
- js/menu.js — cardápio público, busca, categorias, modal e checkout.
- js/admin.js — CRUD, Kanban, tags NFC/QR, marca, mesas e backup.

### Sobre ES Modules e duplo clique

Browsers modernos podem bloquear type="module" e import/export ao abrir arquivos por file://. Para preservar a experiência de teste por duplo clique, esta versão usa módulos separados por arquivo com um único namespace global, window.CardapioDigital, em vez de imports nativos.

Em hospedagem HTTPS, os arquivos podem ser convertidos diretamente para import/export sem mudar a separação de responsabilidades.

## 2. Design system

Paleta:

- Fundo: #F7F7F5
- Superfície: #FFFFFF
- Texto: #171717
- Secundário: #6D6D67
- Borda: #E2E2DC
- Primária: #E65F3A
- Primária forte: #C94622
- Sucesso: #18865C

Tipografia: Inter via Google Fonts, com fallback system-ui.

Escala de espaçamento: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 px.

Componentes: cards, pills, botões de toque, barra fixa do carrinho, bottom sheet, dialogs, chips horizontais, estados vazios e Kanban.

## 3. Estrutura

~~~
/
├── index.html
├── admin.html
├── manifest.json
├── sw.js
├── README.md
├── assets/
│   └── icon.svg
├── css/
│   ├── base.css
│   ├── menu.css
│   └── admin.css
└── js/
    ├── data.js
    ├── menu.js
    ├── cart.js
    ├── admin.js
    ├── i18n.js
    └── utils.js
~~~

## 4. Rodar localmente

Duplo clique em index.html funciona para o cardápio básico e usa localStorage.

Para testar PWA/service worker e o comportamento mais próximo da produção:

~~~
python -m http.server 8080
~~~

Acesse:

~~~
http://localhost:8080/index.html?mesa=12
http://localhost:8080/admin.html
~~~

Senha inicial do painel: 1234.

## 5. Publicar em HTTPS

Hospede a pasta em GitHub Pages, Cloudflare Pages, Netlify, Vercel ou outra hospedagem estática.

O service worker exige contexto seguro. A URL que será gravada na tag NFC deve ser pública e usar HTTPS:

~~~
https://meurestaurante.com/index.html?mesa=12
~~~

## 6. Gravar a URL nas tags NFC

1. Abra o painel administrativo.
2. Entre em Tags NFC.
3. Localize a mesa.
4. Copie a URL completa.
5. No Android, abra NFC Tools ou equivalente.
6. Escolha Write / Gravar.
7. Selecione registro URL/URI.
8. Cole a URL da mesa.
9. Encoste o celular na tag e confirme.
10. Teste com outro aparelho.

Cada mesa deve ter sua própria URL, por exemplo mesa 12 termina em ?mesa=12.

## 7. QR Code por mesa

Tags NFC possuem alternativa em QR Code. O painel gera uma página imprimível para cada mesa e também permite imprimir todas.

A geração usa temporariamente api.qrserver.com. O cardápio continua sendo local-first; apenas a geração do QR depende de internet.

## 8. Limitações sem backend

- Produtos, pedidos, mesas e cupons ficam armazenados por navegador/dispositivo.
- Vários aparelhos não compartilham um Kanban.
- Limpar o armazenamento do navegador apaga os dados.
- A senha do painel não é uma barreira de segurança real.
- Imagens em base64 podem consumir bastante espaço.
- O envio é aberto no WhatsApp e depende do aparelho.

## 9. Migração para API

A UI já conversa com uma superfície de dados pequena:

~~~
CardapioDigital.Data.getState()
CardapioDigital.Data.update(...)
CardapioDigital.Data.addOrder(...)
CardapioDigital.Data.updateOrderStatus(...)
~~~

Uma migração típica:

1. Criar endpoints para categorias, produtos, adicionais, mesas, pedidos e cupons.
2. Trocar a implementação interna de Data por fetch.
3. Adicionar autenticação ao painel.
4. Hospedar imagens em object storage/CDN.
5. Persistir pedidos em banco.
6. Manter URLs permanentes de mesa.

## 10. Segurança, acessibilidade e performance

A interface usa HTML semântico, labels, foco visível, contraste adequado e textContent para conteúdos inseridos pelo usuário.

Cards usam imagens lazy-loaded, o shell inicial é pequeno e o service worker faz cache dos arquivos locais em visitas futuras.

## 11. Seed incluído

- 4 categorias
- 12 produtos
- 8 adicionais
- 12 mesas
- 1 cupom de exemplo

## 12. Direção visual

A experiência pública foi redesenhada tendo como referência padrões atuais de cardápio digital para restaurantes, incluindo vitrine de destaques, busca fixa, categorias horizontais, histórico de recompra e recomendações no carrinho. A referência principal de produto foi o Cardápio Digital da Anota AI, que hoje destaca QR Code, pedidos direto pelo WhatsApp, pagamento online, selos alimentares, recompra e sugestões/upsell. citeturn547966search0turn547966search1

A implementação não replica a identidade visual da referência. O objetivo é usar a mesma lógica de produto, com uma linguagem própria e uma camada de personalização para cada restaurante.

### Personalização pelo cliente

O painel agora permite configurar sem editar código:

- nome e descrição do restaurante;
- logo e imagem de capa;
- cor principal e fonte;
- estilo da capa: foto, compacta ou bloco de cor;
- densidade dos cards: compacto ou espaçado;
- arredondamento dos botões;
- exibição de selos, destaques e seção “Peça novamente”.

As preferências são armazenadas junto às configurações do restaurante e aplicadas automaticamente no cardápio público.
