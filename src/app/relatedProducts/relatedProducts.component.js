angular.module('orderCloud')
    .component('ocRelatedProducts', {
        bindings: {
            productid : '<'
        },
        templateUrl: 'relatedProducts/templates/relateProducts.html',
        controller: ocRelatedProductsCtrl,
        controllerAs: 'relatedProducts'
    })
;

function ocRelatedProductsCtrl(OrderCloud){
    var vm = this;

    vm.listRelatedProducts = ListRelatedProducts;
    vm.assignRelatedProducts = AssignRelatedProducts;
    vm.removeRelatedProducts = RemoveRelatedProducts;

}
