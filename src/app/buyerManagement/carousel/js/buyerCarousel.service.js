angular.module('orderCloud')
    .factory('ocBuyerCarousel', ocBuyerCarouselService)
;

function ocBuyerCarouselService($uibModal) {
    var service = {
        Upload : _upload
    }

    function _upload(buyer) {
        return $uibModal.open({
            templateUrl: 'buyerManagement/carousel/templates/buyerCarouselCreate.modal.html',
            controller: 'BuyerCarouselCreateModalCtrl',
            controllerAs: 'buyerCarouselCreate',
            resolve: {
                SelectedBuyer: function() {
                    return buyer;
                }
            }
        })
    }

    return service;
}