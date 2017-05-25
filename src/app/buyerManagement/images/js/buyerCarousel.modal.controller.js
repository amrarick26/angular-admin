angular.module('orderCloud')
    .controller('BuyerCarouselCreateModalCtrl', BuyerCarouselCreateModalController)
;

function BuyerCarouselCreateModalController(OrderCloudSDK, $uibModalInstance, $state, toastr, SelectedBuyer) {
    var vm = this;

    vm.buyer = SelectedBuyer;
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
        vm.buyer.xp.Slides.Items.push(vm.newImage);
        return OrderCloudSDK.Buyers.Patch(vm.buyer.ID, {xp: {Slides: {Items: vm.buyer.xp.Slides.Items}}})
            .then(function() {
                toastr.success('Image has been added to ' + vm.buyer.Name + '\'s carousel', 'Success');
                $uibModalInstance.dismiss();
                $state.go('buyerCarousel', {buyerid: vm.buyer.ID}, {reload: true});
            })
    }

    function cancel() {
        $uibModalInstance.close();
    }
}