angular.module('orderCloud')
    .factory('ocOrdersService', OrderCloudOrdersService)
;

function OrderCloudOrdersService($q, $filter, OrderCloudSDK) {
    var service = {
        List: _list
    };
    
    function _list(parameters) {

        function convertToDate(toDate) {
            var result = new Date(toDate);
            result = result.setDate(result.getDate() + 1);
            return $filter('date')(result, 'MM-dd-yyyy');
        }

        if (parameters.fromDate && parameters.toDate) {
            parameters.filters.DateSubmitted = [('>' + parameters.fromDate), ('<' + convertToDate(parameters.toDate))];
        } else if(parameters.fromDate && !parameters.toDate) {
            parameters.filters.DateSubmitted = [('>' + parameters.fromDate)];
        } else if (!parameters.fromDate && parameters.toDate) {
            parameters.filters.DateSubmitted = [('<' + convertToDate(parameters.toDate))];
        }

        if (parameters.filters && parameters.FromUserGroupID) {
            parameters.filters['xp.CustomerNumber'] = parameters.FromUserGroupID;
        }

        if (parameters.filters && parameters.FromCompanyID) {
            parameters.filters.FromCompanyID = parameters.FromCompanyID;
        }

        if (parameters.filters && parameters.status) {
            parameters.filters.status = parameters.status;
        }

        //var filters = angular.extend({status: '!Unsubmitted'}, parameters.filters);

        //TODO: uncomment when ! operator is fixed in API EX-1166
        //angular.extend(parameters.filters, {status: '!Unsubmitted'});

        return OrderCloudSDK.Orders.List('Incoming', parameters)
            .then(function(orders) {
                return gatherBuyerCompanies(orders);
            });

        function gatherBuyerCompanies(orders) {
            var buyerIDs = _.uniq(_.pluck(orders.Items, 'FromCompanyID'));
            var options = {
                page: 1,
                pageSize: 100,
                filters: {ID: buyerIDs.join('|')}
            };
            return OrderCloudSDK.Buyers.List(options)
                .then(function(buyerData) {
                    var queue = [];
                    _.each(orders.Items, function(order) {
                        order.FromCompany = _.findWhere(buyerData.Items, {ID: order.FromCompanyID});
                        queue.push(getUserGroups(order))
                    });
                    return $q.all(queue)
                        .then(function(results){
                            orders.Items = [].concat.apply([], results);
                            return orders;
                        })
                });

            function getUserGroups(order) {
                if (order.xp && order.xp.CustomerNumber) {
                    return OrderCloudSDK.UserGroups.Get(order.FromCompanyID, order.xp.CustomerNumber)
                        .then(function(userGroup) {
                            if (userGroup) {
                                order.FromUserGroup = userGroup;
                                order.FromUserGroupID = userGroup.ID;
                                return order;
                            } else {
                                return order;
                            }
                        });
                } else {
                    return order;
                }
            }
        }
    }
    return service;
}