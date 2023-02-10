module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/proposta/pdf',
      handler: 'proposta.index',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/proposta/pdf',
      handler: 'proposta.create',
      config: {
        auth: false,
      },
    },
  ],
};
