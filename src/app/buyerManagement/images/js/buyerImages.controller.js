angular.module('orderCloud')
    .controller('BuyerImagesCtrl', BuyerImagesController)
;

function BuyerImagesController($scope, OrderCloudSDK, SelectedBuyer, ocBuyerImages) {
    var vm = this;

    vm.buyer = SelectedBuyer;
    console.log('ctrl: ', vm.buyer);
    vm.imageData = vm.buyer.xp.Images;
    vm.infiniteLoop = vm.imageData.NoWrap ? vm.infiniteLoop = false : vm.infiniteLoop = true; //If NoWrap is set to true, it will not loop

    vm.updateImage = updateImage; //updates data on a specific image
    vm.uploadImage = uploadImage;
    vm.updateSettings = updateSettings; //updates general carousel settings

    function updateImage() {
        vm.searchLoading = OrderCloudSDK.Buyers.Patch(vm.buyer.ID, {});
    }

    function uploadImage() {
        ocBuyerImages.Upload(vm.buyer);
    }

    function updateSettings() {
        if (!vm.imageData.AutoPlay) vm.imageData.Interval = null
        vm.searchLoading = OrderCloudSDK.Buyers.Patch(vm.buyer.ID, {
            xp: {
                Images: {
                    AutoPlay: vm.imageData.AutoPlay,
                    NoWrap: vm.imageData.NoWrap,
                    Interval: vm.imageData.Interval
                }
            }
        })
    }
}