'use strict'

/**
 * Custom produto routes
 */

module.exports = {
	routes: [
		{
			method: 'POST',
			path: '/produtos/sync',
			handler: 'api::produto.produto.SyncProducts',
			config: {
				policies: [],
				middlewares: [],
			},
		},
	],
}
