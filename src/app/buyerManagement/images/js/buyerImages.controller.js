angular.module('orderCloud')
    .controller('BuyerImagesCtrl', BuyerImagesController)
;

function BuyerImagesController(SelectedBuyer, ocBuyerImages) {
    var vm = this;

    vm.buyer = SelectedBuyer;
    vm.images = vm.buyer.xp.Images;

    vm.updateImage = updateImage;
    vm.uploadImage = uploadImage;

    function updateImage() {
        vm.searchLoading = OrderCloudSDK.Buyers.Patch(SelectedBuyer.ID, {});
    }

    function uploadImage() {
        ocBuyerImages.Upload(vm.buyer);
    }
}