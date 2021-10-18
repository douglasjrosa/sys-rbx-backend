(function () {
	objClean = function (obj, arrTrash = []) {
		const trash = [
			"__component",
			"id",
			"_id",
			"__v",
			"createdAt",
			"updatedAt",
			"created_by",
			"updated_by",
			"caption",
			"formats",
			"thumbnail",
			"path",
			"hash",
			"ext",
			"mime",
			"size",
			"provider",
			"related",
			"_bsontype",
			"id",
			"toHexString",
			"get_inc",
			"getInc",
			"generate",
			"toString",
			"toJSON",
			"equals",
			"getTimestamp",
			"generationTime",
			...arrTrash,
		];

		for (const index in obj) {
			if (trash.includes(index)) delete obj[index];
			else if (typeof obj[index] === "object") {
				if (obj[index] instanceof Array) {
					obj[index].map(item => objClean(item, arrTrash));
				} else objClean(obj[index], arrTrash);
			}
		}
		return obj;
	};

	
	objMerge = function (objOriginal, objNovo) {
		for (const index in objNovo) {
			if (typeof objNovo[index] === "object") {
				if (objNovo[index] instanceof Array){
					objNovo[index].map(item => objMerge(objOriginal[index], item));
				}
				else objMerge(objOriginal[index], objNovo[index])
			}
			else{
				objOriginal[index] = objNovo[index];
			}
		}
		return objOriginal;
	};
})();
