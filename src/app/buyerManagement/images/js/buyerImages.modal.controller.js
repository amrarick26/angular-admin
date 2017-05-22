angular.module('orderCloud')
    .controller('BuyerImagesCreateModalCtrl', BuyerImagesCreateModalController)
;

function BuyerImagesCreateModalController(OrderCloudSDK, $uibModalInstance, $state, toastr, SelectedBuyer) {
    var vm = this;

    vm.buyer = SelectedBuyer;
    vm.newImage = {};

    vm.submit = submit;
    vm.cancel = cancel;

    function submit() {
        vm.buyer.xp.Images.Items.push(vm.newImage);
        return OrderCloudSDK.Buyers.Patch(vm.buyer.ID, {xp: {Images: {Items: vm.buyer.xp.Images.Items}}})
            .then(function() {
                toastr.success('Image has been added to ' + vm.buyer.Name + '\'s carousel', 'Success');
                $uibModalInstance.dismiss();
                // $state.go('buyerImages', {buyerid: vm.buyer.ID}, {reload: true});
            })
    }

    function cancel() {
        $uibModalInstance.close();
    }
}