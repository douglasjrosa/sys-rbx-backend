module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/pdf/:pedido',
      handler: 'proposta.index',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/proposta/:page',
      handler: 'proposta.create',
      config: {
        auth: false,
      },
    },
  ],
};
