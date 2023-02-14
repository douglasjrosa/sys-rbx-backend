module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/pdf/:pedido',
      handler: 'proposta.index',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/proposta/:page',
      handler: 'proposta.create',
      config: {
        auth: false,
      },
    },
  ],
};
