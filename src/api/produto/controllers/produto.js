'use strict'

/**
 * produto controller
 */

const { createCoreController } = require( '@strapi/strapi' ).factories

/**
 * Parses numeric values from Brazilian or US format into a decimal number.
 * Handles: "3.000,33" (BR), "3,000.33" (US), "33,33" (BR), "33.33" (US), "3000,33", "3000.33".
 * When both comma and dot exist, the last one is the decimal separator.
 * When only one exists: 3 digits after = thousands separator; otherwise = decimal separator.
 */
function parseBrazilianDecimal ( value )
{
	if ( value == null || value === '' ) return 0
	let str = String( value ).trim().replace( /R\$\s?/gi, '' ).replace( /\s/g, '' )
	if ( !str ) return 0

	const hasComma = str.includes( ',' )
	const hasDot = str.includes( '.' )

	if ( hasComma && hasDot )
	{
		const lastComma = str.lastIndexOf( ',' )
		const lastDot = str.lastIndexOf( '.' )
		if ( lastComma > lastDot )
		{
			str = str.replace( /\./g, '' ).replace( ',', '.' )
		}
		else
		{
			str = str.replace( /,/g, '' )
		}
	}
	else if ( hasComma )
	{
		const afterComma = str.split( ',' )[ 1 ] || ''
		if ( afterComma.length === 3 && /^\d+$/.test( afterComma ) )
		{
			str = str.replace( ',', '' )
		}
		else
		{
			str = str.replace( ',', '.' )
		}
	}
	else if ( hasDot )
	{
		const afterDot = str.split( '.' )[ 1 ] || ''
		if ( afterDot.length === 3 && /^\d+$/.test( afterDot ) )
		{
			str = str.replace( /\./g, '' )
		}
	}

	const parsed = parseFloat( str )
	return Number.isNaN( parsed ) ? 0 : parsed
}

module.exports = createCoreController( 'api::produto.produto', ( { strapi } ) => ( {
	async SyncProducts ( ctx )
	{
		try
		{
			const { empresaId, produtos, deleteMissing } = ctx.request.body

			if ( !empresaId || !produtos || !Array.isArray( produtos ) )
			{
				return ctx.badRequest( 'empresaId and produtos array are required' )
			}

			// Buscar a tabela de cálculo da empresa no Strapi
			const empresa = await strapi.entityService.findOne( 'api::empresa.empresa', empresaId )
			const companyTablecalc = empresa ? parseFloat( empresa.tablecalc ) : 0.30

			const results = {
				created: 0,
				updated: 0,
				deleted: 0,
				failed: 0,
				details: []
			}

			const syncedProdIds = []

			for ( const prod of produtos )
			{
				try
				{
					const existing = await strapi.entityService.findMany( 'api::produto.produto', {
						filters: { prodId: prod.prodId },
						limit: 1
					} )

					// Se o produto está inativo no legado, removemos do Strapi
					if ( prod.ativo === "0" || prod.ativo === 0 )
					{
						if ( existing && existing.length > 0 )
						{
							await strapi.entityService.delete( 'api::produto.produto', existing[ 0 ].id )
							results.deleted++
						}
						continue
					}

					syncedProdIds.push( parseInt( prod.prodId ) )

					const productData = {
						nomeProd: prod.nomeProd,
						titulo: prod.titulo,
						modelo: prod.modelo,
						altura: parseInt( prod.altura ) || 0,
						comprimento: parseInt( prod.comprimento ) || 0,
						largura: parseInt( prod.largura ) || 0,
						vFinal: parseBrazilianDecimal( prod.vFinal ),
						prodId: parseInt( prod.prodId ),
						peso: parseBrazilianDecimal( prod.peso ),
						custoMp: parseBrazilianDecimal( prod.custo ),
						codigo: prod.codigo,
						lastChange: prod.lastChange,
						ncm: prod.ncm,
						tablecalc: companyTablecalc,
						pesoCx: parseBrazilianDecimal( prod.pesoCx ),
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

			// Se for uma sincronização em massa, removemos os produtos que não vieram na lista
			if ( deleteMissing )
			{
				const allCompanyProducts = await strapi.entityService.findMany( 'api::produto.produto', {
					filters: {
						empresa: empresaId,
						prodId: { $notIn: syncedProdIds }
					}
				} )

				for ( const p of allCompanyProducts )
				{
					await strapi.entityService.delete( 'api::produto.produto', p.id )
					results.deleted++
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

