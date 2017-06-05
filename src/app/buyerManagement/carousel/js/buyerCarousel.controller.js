angular.module('orderCloud')
    .controller('BuyerCarouselCtrl', BuyerCarouselController)
;

function BuyerCarouselController($state, $scope, OrderCloudSDK, SelectedBuyer, ocBuyerCarousel, toastr) {
    var vm = this;

    vm.buyer = SelectedBuyer;
    vm.buyerCopy = angular.copy(SelectedBuyer);
    if (!vm.buyer.xp) vm.buyer.xp = {};
    if (!vm.buyer.xp.Slides) vm.buyer.xp.Slides = {
        AutoPlay: true,
        Interval: 8000,
        NoWrap: false,
        Items: []
    };
    vm.index = 0;
    vm.slideData = vm.buyer.xp.Slides.Items.length ? vm.buyer.xp.Slides.Items[vm.index]: null;

    vm.disabled = true;
    vm.settings = vm.buyer.xp.Slides;
    if (vm.settings) vm.infiniteLoop = vm.settings.NoWrap ? vm.infiniteLoop = false : vm.infiniteLoop = true; //If NoWrap is set to true, it will not loop

    vm.updateSlide = updateSlide; //updates data on a specific image
    vm.saveImage = saveImage;
    vm.deleteSlide = deleteSlide;
    vm.uploadSlide = uploadSlide;
    vm.updateSettings = updateSettings; //updates general carousel settings

    vm.fileUploadOptions = {
        keyname: 'Slides',
        srcKeyname: 'Src',
        index: vm.index,
        folder: null,
        extensions: 'jpg, png, gif, jpeg, tiff, svg',
        invalidExtensions: null,
        uploadText: 'Upload an image',
        onUpdate: vm.saveImage,
        multiple: false,
        modal: true
    };

    $scope.$on('OC:CarouselIndexChange', function(event, index) {
        vm.index = index;
        vm.fileUploadOptions.index = index;
        vm.slideData = vm.buyer.xp.Slides.Items[vm.index];
    });

    function saveImage(model) {
        vm.buyer.xp.Slides.Items[vm.index].Src = model.Slides.Items[vm.index].Src
    }

    function updateSlide() {
        if (vm.buyerCopy.xp.Slides.Items[vm.index].ID !== vm.buyer.xp.Slides.Items[vm.index].ID) var duplicateID = _.pluck(vm.buyerCopy.xp.Slides.Items, 'ID').indexOf(vm.buyer.xp.Slides.Items[vm.index].ID) > -1;
        if (!duplicateID) {
            vm.buyer.xp.Slides.Items[vm.index] = vm.slideData;
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