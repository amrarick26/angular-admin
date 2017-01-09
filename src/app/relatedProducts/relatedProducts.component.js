angular.module('orderCloud')
    .config(RelatedProductsConfig)
    .controller('RelatedProductsCtrl', RelatedProductsController)
;

function RelatedProductsConfig($stateProvider) {
    $stateProvider
        .state('relatedProducts', {
            parent: 'productManagement',
            templateUrl: 'relatedProducts/templates/relatedProducts.html',
            url: '/relatedproducts',
            controller: 'RelatedProductsCtrl',
            controllerAs: 'relatedProducts',
            resolve: {
                Parameters: function ($stateParams, ocParameters) {
                    return ocParameters.Get($stateParams);
                },
                RelatedProducts: function (OrderCloud, Parameters, ProductList) {
                    console.log('productList', ProductList);
                }
            }
        })
}

function RelatedProductsController() {

}

function ocRelatedProductsCttrl(OrderCloud){
    var vm = this;

    vm.listRelatedProducts = ListRelatedProducts;
    vm.assignRelatedProducts = AssignRelatedProducts;
    vm.removeRelatedProducts = RemoveRelatedProducts;

    function ListRelatedProducts() {

    }
}