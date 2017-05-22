angular.module('orderCloud')
    .config(BuyerImagesConfig)
;

function BuyerImagesConfig($stateProvider) {
    $stateProvider
        .state('buyerImages', {
            parent: 'buyer',
            templateUrl: 'buyerManagement/images/templates/buyerImages.html',
            controller: 'BuyerImagesCtrl',
            controllerAs: 'buyerImages',
            url: '/images/',
            data: {
                pageTitle: 'Buyer Images'
            }
        });
}