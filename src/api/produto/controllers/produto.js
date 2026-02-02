'use strict'

/**
 * produto controller
 */

const { createCoreController } = require( '@strapi/strapi' ).factories

module.exports = createCoreController( 'api::produto.produto', ( { strapi } ) => ( {
	async SyncProducts ( ctx )
	{
		try
		{
			const { empresaId, produtos } = ctx.request.body

			if ( !empresaId || !produtos || !Array.isArray( produtos ) )
			{
				return ctx.badRequest( 'empresaId and produtos array are required' )
			}

			const results = {
				created: 0,
				updated: 0,
				failed: 0,
				details: []
			}

			for ( const prod of produtos )
			{
				try
				{
					// Check if product already exists in Strapi by prodId
					const existing = await strapi.entityService.findMany( 'api::produto.produto', {
						filters: { prodId: prod.prodId },
						limit: 1
					} )

					const productData = {
						nomeProd: prod.nomeProd,
						titulo: prod.titulo,
						modelo: prod.modelo,
						altura: parseInt( prod.altura ) || 0,
						comprimento: parseInt( prod.comprimento ) || 0,
						largura: parseInt( prod.largura ) || 0,
						vFinal: parseFloat( prod.vFinal ) || 0,
						prodId: parseInt( prod.prodId ),
						peso: parseFloat( prod.peso ) || 0,
						custoMp: parseFloat( prod.custo ) || 0,
						codigo: prod.codigo,
						lastChange: prod.lastChange,
						ncm: prod.ncm,
						tablecalc: parseFloat( prod.tabela ) || 0,
						pesoCx: parseFloat( prod.pesoCx ) || 0,
						lastUser: prod.lastUser,
						empresa: empresaId,
						publishedAt: new Date(),
					}

					if ( existing && existing.length > 0 )
					{
						// Update
						await strapi.entityService.update( 'api::produto.produto', existing[ 0 ].id, {
							data: productData
						} )
						results.updated++
					} else
					{
						// Create
						await strapi.entityService.create( 'api::produto.produto', {
							data: productData
						} )
						results.created++
					}
				} catch ( err )
				{
					strapi.log.error( `Error syncing product ${ prod.prodId }: ${ err.message }` )
					results.failed++
					results.details.push( { prodId: prod.prodId, error: err.message } )
				}
			}

			return results
		} catch ( error )
		{
			strapi.log.error( error )
			ctx.throw( 400, error )
		}
	},
} ) )

