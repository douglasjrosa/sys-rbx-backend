// Closure
(function(){

	/**
	 * Ajuste decimal de um número.
	 *
	 * @param	{String}	type	O tipo de arredondamento.
	 * @param	{Number}	value	O número a arredondar.
	 * @param	{Integer}	exp		O expoente (o logaritmo decimal da base pretendida).
	 * @returns	{Number}			O valor depois de ajustado.
	 */
	function decimalAdjust(type, value, exp) {
		// Se exp é indefinido ou zero...
		if (typeof exp === 'undefined' || +exp === 0) {
			return Math[type](value);
		}
		value = +value;
		exp = +exp;
		// Se o valor não é um número ou o exp não é inteiro...
		if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
			return NaN;
		}
		// Transformando para string
		value = value.toString().split('e');
		value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
		// Transformando de volta
		value = value.toString().split('e');
		return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
	}

	// Arredondamento decimal
	if (!Math.round10) {
		Math.round10 = function(value, exp) {
			return decimalAdjust('round', value, exp);
		};
	}
	// Decimal arredondado para baixo
	if (!Math.floor10) {
		Math.floor10 = function(value, exp) {
			return decimalAdjust('floor', value, exp);
		};
	}
	// Decimal arredondado para cima
	if (!Math.ceil10) {
		Math.ceil10 = function(value, exp) {
			return decimalAdjust('ceil', value, exp);
		};
	}
	// Arredondamento decimal de todos os valores de um objeto
	if (!Math.roundAll10) {
		Math.roundAll10 = function(obj, exp) {
			for(const index in obj){
				if(typeof obj[index] === "number" ){
					obj[index] = decimalAdjust('round', obj[index], exp);
				}
				else if( typeof obj[index] === "object" ){
					if( obj[index] instanceof Array ){
						obj[index].map( item => Math.roundAll10(item, exp) );
					}
					else Math.roundAll10(obj[index], exp);
				}
				else if( typeof obj[index] === "object" && !(obj[index] instanceof Array) ){
					Math.roundAll10(obj[index], exp);
				}
			}
			return obj;
		};
	}
})();