angular.module('orderCloud')
    .config(ProductCategoriesConfig)
;

function ProductCategoriesConfig($stateProvider) {
    $stateProvider 
        .state('productDetail.catalogs', {
            url: '/categories?search&page&pageSize&searchOn&sortBy&filters',
            templateUrl: 'productManagement/categories/templates/productCatalogs.html',
            controller: 'CatalogsCtrl',
            controllerAs: 'productCatalogs',
            data: {
                pageTitle: 'Product Categories'
            },
            resolve: {
                Parameters: function($stateParams, ocParameters) {
                    return ocParameters.Get($stateParams);
                },
                CatalogList: function(Parameters, sdkOrderCloud) {
                    return sdkOrderCloud.Catalogs.List(Parameters);
                }
            }
        })
        .state('productDetail.categories', {
            url: '/categories/:catalogid',
            templateUrl: 'productManagement/categories/templates/productCategories.html',
            controller: 'ProductCategoriesCtrl',
            controllerAs: 'productCategories',
            resolve: {
                SelectedCatalog: function($stateParams, sdkOrderCloud) {
                    return sdkOrderCloud.Catalogs.Get($stateParams.catalogid);
                },
                CategoryAssignments: function($stateParams, ocProductCategories) {
                    return ocProductCategories.Assignments.Get($stateParams.catalogid, $stateParams.productid);
                },
                CategoryList: function($stateParams, ocCatalogCategories) {
                    return ocCatalogCategories.GetAll($stateParams.catalogid);
                },
                Tree: function(CategoryList, ocCatalogTree, ocCatalogCategories, CategoryAssignments) {
                    return ocCatalogTree.Get(ocCatalogCategories.Assignments.Map(CategoryList, CategoryAssignments));
                }
            }
        })
}