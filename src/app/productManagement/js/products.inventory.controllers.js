angular.module('orderCloud')
    .controller('ProductInventoryCtrl', ProductInventoryController)
;

function ProductInventoryController(toastr, ocProductsService, ProductInventory) {
    var vm = this;
    vm.inventory = angular.copy(ProductInventory);
    vm.inventoryAvailable = angular.copy(ProductInventory.Available);
    vm.updateProductInventory = updateProductInventory;

    function updateProductInventory(product) {
        vm.productUpdateLoading = ocProductsService.UpdateInventory(product, vm.inventory)
            .then(function(inventory) {
                vm.inventory = angular.copy(inventory);
                vm.inventoryAvailable = angular.copy(inventory.Available);
                vm.ProductInventoryForm.$setPristine();
                toastr.success(product.Name + ' inventory was updated', 'Success!');
            });
    }
}