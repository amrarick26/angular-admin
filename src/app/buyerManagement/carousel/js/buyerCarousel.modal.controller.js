angular.module('orderCloud')
    .controller('BuyerCarouselCreateModalCtrl', BuyerCarouselCreateModalController)
;

function BuyerCarouselCreateModalController(OrderCloudSDK, $uibModalInstance, $state, $exceptionHandler, toastr, SelectedBuyer) {
    var vm = this;

    vm.buyer = angular.copy(SelectedBuyer);
    vm.buyerCopy = angular.copy(SelectedBuyer);

    vm.index = vm.buyer.xp.Slides.Items.length || 0;

    vm.saveImage = saveImage;
    vm.submit = submit;
    vm.cancel = cancel;

    vm.fileUploadOptions = {
        keyname: 'Slides',
        srcKeyname: 'Src',
        index: vm.buyer.xp.Slides.Items.length || 0,
        folder: null,
        extensions: 'jpg, png, gif, jpeg, tiff, svg',
        invalidExtensions: null,
        uploadText: 'Upload an image',
        onUpdate: vm.saveImage,
        multiple: false,
        modal: true
    };

    function saveImage(model) {
        vm.buyer.xp.Slides.Items[vm.index].Src = model.Slides.Items[vm.index].Src;
    }

    function submit() {
        var duplicateID = _.pluck(vm.buyerCopy.xp.Slides.Items, 'ID').indexOf(vm.buyer.xp.Slides.Items[vm.index].ID) > -1;
        if(!duplicateID) {
            return OrderCloudSDK.Buyers.Patch(vm.buyer.ID, {xp: {Slides: vm.buyer.xp.Slides}})
                .then(function() {
                    toastr.success('Image has been added to ' + vm.buyer.Name + '\'s carousel', 'Success');
                    $uibModalInstance.dismiss();
                    $state.go('buyerCarousel', {buyerid: vm.buyer.ID}, {reload: true});
                })
                .catch(function(ex) {
                    $exceptionHandler(ex);
                })
        } else {
            toastr.error('Slide ID already exists, please enter a unique ID', 'Error');
        }
    }

    function cancel() {
        $uibModalInstance.close();
    }
}