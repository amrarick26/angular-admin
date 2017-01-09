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

function ocRelatedProductsCttrl(){
    var vm = this;
}