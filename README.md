# 🌸 Dorama & BL Watchlist — Atividade 01 (Aula 08)

Aplicação web desenvolvida em **React** como atividade prática da **Aula 08 (Projeto React)** da disciplina de **Frameworks Front-end (SENAI)**, ministrada pelo Prof. Me. Deivison S. Takatu.

---

## 📋 Descrição do Projeto

O **Dorama & BL Watchlist** é um painel interativo para organizar e acompanhar doramas asiáticos e produções *Boys Love* (BL). A aplicação permite visualizar informações essenciais de cada obra (país de origem, gênero, número de episódios, nota e sinopse), filtrar títulos e controlar o progresso de visualização entre **"Quero assistir"** e **"Já assisti"**.

---

## 🚀 Funcionalidades

- **Catálogo de Títulos:** Exibição organizada em cards com gênero, avaliação, país, episódios e sinopse.
- **Busca Dinâmica:** Campo de pesquisa em tempo real por título da obra ou país de origem.
- **Filtro por Gênero:** Botões de seleção rápida para alternar entre *Todos*, *BL*, *Romance* e *Fantasia*.
- **Filtro de Pendências:** Opção para visualizar apenas os títulos que ainda não foram assistidos.
- **Controle de Status e Contador:** Botão interativo em cada card para marcar/desmarcar como assistido, atualizando automaticamente o placar geral no cabeçalho.

---

## 🧠 Conceitos de React Utilizados

Em conformidade com os requisitos da **Atividade 01 (Aula 08)**, o projeto aplica os seguintes fundamentos:

### 1. JSX
- Estruturação declarativa das interfaces combinando marcação semelhante ao HTML com expressões JavaScript dinâmicas entre chaves `{}` (como `{dorama.titulo}`, `{totalAssistidos}` e `{dorama.nota.toFixed(1)}`).
- Adoção das convenções do JSX, como o uso de `className` no lugar de `class`.

### 2. Componentes
- Divisão da interface em componentes independentes, coesos e reutilizáveis, organizados em uma árvore hierárquica a partir do componente raiz `App`:
  - `Cabecalho`: exibe o título da aplicação e o contador de progresso.
  - `BarraFiltros`: agrupa a busca por texto, os botões de gênero e o filtro de pendências.
  - `ListaDoramas`: gerencia a exibição da grade de cards ou da mensagem de lista vazia.
  - `CardDorama`: representa cada obra individualmente.
  - `Rodape`: exibe as informações institucionais da atividade.

### 3. Props
- Comunicação unidirecional de dados do componente pai (`App`) para os componentes filhos por meio de propriedades (`props`).
- Passagem de tipos variados de dados, incluindo strings, números, booleanos, objetos (`dorama`) e funções de callback (`aoAlternarStatus`, `aoMudarBusca`, `aoMudarGenero`).

### 4. Virtual DOM e Reconciliação
- Atualização eficiente da interface gerenciada pelo React a partir das mudanças de estado (`useState`).
- Ao clicar no botão de status de um título, o React compara a nova árvore virtual com a anterior (reconciliação) e atualiza no DOM real apenas o card alterado e o contador do cabeçalho, sem recarregar a página.

### 5. Listas e Keys
- Manipulação de coleções de dados (arrays de objetos) utilizando `.filter()` para aplicar os critérios de busca e `.map()` para renderizar dinamicamente os componentes `CardDorama` e os botões de gênero.
- Uso da propriedade especial `key` com identificador único (`key={dorama.id}`) para garantir a identidade e a estabilidade de cada item durante as atualizações da lista.

### 6. Renderização Condicional
- **Retorno antecipado com `if`:** No componente `ListaDoramas`, caso o array filtrado esteja vazio (`doramas.length === 0`), o componente interrompe a renderização da grade e exibe uma mensagem informativa ao usuário.
- **Operador Ternário (`? :`):** Utilizado no `CardDorama` e na `BarraFiltros` para alternar dinamicamente classes CSS e textos dos botões de acordo com o estado atual (ex.: `"✓ Já assisti"` vs `"+ Quero assistir"`).

---

## 🛠️ Estrutura de Pastas

```text
├── README.md
├── package.json
└── src/
    ├── components/
    │   ├── BarraFiltros.jsx
    │   ├── Cabecalho.jsx
    │   ├── CardDorama.jsx
    │   ├── ListaDoramas.jsx
    │   └── Rodape.jsx
    ├── data/
    │   └── doramasData.js
    ├── App.css
    ├── App.jsx
    └── main.jsx
```

---

## 💻 Como Executar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Ry4nBR/bl-dorama-watchlist-projeto-react.git
   ```

2. **Acesse a pasta do projeto:**
   ```bash
   cd bl-dorama-watchlist-projeto-react
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. Acesse no navegador o endereço local exibido no terminal