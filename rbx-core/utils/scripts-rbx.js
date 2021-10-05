(function(){
    objClean = function( obj, arrTrash = [] ){
        const trash = [
            "__component",
            "id",
            "_id",
            "__v",
            "createdAt",
            "updatedAt",
            "created_by",
            "updated_by",
            ...arrTrash
        ];
        for( const index in obj ){
            if( trash.includes( index ) ) delete obj[index];
            else if( typeof obj[index] === "object" ) objClean( obj[index], arrTrash );
        }
        return obj;
    };
})();