angular.module('orderCloud')
    .controller('BuyerCarouselCtrl', BuyerCarouselController)
;

function BuyerCarouselController($scope, $state, OrderCloudSDK, SelectedBuyer, ocBuyerCarousel, toastr) {
    var vm = this;

    vm.buyer = SelectedBuyer;
    vm.settings = vm.buyer.xp && vm.buyer.xp.Slides ? vm.buyer.xp.Slides : null;
    vm.index = 0;
    vm.buyer.slideData = vm.buyer.xp && vm.buyer.xp.Slides ? vm.buyer.xp.Slides.Items[vm.index]: null;
    if (vm.settings) vm.infiniteLoop = vm.settings.NoWrap ? vm.infiniteLoop = false : vm.infiniteLoop = true; //If NoWrap is set to true, it will not loop

    vm.updateSlide = updateSlide; //updates data on a specific image
    vm.deleteSlide = deleteSlide;
    vm.uploadSlide = uploadSlide;
    vm.updateSettings = updateSettings; //updates general carousel settings

    $scope.$watch(function() {
        return vm.index;
    }, function(newIndex, oldIndex) {
        if (Number.isFinite(newIndex) && newIndex !== oldIndex) {
            vm.index = newIndex;
            vm.buyer.slideData = vm.buyer.xp.Slides.Items[vm.index];
        } else {
            angular.noop();
        }
    });

    function updateSlide() {
        vm.buyer.xp.Slides.Items[vm.index] = vm.buyer.slideData;
        vm.searchLoading = OrderCloudSDK.Buyers.Patch(vm.buyer.ID, {
            xp: {
                Slides: {
                    Items: vm.buyer.xp.Slides.Items
                }
            }
        }).then(function(data) {
                toastr.success('Slide ' + vm.buyer.xp.Slides.Items[vm.index].ID  + ' has been updated', 'Success');
            });
    }

    function deleteSlide() {
        vm.buyer.xp.Slides.Items.splice(vm.index, 1);
        vm.searchLoading = OrderCloudSDK.Buyers.Patch(vm.buyer.ID, {
            xp: {
                Slides: {
                    Items: vm.buyer.xp.Slides.Items
                }
            }
        }).then(function(data) {
                toastr.success('Slide has been removed', 'Success');
                $state.go('buyerCarousel', {buyerid: vm.buyer.ID}, {reload: true});
            });
    }

    function uploadSlide() {
        ocBuyerCarousel.Upload(vm.buyer);
    }

    function updateSettings() {
        if (!vm.settings.AutoPlay) vm.settings.Interval = null
        vm.infiniteLoop ? vm.settings.NoWrap = false : vm.settings.NoWrap = true;
        vm.searchLoading = OrderCloudSDK.Buyers.Patch(vm.buyer.ID, {
            xp: {
                Slides: {
                    AutoPlay: vm.settings.AutoPlay,
                    NoWrap: vm.settings.NoWrap,
                    Interval: vm.settings.Interval
                }
            }
        }).then(function() {
            toastr.success('Carousel settings updated', 'Success');
        })
    }
}