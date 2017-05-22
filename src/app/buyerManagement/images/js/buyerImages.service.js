angular.module('orderCloud')
    .factory('ocBuyerImages', ocBuyerImagesService)
;

function ocBuyerImagesService($uibModal) {
    var service = {
        Upload : _upload
    }

    function _upload(buyer) {
        return $uibModal.open({
            templateUrl: 'buyerManagement/images/templates/buyerImagesCreate.modal.html',
            controller: 'BuyerImagesCreateModalCtrl',
            controllerAs: 'buyerImagesCreate',
            resolve: {
                SelectedBuyer: function() {
                    return buyer;
                }
            }
        })
    }

    return service;
}