angular.module('orderCloud')
	.controller('HomeCtrl', HomeController)
;

function HomeController(UploadUtility) {
	var vm = this;

	vm.cleancategoryassignments = function(){
		return UploadUtility.cleanCatalogAssignments();
	};

	vm.cleanproductsandps = function(){
		return UploadUtility.cleanProductsAndPS();
	};
}
