function Route(obj){
	for(var key in obj){
		this[key] = obj[key];
	}
}