angular.module('orderCloud')
    .factory('ocBuyerCarousel', ocBuyerCarouselService)
;

function ocBuyerCarouselService($uibModal) {
    var service = {
        Upload : _upload
    }

    function _upload(buyer) {
        return $uibModal.open({
            templateUrl: 'buyerManagement/images/templates/buyerCarouselCreate.modal.html',
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