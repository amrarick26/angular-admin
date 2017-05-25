angular.module('orderCloud')
    .controller('BuyerCarouselCtrl', BuyerCarouselController)
;

function BuyerCarouselController($state, $rootScope, OrderCloudSDK, SelectedBuyer, ocBuyerCarousel, toastr) {
    var vm = this;

    vm.buyer = SelectedBuyer;
    vm.buyerCopy = angular.copy(SelectedBuyer);
    vm.disabled = true;
    vm.settings = vm.buyer.xp && vm.buyer.xp.Slides ? vm.buyer.xp.Slides : null;
    vm.index;
    vm.buyer.slideData = vm.buyer.xp && vm.buyer.xp.Slides ? vm.buyer.xp.Slides.Items[vm.index]: null;
    if (vm.settings) vm.infiniteLoop = vm.settings.NoWrap ? vm.infiniteLoop = false : vm.infiniteLoop = true; //If NoWrap is set to true, it will not loop

    vm.fileUploadOptions = {
        keyname: 'Slides',
        folder: null,
        extensions: 'jpg, png, gif, jpeg, tiff, svg',
        invalidExtensions: null,
        uploadText: 'Upload an image',
        onUpdate: vm.updateSlide
    };

    vm.updateSlide = updateSlide; //updates data on a specific image
    vm.deleteSlide = deleteSlide;
    vm.uploadSlide = uploadSlide;
    vm.updateSettings = updateSettings; //updates general carousel settings

    $rootScope.$on('OC:CarouselIndexChange', function(event, index) {
        vm.index = index;
        vm.buyer.slideData = vm.buyer.xp.Slides.Items[vm.index];
    });

    function updateSlide(imageSource) {
        var duplicateID = _.pluck(vm.buyerCopy.xp.Slides.Items, 'ID').indexOf(vm.buyer.xp.Slides.Items[vm.index].ID) > -1;
        if (!duplicateID) {
            if (imageSource) vm.buyer.xp.Slides.Items[vm.index].Src = imageSource;
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
        } else {
            toastr.error('Slide ID already exists, please enter a unique ID', 'Error');
        }
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