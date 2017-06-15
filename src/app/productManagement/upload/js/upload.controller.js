angular.module('orderCloud')
    .controller('UploadCtrl', UploadController)
;

function UploadController($scope, UploadService, ProductUploadService, UploadUtility) {
    var vm = this;
    vm.productFileData = {};
    vm.attributeFileData = {};
    vm.categoryFileData = {};
    vm.parsedCatData = null;
    vm.parsedProdData = null;
    vm.results = null;
    vm.uploadProgress = [];
    vm.deleteAllCategories = function(){
        return UploadUtility.rioPartyCategory();
    };

    vm.selectProductFile = function() {
        //Upload for product information
        $('#productCSV').bind('change', productFileSelected);

        $('#productCSV').click();
    };

    vm.clearProductFile = function() {
        vm.productFileData = {};
        vm.parsedProdData = null;
        vm.results = null;
        vm.started = false;
        vm.uploadProgress = [];
        $('#productCSV').val('');
    };

    vm.clearCategoryFile = function() {
        vm.categoryFileData = {};
        vm.parsedCatData = null;
        vm.results = null;
        vm.started = false;
        vm.uploadProgress = [];
        $('#categoryCSV').val('');
    };

    vm.clearAttributeFile = function() {
        vm.attributeFileData = {};
        vm.results = null;
        vm.started = false;
        vm.uploadProgress = [];
        $('#attributeCSV').val('');
    };

    // /==============/==============/==============/==============/==============/==============/==============

    function productFileSelected(event) {
        // JUST UPLOAD TO PRODUCT FILE SLOT TO DO CUSTOM CSV 
        $scope.$apply(function() {
            vm.productFileData.Name = event.target.files[0].name;
            vm.productFileData.Event = event;
            vm.parsedData = null;
            parsedData();
        });
    }

    function parsedData() {
        return UploadService.Parse([{File: vm.productFileData.Event}])
            .then(function(parsed) {
                //FIXME: replace function here >
                return UploadUtility.rioProductPartyPS(parsed.File);
            });
    }


    vm.uploadProducts = function() {
        vm.results = null;
        vm.uploadProgress = [];
        var products = angular.copy(vm.parsedProdData.Products);
        vm.parsedData = null;
        vm.started = true;
        ProductUploadService.UploadProducts(products)
            .then(
                function(data) {
                    vm.results = data;
                },
                function(ex) {
                    console.log(ex);
                },
                function(progress) {
                    vm.uploadProgress = progress;
                }
            );
    };

    vm.uploadCategories = function(){
        vm.results = null;
        vm.uploadProgress = [];
        var products = angular.copy(vm.parsedProdData.Products);
        var categories = angular.copy(vm.parsedCatData.Categories);
        vm.parsedData = null;
        vm.started = true;

        ProductUploadService.UploadCategories(products, categories)
            .then(function(data) {
                    vm.results = data;
                },
                function(ex) {
                    console.log(ex);
                },
                function(progress) {
                    vm.uploadProgress = progress;
                }
            );
    };
}