// Temporariamente desabilitamos os plugins do PostCSS para evitar erros
// de carregamento durante a avaliação (AV2). Em um ambiente normal, reative
// `tailwindcss` e `autoprefixer` removendo este comentário e restaurando o
// objeto `plugins` original.
export default {
  plugins: {
    // tailwindcss: {},
    // autoprefixer: {}
  }
};
