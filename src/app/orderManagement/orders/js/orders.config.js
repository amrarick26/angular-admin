angular.module('orderCloud')
    .config(OrdersConfig)
;

function OrdersConfig($stateProvider) {
    $stateProvider
        .state('orders', {
            parent: 'base',
            url: '/orders?FromUserGroupID&FromCompanyID&status&fromDate&toDate&search&page&pageSize&searchOn&sortBy',
            templateUrl: 'orderManagement/orders/templates/orders.html',
            controller: 'OrdersCtrl',
            controllerAs: 'orders',
            data: {
                pageTitle: 'Orders'
            },
            resolve: {
                Parameters: function($stateParams, ocParameters) {
                    return ocParameters.Get($stateParams);
                },
                OrderList: function(ocOrdersService, OrderCloud, Parameters) {
                    return ocOrdersService.List(Parameters);
                },
                BuyerCompanies: function(OrderCloud) {
                    return OrderCloud.Buyers.List(null, 1, 100);
                },
                UserGroupsList: function($q, OrderCloud, Parameters, BuyerCompanies, ocUtility) {
                    var queue = [];
                    _.each(BuyerCompanies.Items, function(buyer) {
                        queue.push(function(){
                            return ocUtility.ListAll(OrderCloud.Addresses.List, null, 'page', 100, null, null, null, buyer.ID)
                                .then(function(addresses) {
                                    return ocUtility.ListAll(OrderCloud.UserGroups.List, null, 'page', 100, null, null, null, buyer.ID)
                                        .then(function(userGroups) {
                                            var userGroupsArr = [];
                                            _.each(addresses.Items, function(address) {
                                                userGroupsArr.push(_.findWhere(userGroups.Items, {ID: address.CompanyName}));
                                            });
                                            return _.compact(userGroupsArr);
                                        })
                                });
                        }());
                    });
                    return $q.all(queue)
                        .then(function(results) {
                            return [].concat.apply([], results);
                        })
                }
            }
        })
    ;
}