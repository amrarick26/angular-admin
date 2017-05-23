angular.module('orderCloud')
    .controller('BuyerImagesCtrl', BuyerImagesController)
;

function BuyerImagesController($scope, OrderCloudSDK, SelectedBuyer, ocBuyerImages, toastr) {
    var vm = this;

    vm.buyer = SelectedBuyer;
    vm.index = 0;
    vm.settings = vm.buyer.xp.Images;
    vm.infiniteLoop = vm.settings.NoWrap ? vm.infiniteLoop = false : vm.infiniteLoop = true; //If NoWrap is set to true, it will not loop

    vm.updateSlide = updateSlide; //updates data on a specific image
    vm.deleteSlide = deleteSlide;
    vm.uploadImage = uploadImage;
    vm.updateSettings = updateSettings; //updates general carousel settings

    $scope.$watch(function() {
        return vm.buyer.slideData;
    }, function(newIndex, oldIndex) {
        console.log('index', newIndex);
        if (Number.isFinite(newIndex) && newIndex !== oldIndex) {
            vm.index = newIndex;
            vm.buyer.slideData = vm.buyer.xp.Images.Items[newIndex]; 
            return vm.buyer.slideData;
        }
    });

    function updateSlide() {
        vm.buyer.xp.Images.Items[vm.index] = vm.buyer.slideData;
        vm.searchLoading = OrderCloudSDK.Buyers.Patch(vm.buyer.ID, {
            xp: {
                Images: {
                    Items: vm.buyer.xp.Images.Items
                }
            }
        }).then(function(data) {
                toastr.success('Slide ' + vm.buyer.xp.Images.Items[vm.index].ID  + ' has been updated', 'Success');
            });
    }

    function deleteSlide() {
        vm.buyer.xp.Images.Items.splice(vm.index, 1);
        vm.searchLoading = OrderCloudSDK.Buyers.Patch(vm.buyer.ID, {
            xp: {
                Images: {
                    Items: vm.buyer.xp.Images.Items
                }
            }
        }).then(function(data) {
                toastr.success('Slide has been removed', 'Success');
            });
    }

    function uploadImage() {
        ocBuyerImages.Upload(vm.buyer);
    }

    function updateSettings() {
        if (!vm.settings.AutoPlay) vm.settings.Interval = null
        vm.searchLoading = OrderCloudSDK.Buyers.Patch(vm.buyer.ID, {
            xp: {
                Images: {
                    AutoPlay: vm.settings.AutoPlay,
                    NoWrap: vm.settings.NoWrap,
                    Interval: vm.settings.Interval
                }
            }
        })
    }
}