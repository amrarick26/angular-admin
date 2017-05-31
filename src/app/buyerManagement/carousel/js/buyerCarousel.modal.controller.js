angular.module('orderCloud')
    .controller('BuyerCarouselCreateModalCtrl', BuyerCarouselCreateModalController)
;

function BuyerCarouselCreateModalController(OrderCloudSDK, $uibModalInstance, $state, $exceptionHandler, toastr, SelectedBuyer) {
    var vm = this;

    vm.buyer = SelectedBuyer;
    if (!vm.buyer.xp) vm.buyer.xp = {};
    if (!vm.buyer.xp.Slides) vm.buyer.xp.Slides = {
        AutoPlay: true,
        Interval: 8000,
        NoWrap: false,
        Items: []
    };
    vm.newImage = {};

    vm.addImage = addImage;
    vm.submit = submit;
    vm.cancel = cancel;

    vm.fileUploadOptions = {
        keyname: 'Slides',
        folder: null,
        extensions: 'jpg, png, gif, jpeg, tiff, svg',
        invalidExtensions: null,
        uploadText: 'Upload an image',
        onUpdate: addImage
    };

    function addImage(imageSource){
        vm.newImage.Src = imageSource;
    }

    function submit() {
        var duplicateID = _.pluck(vm.buyer.xp.Slides.Items, 'ID').indexOf(vm.newImage.ID) > -1;
        if(!duplicateID) {
            vm.buyer.xp.Slides.Items.push(vm.newImage);
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
        $uibModalInstance.close();
    }
}