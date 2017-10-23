angular.module('orderCloud')
	.controller('HomeCtrl', HomeController)
;

function HomeController(OrderCloudSDK, $q, catalogid) {
	var vm = this;

	vm.createSpecs = function() {
		//just for testing purposes, list item in this category because they have products with known fees
		return OrderCloudSDK.Products.List({catalogID: catalogid, categoryID: 'OutdoorLivingDecor_Grilling_Grills', pageSize: 100})
			.then(function(products) {
				var assemblyQ = [],
					placementQ = [];
				_.each(products.Items, function(prod) {
					if (prod.xp && (prod.xp.AssemblyProduct || prod.xp.PlacementProduct)) {
						if (prod.xp.AssemblyProduct) assemblyQ.push(OrderCloudSDK.Specs.SaveProductAssignment({
							SpecID: prod.xp.AssemblyProduct,
							ProductID: prod.ID,
							DefaultOptionID: 'NoAssembly'
						}));
						if (prod.xp.PlacementProduct) placementQ.push(OrderCloudSDK.Specs.SaveProductAssignment({
							SpecID: prod.xp.PlacementProduct,
							ProductID: prod.ID,
							DefaultOptionID: 'NoPlacement'
						}));
					}
				});
				$q.all(assemblyQ)
					.then(function() {
						$q.all(placementQ);
					})
			})
	}
}
