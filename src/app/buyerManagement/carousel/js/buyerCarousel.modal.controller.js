angular.module('orderCloud')
    .controller('BuyerCarouselCreateModalCtrl', BuyerCarouselCreateModalController)
;

function BuyerCarouselCreateModalController(OrderCloudSDK, $uibModalInstance, $state, $exceptionHandler, toastr, SelectedBuyer) {
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

    vm.index = vm.buyer.xp.Slides.Items.length || 0;

    vm.submit = submit;
    vm.cancel = cancel;

    vm.fileUploadOptions = {
        keyname: 'Slides',
        srcKeyname: 'Src',
        index: vm.index,
        folder: null,
        extensions: 'jpg, png, gif, jpeg, tiff, svg',
        invalidExtensions: null,
        uploadText: 'Upload an image',
        onUpdate: vm.submit,
        multiple: false,
        modal: true
    };

    function submit() {
        var duplicateID = _.pluck(vm.buyer.xp.Slides.Items, 'ID').indexOf(vm.buyerCopy.xp.Slides.Items[vm.index].ID) > -1;
        if(!duplicateID) {
            return OrderCloudSDK.Buyers.Patch(vm.buyer.ID, {xp: {Slides: {Items: vm.buyer.xp.Slides.Items}}})
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
        delete vm.buyer.xp.Slides.Items[vm.index];
        $uibModalInstance.close();
    }
}