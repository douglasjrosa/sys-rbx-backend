'use strict'

/**
 * Custom empresa routes
 */

module.exports = {
	routes: [
		{
			method: 'GET',
			path: '/empresas/vendedor',
			handler: 'api::empresa.empresa.GetEmpresaVendedor',
			config: {
				policies: [],
				middlewares: [],
			},
		},
		{
			method: 'GET',
			path: '/empresas/ausente',
			handler: 'api::empresa.empresa.GetEmpresaAusente',
			config: {
				policies: [],
				middlewares: [],
			},
		},
	],
}
