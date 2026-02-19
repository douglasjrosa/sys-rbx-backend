'use strict'


/**
 * empresa controller
 */

const { createCoreController } = require( '@strapi/strapi' ).factories

const TZ_SAO_PAULO = 'America/Sao_Paulo'

function toArray ( val )
{
	return Array.isArray( val ) ? val : ( val?.data || [] )
}

/**
 * Returns today's date as YYYY-MM-DD in America/Sao_Paulo (Option B: fixed TZ).
 */
function getHojeSaoPauloStr ()
{
	const formatter = new Intl.DateTimeFormat( 'en-CA', {
		timeZone: TZ_SAO_PAULO,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	} )
	const parts = formatter.formatToParts( new Date() )
	const y = parts.find( ( p ) => p.type === 'year' )?.value
	const m = parts.find( ( p ) => p.type === 'month' )?.value
	const d = parts.find( ( p ) => p.type === 'day' )?.value
	if ( !y || !m || !d ) return null
	return `${ y }-${ m }-${ d }`
}

/**
 * Normalizes proxima (Date or string) to YYYY-MM-DD or null.
 */
function toProximaYYYYMMDD ( val )
{
	if ( val == null ) return null
	if ( val instanceof Date )
	{
		const y = val.getUTCFullYear(), m = val.getUTCMonth() + 1, d = val.getUTCDate()
		return `${ y }-${ String( m ).padStart( 2, '0' ) }-${ String( d ).padStart( 2, '0' ) }`
	}
	const p = String( val ).trim()
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec( p )
	if ( !match ) return null
	return `${ match[ 1 ] }-${ match[ 2 ] }-${ match[ 3 ] }`
}

/**
 * Checks if text is numeric (CNPJ detection)
 * Returns true if text contains only numbers
 */
function isNumericText ( texto )
{
	if ( !texto || typeof texto !== 'string' ) return false
	// Remove whitespace and check if only numbers remain
	const cleaned = texto.trim().replace( /\s/g, '' )
	return /^\d+$/.test( cleaned )
}

/**
 * Normalizes userId from query (handles array, empty, 'null' string).
 * Returns a usable id (number or string) or null when no vendor filter.
 */
function normalizeUserId ( val )
{
	if ( val == null ) return null
	const v = Array.isArray( val ) ? val[ 0 ] : val
	if ( v == null ) return null
	const s = String( v ).trim()
	if ( s === '' || s === 'null' || s === 'undefined' ) return null
	const n = parseInt( s, 10 )
	return Number.isNaN( n ) ? s : n
}

/**
 * Gets the most recent interaction between a specific vendor and the company
 * Filters interactions by userId and returns the most recent one based on 'proxima' date
 */
function getInteracaoMaisRecentePorVendedor ( interacoes, userId )
{
	if ( !interacoes ) return null
	if ( userId == null || userId === '' ) return null

	const interacoesArray = toArray( interacoes )
	if ( !interacoesArray.length ) return null

	// Filter interactions by vendor id only (avoid false matches by vendedor_name)
	const userIdStr = String( userId )
	const interacoesDoVendedor = interacoesArray.filter( ( interacao ) =>
	{
		const attrs = interacao?.attributes || interacao || {}
		const vendedorId = attrs.vendedor?.id ?? attrs.vendedor?.data?.id
		if ( vendedorId == null ) return false
		return String( vendedorId ) === userIdStr
	} )

	if ( interacoesDoVendedor.length === 0 ) return null

	// Sort by proxima DESC, then createdAt DESC; pick most recent for grouping
	const sorted = interacoesDoVendedor.slice().sort( ( a, b ) =>
	{
		const attrsA = a?.attributes || a || {}
		const attrsB = b?.attributes || b || {}
		const tA = attrsA.proxima ? new Date( attrsA.proxima ).getTime() : ( attrsA.createdAt ? new Date( attrsA.createdAt ).getTime() : 0 )
		const tB = attrsB.proxima ? new Date( attrsB.proxima ).getTime() : ( attrsB.createdAt ? new Date( attrsB.createdAt ).getTime() : 0 )
		return tB - tA
	} )
	return sorted[ 0 ]
}

/**
 * Calculates interaction group based on 'proxima' date.
 * dataAtual: YYYY-MM-DD string (today in America/Sao_Paulo).
 * Returns: 1=proxima < hoje, 2=proxima === hoje, 3=sem interação, 4=proxima > hoje
 */
function getGrupoInteracao ( interacaoMaisRecente, dataAtual )
{
	if ( !interacaoMaisRecente )
	{
		return 3 // Grupo 3: Sem interação registrada
	}

	const attrs = interacaoMaisRecente?.attributes || interacaoMaisRecente || {}

	if ( attrs.status_atendimento === false )
	{
		return 5 // Grupo 5: Vendedor não quer mais atender este cliente.
	}

	const proximaStr = toProximaYYYYMMDD( attrs.proxima )
	if ( !proximaStr || !dataAtual )
	{
		return 3 // Sem interação válida ou hoje não disponível
	}

	// Compare YYYY-MM-DD strings (lexicographic order works)
	if ( proximaStr === dataAtual )
		return 2 // Grupo 2: proxima === hoje
	if ( proximaStr < dataAtual )
		return 1 // Grupo 1: proxima < hoje
	return 4 // Grupo 4: proxima > hoje
}

/**
 * Calculates purchaseFrequency priority
 * Returns: 0=Monthly, 1=Occasionally, 2=Rarely, 3=null
 */
function getPrioridadePurchaseFrequency ( frequency )
{
	if ( frequency === 'Mensalmente' ) return 0
	if ( frequency === 'Eventualmente' ) return 1
	if ( frequency === 'Raramente' ) return 2
	return 3 // No frequency defined
}

/**
 * Gets the value of the last won business (etapa=6 AND andamento=5)
 * Returns the numeric value or 0 if not available
 */
function getValorUltimoNegocioGanho ( businesses )
{
	const businessesArray = toArray( businesses )
	if ( !businessesArray.length ) return 0

	// Filter won businesses: etapa === 6 AND andamento === 5
	const negociosGanhos = businessesArray.filter( ( n ) =>
	{
		// Handle both { attributes: {...} } and plain object formats
		const attrs = n?.attributes || n || {}
		return attrs.etapa === 6 && attrs.andamento === 5
	} )

	if ( negociosGanhos.length === 0 ) return 0

	// Sort by date_conclucao DESC (most recent first)
	const negociosOrdenados = negociosGanhos.sort( ( a, b ) =>
	{
		const attrsA = a?.attributes || a || {}
		const attrsB = b?.attributes || b || {}
		const dataA = attrsA.date_conclucao ? new Date( attrsA.date_conclucao ).getTime() : 0
		const dataB = attrsB.date_conclucao ? new Date( attrsB.date_conclucao ).getTime() : 0
		return dataB - dataA // DESC
	} )

	const ultimoNegocioGanho = negociosOrdenados[ 0 ]
	const attrs = ultimoNegocioGanho?.attributes || ultimoNegocioGanho || {}

	// Try to get value from Budget or totalGeral from first order
	let valor = attrs.Budget || null

	if ( !valor )
	{
		const pedidos = attrs.pedidos?.data || attrs.pedidos || []
		if ( Array.isArray( pedidos ) && pedidos.length > 0 )
		{
			const primeiroPedido = pedidos[ 0 ]
			const pedidoAttrs = primeiroPedido?.attributes || primeiroPedido || {}
			valor = pedidoAttrs.totalGeral || null
		}
	}

	if ( !valor ) return 0

	// Convert string to number (remove formatting)
	if ( typeof valor === 'string' )
	{
		const valorLimpo = valor.replace( /[^0-9,]/g, '' ).replace( /\./g, '' ).replace( ',', '.' )
		const valorNumerico = parseFloat( valorLimpo )
		return isNaN( valorNumerico ) ? 0 : valorNumerico
	}

	return parseFloat( valor ) || 0
}

/**
 * Returns the most recent business (by date_conclucao, then createdAt), regardless of vendor.
 */
function getUltimoNegocio ( businesses )
{
	const arr = toArray( businesses )
	if ( !arr.length ) return null
	const sorted = [ ...arr ].sort( ( a, b ) =>
	{
		const attrsA = a?.attributes || a || {}
		const attrsB = b?.attributes || b || {}
		const tA = attrsA.date_conclucao
			? new Date( attrsA.date_conclucao ).getTime()
			: ( attrsA.createdAt ? new Date( attrsA.createdAt ).getTime() : 0 )
		const tB = attrsB.date_conclucao
			? new Date( attrsB.date_conclucao ).getTime()
			: ( attrsB.createdAt ? new Date( attrsB.createdAt ).getTime() : 0 )
		return tB - tA
	} )
	return sorted[ 0 ]
}

/**
 * Determines the interaction group for an empresa.
 * Returns { grupo, interacao }.
 * When vendedorId is provided: uses only that vendor's interactions (groups built exclusively from them).
 * When vendedorId is null/undefined: uses the most recent interaction from ANY vendor.
 */
function getEmpresaGrupoInfo ( empresa, dataAtual, vendedorId )
{
	const attrs = empresa?.attributes || empresa || {}
	const interacaos = attrs.interacaos || empresa.interacaos || []

	// Get most recent interaction
	// If vendedorId is provided (including 0), use only that vendor's interactions.
	// If not, use most recent from any vendor.
	let interacaoMaisRecente = null
	if ( vendedorId != null && vendedorId !== '' )
	{
		interacaoMaisRecente = getInteracaoMaisRecentePorVendedor( interacaos, vendedorId )
	} else
	{
		interacaoMaisRecente = getInteracaoMaisRecenteDeQualquerVendedor( interacaos )
	}

	const grupo = getGrupoInteracao( interacaoMaisRecente, dataAtual )

	return { grupo, interacao: interacaoMaisRecente }
}

/**
 * Sorts empresas within a sub-group by valor (descending), then nome (alphabetical).
 * Used after splitting by purchaseFrequency.
 */
function sortEmpresasByValorAndNome ( empresas )
{
	return [ ...empresas ].sort( ( a, b ) =>
	{
		const attrsA = a?.attributes || a || {}
		const attrsB = b?.attributes || b || {}
		const businessesA = attrsA.businesses || a.businesses || []
		const businessesB = attrsB.businesses || b.businesses || []
		const valorA = getValorUltimoNegocioGanho( businessesA )
		const valorB = getValorUltimoNegocioGanho( businessesB )
		if ( valorA !== valorB ) return valorB - valorA
		const nomeA = ( attrsA.nome || a.nome || '' ).toLowerCase()
		const nomeB = ( attrsB.nome || b.nome || '' ).toLowerCase()
		return nomeA.localeCompare( nomeB )
	} )
}

/**
 * Within each interaction group, separate into sub-groups by purchaseFrequency,
 * then sort each sub-group by valor (descending) and nome.
 * Order: Mensalmente → Eventualmente → Raramente → null/undefined.
 */
function sortEmpresasWithinGroup ( empresas )
{
	const subGrupos = {
		0: [], // Mensalmente
		1: [], // Eventualmente
		2: [], // Raramente
		3: [], // null/undefined
	}

	for ( const empresa of empresas )
	{
		const attrs = empresa?.attributes || empresa || {}
		const freq = attrs.purchaseFrequency || empresa.purchaseFrequency
		const prioridade = getPrioridadePurchaseFrequency( freq )
		subGrupos[ prioridade ].push( empresa )
	}

	const sorted = []
	for ( const prioridade of [ 0, 1, 2, 3 ] )
	{
		const sub = sortEmpresasByValorAndNome( subGrupos[ prioridade ] )
		sorted.push( ...sub )
	}
	return sorted
}

/**
 * Separates empresas into 5 groups and sorts each group.
 * Used for both /vendedor and /ausente relevance sort.
 * Returns all empresas sorted by group, then by criteria within each group.
 */
function ordenarEmpresasPorRelevancia ( empresas, dataAtual, vendedorId )
{
	// Step 1: Separate empresas into 5 groups
	const grupos = {
		1: [], // proxima < hoje (atrasada)
		2: [], // proxima === hoje
		3: [], // sem interação
		4: [], // proxima > hoje (futura)
		5: [], // status_atendimento === false
	}

	for ( const empresa of empresas )
	{
		const { grupo } = getEmpresaGrupoInfo( empresa, dataAtual, vendedorId )
		grupos[ grupo ].push( empresa )
	}
	// Step 2: Sort each group by purchaseFrequency, valor, nome
	for ( const grupoNum of [ 1, 2, 3, 4, 5 ] )
	{
		grupos[ grupoNum ] = sortEmpresasWithinGroup( grupos[ grupoNum ] )
	}

	// Step 3: Concatenate groups in order (1, 2, 3, 4, 5)
	return [
		...grupos[ 1 ],
		...grupos[ 2 ],
		...grupos[ 3 ],
		...grupos[ 4 ],
		...grupos[ 5 ],
	]
}

/**
 * Gets the most recent interaction from any vendor for an empresa
 */
function getInteracaoMaisRecenteDeQualquerVendedor ( interacaos )
{
	const allInteracoes = toArray( interacaos )
	if ( !allInteracoes.length ) return null

	const sorted = [ ...allInteracoes ].sort( ( i1, i2 ) =>
	{
		const attrs1 = i1?.attributes || i1 || {}
		const attrs2 = i2?.attributes || i2 || {}
		const data1 = attrs1.updatedAt ? new Date( attrs1.updatedAt ).getTime() : 0
		const data2 = attrs2.updatedAt ? new Date( attrs2.updatedAt ).getTime() : 0
		return data2 - data1
	} )

	return sorted[ 0 ]
}

const EMPRESA_FIELDS = [
	'nome',
	'ultima_compra',
	'valor_ultima_compra',
	'expiresIn',
	'purchaseFrequency',
	'CNAE',
	'cidade',
	'uf'
]

const EMPRESA_POPULATE = {
	businesses: {
		fields: [ 'etapa', 'andamento', 'date_conclucao', 'Budget', 'vendedor_name' ],
		populate: {
			pedidos: { fields: [ 'totalGeral' ] },
			vendedor: { fields: [ 'username' ] },
		},
	},
	interacaos: {
		fields: [
			'proxima',
			'vendedor_name',
			'status_atendimento',
			'descricao',
			'tipo',
			'objetivo',
			'createdAt',
		],
		populate: { vendedor: { fields: [ 'id', 'username' ] } },
	},
	user: { fields: [ 'username' ] },
}

function buildEmpresaFilters ( { userId, filtroTexto, filtroCNAE, filtroCidade }, userMode )
{
	const filters = {}
	const isCNPJ = filtroTexto && String( filtroTexto ).trim() !== '' && isNumericText( filtroTexto )

	if ( isCNPJ )
	{
		filters.CNPJ = { $containsi: String( filtroTexto ).trim() }
		return filters
	}

	const uid = normalizeUserId( userId )
	if ( userMode === 'vendedor' )
	{
		filters.user = uid != null ? { id: { $eq: uid } } : { id: { $notNull: true } }
	} else
	{
		// ausente: always only empresas without assigned vendor. userId filter (when present)
		// only affects which "last interaction" is returned and grouping in relevancia sort.
		filters.user = { id: { $null: true } }
	}

	if ( filtroTexto && String( filtroTexto ).trim() !== '' )
	{
		filters.$or = [
			{ nome: { $containsi: filtroTexto } },
			{ fantasia: { $containsi: filtroTexto } },
			{ CNPJ: { $containsi: filtroTexto } },
		]
	}
	if ( filtroCNAE && String( filtroCNAE ).trim() !== '' )
	{
		filters.CNAE = { $containsi: filtroCNAE }
	}
	if ( filtroCidade && String( filtroCidade ).trim() !== '' )
	{
		filters.cidade = { $containsi: String( filtroCidade ).trim() }
	}
	return filters
}

function applyPagination ( arr, page, pageSize )
{
	const pageNum = parseInt( page, 10 ) || 1
	const pageSizeNum = parseInt( pageSize, 10 ) || 50
	const total = arr.length
	const start = ( pageNum - 1 ) * pageSizeNum
	const data = arr.slice( start, start + pageSizeNum )
	return {
		data,
		total,
		page: pageNum,
		pageSize: pageSizeNum,
		pageCount: Math.ceil( total / pageSizeNum ),
	}
}

function normalizeEmpresaToStrapiResponse ( empresa, dataAtual, userIdForInteracao )
{
	const id = empresa.id || empresa?.attributes?.id
	const attrs = empresa?.attributes || empresa || {}
	const normalizedAttrs = { ...attrs }

	const { grupo } = getEmpresaGrupoInfo( empresa, dataAtual, userIdForInteracao )
	normalizedAttrs.grupoInteracao = grupo

	const rawBiz = attrs.businesses
	const ultimoNegocio = getUltimoNegocio( rawBiz )
	normalizedAttrs.businesses = { data: ultimoNegocio ? [ ultimoNegocio ] : [] }

	const rawInt = attrs.interacaos
	const hasVendedorFilter = userIdForInteracao != null && userIdForInteracao !== ''
	if ( hasVendedorFilter )
	{
		const ultimaInteracaoVendedor = getInteracaoMaisRecentePorVendedor( rawInt, userIdForInteracao )
		normalizedAttrs.interacaos = { data: ultimaInteracaoVendedor ? [ ultimaInteracaoVendedor ] : [] }
	} else
	{
		const arr = toArray( rawInt )
		normalizedAttrs.interacaos = { data: arr }
	}

	const u = attrs.user
	if ( u?.data )
		normalizedAttrs.user = u
	else if ( u?.id || u?.username )
		normalizedAttrs.user = { data: { id: u.id, attributes: { username: u.username } } }
	else
		normalizedAttrs.user = { data: null }

	return { id, attributes: normalizedAttrs }
}

function sortEmpresasByExpiresInAsc ( empresas )
{
	return [ ...empresas ].sort( ( a, b ) =>
	{
		const attrsA = a?.attributes || a || {}
		const attrsB = b?.attributes || b || {}
		const expA = attrsA.expiresIn
		const expB = attrsB.expiresIn
		const tA = expA ? new Date( expA ).getTime() : null
		const tB = expB ? new Date( expB ).getTime() : null
		if ( tA == null && tB == null ) return 0
		if ( tA == null ) return 1
		if ( tB == null ) return -1
		return tA - tB
	} )
}

async function handleRelevanciaSort ( ctx, filters, strapi )
{
	const { page = 1, pageSize = 50, userId } = ctx.query
	const dataAtual = getHojeSaoPauloStr()
	const userIdForInteracao = normalizeUserId( userId )

	const queryParamsAll = {
		fields: EMPRESA_FIELDS,
		populate: EMPRESA_POPULATE,
		filters,
		pagination: { pageSize: 10000 },
	}

	const responseAll = await strapi.entityService.findMany( 'api::empresa.empresa', queryParamsAll )
	const empresasArray = toArray( responseAll )

	const empresasOrdenadas = ordenarEmpresasPorRelevancia( empresasArray, dataAtual, userIdForInteracao )
	const { data, total, page: p, pageSize: ps, pageCount } = applyPagination(
		empresasOrdenadas,
		page,
		pageSize,
	)

	const items = data.map( ( emp ) => normalizeEmpresaToStrapiResponse( emp, dataAtual, userIdForInteracao ) )

	ctx.body = {
		data: items,
		meta: { pagination: { page: p, pageSize: ps, pageCount, total } },
	}
}

async function handleExpiracaoSort ( ctx, filters, strapi )
{
	const { page = 1, pageSize = 50, userId } = ctx.query
	const dataAtual = getHojeSaoPauloStr()
	const userIdForInteracao = normalizeUserId( userId )

	const queryParamsAll = {
		fields: EMPRESA_FIELDS,
		populate: EMPRESA_POPULATE,
		filters,
		pagination: { pageSize: 10000 },
	}

	const responseAll = await strapi.entityService.findMany( 'api::empresa.empresa', queryParamsAll )
	const empresasArray = toArray( responseAll )

	const empresasOrdenadas = sortEmpresasByExpiresInAsc( empresasArray )
	const { data, total, page: p, pageSize: ps, pageCount } = applyPagination(
		empresasOrdenadas,
		page,
		pageSize,
	)

	const items = data.map( ( emp ) => normalizeEmpresaToStrapiResponse( emp, dataAtual, userIdForInteracao ) )

	ctx.body = {
		data: items,
		meta: { pagination: { page: p, pageSize: ps, pageCount, total } },
	}
}

module.exports = createCoreController( 'api::empresa.empresa', ( { strapi } ) => ( {
	async GetEmpresaVendedor ( ctx )
	{
		try
		{
			const { sortOrder, page = 1, pageSize = 50 } = ctx.query
			const filters = buildEmpresaFilters( ctx.query, 'vendedor' )

			if ( sortOrder === 'relevancia' )
			{
				await handleRelevanciaSort( ctx, filters, strapi )
				return
			}
			if ( sortOrder === 'expiracao' )
			{
				await handleExpiracaoSort( ctx, filters, strapi )
				return
			}

			const queryParams = {
				fields: EMPRESA_FIELDS,
				populate: EMPRESA_POPULATE,
				filters,
				pagination: { page: parseInt( page, 10 ) || 1, pageSize: parseInt( pageSize, 10 ) || 50 },
			}

			const result = await strapi.entityService.findPage( 'api::empresa.empresa', queryParams )
			const dataAtual = getHojeSaoPauloStr()
			const userIdForInteracao = normalizeUserId( ctx.query.userId )
			const rawData = result.data ?? result.results ?? []
			ctx.body = {
				...result,
				data: rawData.map( ( emp ) =>
					normalizeEmpresaToStrapiResponse( emp, dataAtual, userIdForInteracao ),
				),
			}
		} catch ( error )
		{
			ctx.throw( 400, error )
		}
	},

	async GetEmpresaAusente ( ctx )
	{
		try
		{
			const { sortOrder, page = 1, pageSize = 50 } = ctx.query
			const filters = buildEmpresaFilters( ctx.query, 'ausente' )

			if ( sortOrder === 'relevancia' )
			{
				await handleRelevanciaSort( ctx, filters, strapi )
				return
			}
			if ( sortOrder === 'expiracao' )
			{
				await handleExpiracaoSort( ctx, filters, strapi )
				return
			}

			const queryParams = {
				fields: EMPRESA_FIELDS,
				populate: EMPRESA_POPULATE,
				filters,
				pagination: { page: parseInt( page, 10 ) || 1, pageSize: parseInt( pageSize, 10 ) || 50 },
			}

			const result = await strapi.entityService.findPage( 'api::empresa.empresa', queryParams )
			const dataAtual = getHojeSaoPauloStr()
			const userIdForInteracao = normalizeUserId( ctx.query.userId )
			const rawData = result.data ?? result.results ?? []
			ctx.body = {
				...result,
				data: rawData.map( ( emp ) =>
					normalizeEmpresaToStrapiResponse( emp, dataAtual, userIdForInteracao ),
				),
			}
		} catch ( error )
		{
			ctx.throw( 400, error )
		}
	},

	/**
	 * GetEmpresaOutrosVendedores: companies assigned to other vendors (not the current user).
	 * Used by vendors to see that a company exists but belongs to someone else.
	 * Returns minimal fields: nome, CNAE, expiresIn, cidade.
	 */
	async GetEmpresaOutrosVendedores ( ctx )
	{
		try
		{
			const uid = normalizeUserId( ctx.query.userId )
			if ( uid == null || uid === '' )
			{
				return ctx.badRequest( 'userId is required' )
			}

			const { page = 1, pageSize = 50 } = ctx.query
			const filtroTexto = ctx.query.filtroTexto || ''
			const filtroCNAE = ctx.query.filtroCNAE || ''
			const filtroCidade = ctx.query.filtroCidade || ''

			const filters = {
				$and: [
					{ user: { id: { $notNull: true } } },
					{ user: { id: { $ne: uid } } },
				],
			}
			if ( filtroTexto && String( filtroTexto ).trim() !== '' )
			{
				const isCNPJ = isNumericText( filtroTexto )
				if ( isCNPJ )
				{
					filters.CNPJ = { $containsi: String( filtroTexto ).trim() }
				} else
				{
					filters.$or = [
						{ nome: { $containsi: filtroTexto } },
						{ fantasia: { $containsi: filtroTexto } },
						{ CNPJ: { $containsi: filtroTexto } },
					]
				}
			}
			if ( filtroCNAE && String( filtroCNAE ).trim() !== '' )
			{
				filters.CNAE = { $containsi: filtroCNAE }
			}
			if ( filtroCidade && String( filtroCidade ).trim() !== '' )
			{
				filters.cidade = { $containsi: String( filtroCidade ).trim() }
			}

			const queryParams = {
				fields: [ 'nome', 'CNAE', 'expiresIn', 'cidade' ],
				populate: { user: { fields: [ 'username' ] } },
				filters,
				pagination: { page: parseInt( page, 10 ) || 1, pageSize: parseInt( pageSize, 10 ) || 50 },
			}

			const result = await strapi.entityService.findPage( 'api::empresa.empresa', queryParams )
			const rawData = result.data ?? result.results ?? []
			const items = rawData.map( ( emp ) => {
				const user = emp.user ?? emp.attributes?.user
				const vendedor = user?.username ?? user?.data?.username ?? ''
				return {
					id: emp.id,
					attributes: {
						nome: emp.nome ?? emp.attributes?.nome ?? '',
						CNAE: emp.CNAE ?? emp.attributes?.CNAE ?? '',
						expiresIn: emp.expiresIn ?? emp.attributes?.expiresIn ?? null,
						cidade: emp.cidade ?? emp.attributes?.cidade ?? '',
						vendedor,
					},
				}
			} )

			ctx.body = {
				data: items,
				meta: result.meta ?? { pagination: { page: parseInt( page, 10 ), pageSize: parseInt( pageSize, 10 ), pageCount: 1, total: items.length } },
			}
		} catch ( error )
		{
			ctx.throw( 400, error )
		}
	},

	async UpdateTableCalc ( ctx )
	{
		try
		{
			const { limit = 50, start = 0 } = ctx.query
			
			// Get total count once to help frontend manage progress
			const totalCount = await strapi.entityService.count( 'api::empresa.empresa' )

			const companies = await strapi.entityService.findMany( 'api::empresa.empresa', {
				fields: [ 'id', 'nome', 'tablecalc' ],
				populate: {
					businesses: {
						fields: [ 'etapa', 'andamento', 'date_conclucao', 'updatedAt' ],
						populate: {
							pedidos: {
								fields: [ 'itens' ],
							}
						}
					}
				},
				limit: parseInt( limit ),
				start: parseInt( start )
			} )

			const marginTableMap = [
				{ value: 0.35, name: 'Balcão' },
				{ value: 0.30, name: 'Vip' },
				{ value: 0.26, name: 'Bronze' },
				{ value: 0.22, name: 'Prata' },
				{ value: 0.18, name: 'Ouro' },
				{ value: 0.15, name: 'Platinum' },
				{ value: 0.12, name: 'Estratégico' }
			]

			const getTableName = ( val ) =>
			{
				const numericVal = parseFloat( val )
				if ( isNaN( numericVal ) ) return 'N/A'
				const exact = marginTableMap.find( m => Math.abs( m.value - numericVal ) < 0.001 )
				if ( exact ) return exact.name

				const sorted = [ ...marginTableMap ].sort( ( a, b ) => b.value - a.value )
				const lower = sorted.find( m => m.value < numericVal )
				return lower ? lower.name + '+' : 'Estratégico-'
			}

			const margins = marginTableMap.map( m => m.value )
			const results = []

			for ( const company of companies )
			{
				const businesses = company.businesses || []
				let selectedBusiness = null
				let statusType = 'Null'
				let businessDate = 'N/A'

				const wonBusinesses = businesses
					.filter( b => b.etapa === 6 && b.andamento === 5 )
					.sort( ( a, b ) =>
					{
						const da = a.date_conclucao ? new Date( a.date_conclucao ).getTime() : 0
						const db = b.date_conclucao ? new Date( b.date_conclucao ).getTime() : 0
						return db - da
					} )

				if ( wonBusinesses.length > 0 )
				{
					selectedBusiness = wonBusinesses[ 0 ]
					statusType = 'Ganho'
					businessDate = selectedBusiness.date_conclucao || selectedBusiness.updatedAt
				} else
				{
					const lostBusinesses = businesses
						.filter( b => b.andamento === 1 )
						.sort( ( a, b ) =>
						{
							const da = new Date( a.updatedAt ).getTime()
							const db = new Date( b.updatedAt ).getTime()
							return db - da
						} )
					if ( lostBusinesses.length > 0 )
					{
						selectedBusiness = lostBusinesses[ 0 ]
						statusType = 'Perdido'
						businessDate = selectedBusiness.updatedAt
					}
				}

				let newTableCalcValue = 0.30 // Default Vip
				let previousMarginFloat = parseFloat( company.tablecalc ) || 0.30

				if ( selectedBusiness )
				{
					const pedidos = selectedBusiness.pedidos || []
					const allItens = pedidos.flatMap( p => p.itens || [] ).filter( i => i && i.tabela != null )

					if ( allItens.length > 0 )
					{
						const tabelaValues = allItens.map( i => parseFloat( i.tabela ) ).filter( v => !isNaN( v ) )
						if ( tabelaValues.length > 0 )
						{
							const maxTabela = Math.max( ...tabelaValues )
							previousMarginFloat = maxTabela

							if ( statusType === 'Ganho' )
							{
								const possible = margins.filter( m => m >= maxTabela - 0.001 )
								newTableCalcValue = possible.length > 0 ? Math.min( ...possible ) : margins[ 0 ]
							} else
							{
								const sorted = [ ...margins ].sort( ( a, b ) => b - a )
								const exactIndex = sorted.findIndex( m => Math.abs( m - maxTabela ) < 0.001 )
								if ( exactIndex !== -1 )
								{
									newTableCalcValue = exactIndex + 1 < sorted.length ? sorted[ exactIndex + 1 ] : sorted[ exactIndex ]
								} else
								{
									const lower = sorted.find( m => m < maxTabela )
									newTableCalcValue = lower !== undefined ? lower : sorted[ sorted.length - 1 ]
								}
							}
						}
					}
				}

				const newTableCalc = newTableCalcValue.toFixed( 2 )

				if ( String( company.tablecalc ) !== newTableCalc )
				{
					await strapi.entityService.update( 'api::empresa.empresa', company.id, {
						data: { tablecalc: newTableCalc }
					} )
					results.push( {
						id: company.id,
						nome: company.nome,
						old: company.tablecalc,
						new: newTableCalc,
						status: statusType
					} )
				}
			}

			ctx.body = {
				success: true,
				total: companies.length,
				totalCount,
				updated: results.length,
				details: results
			}
		} catch ( error )
		{
			strapi.log.error( error )
			ctx.throw( 400, error )
		}
	},
} ) )
