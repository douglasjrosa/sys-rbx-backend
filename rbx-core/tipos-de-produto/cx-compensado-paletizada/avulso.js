const getAvulsos = async produto => {
	const avulsos = [];
	const { custom, modelo } = produto;

	modelo.partes.map((parte, index) => {
		if (parte.nome === "avulso") {
			avulsos.push(parte);
			modelo.partes.splice(index);
		}
	});

	if (custom && custom.partes) {
		custom.partes.map(parte => {
			if (parte.nome === "avulso") avulsos.push(parte);
		});
	}

	if (avulsos.length) {
		promises = avulsos.map(async avulso => {
			const avulsoPronto = async avulso => {
				const _id = avulso.materia_prima;
				const materiasPrimas = await strapi.services["materia-prima"].findOne({
					_id,
				});
				avulso.materia_prima = materiasPrimas;
				avulso.custoMP = (avulso.comp / 100) * materiasPrimas.precoVenda;
				avulso.custoParte = avulso.qtde * avulso.custoMP;

				console.log("cx-compensado/avulso");
				return avulso;
			};
			return await avulsoPronto(avulso);
		});
		return await Promise.all(promises);
	} else return [];
};

const calcAvulsos = async produto => {
	const avulsos = await getAvulsos(produto);	
	produto.modelo.partes.push(...avulsos);
};
module.exports = calcAvulsos;
