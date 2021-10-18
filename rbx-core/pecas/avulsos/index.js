const calcAvulso = arrAvulso => {
	const calcMp = item => {
		const mp = item.materia_prima;

		const unidades = {
			unidade: item => item.materia_prima.precoVenda * item.qtde,
			metroQuadrado: item =>
				((((item.materia_prima.precoVenda * item.comp) / 100) * item.larg) /
					100) *
				item.qtde,
			metroLinear: item =>
				((item.materia_prima.precoVenda * item.comp) / 100) * item.qtde,
		};
		return unidades[mp.unVenda](item);
	};

	const objAvulso = {};
	let custoParte = 0;
	arrAvulso.map(avulso => {
		avulso.custoMP = calcMp(avulso);
		custoParte += avulso.custoMP;
		objAvulso[avulso.nome] = avulso;
	});
	objAvulso.custoParte = custoParte;

	return objAvulso;
};
module.exports = calcAvulso;
