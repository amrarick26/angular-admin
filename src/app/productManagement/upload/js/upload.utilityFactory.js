angular.module('orderCloud')
    .factory('UploadUtility', UploadUtilityService);

function UploadUtilityService(OrderCloud, $q, toastr, $exceptionHandler) {
    var service = {
        rioPricing: _rioPricing,
        cleanCatalogAssignments: _cleanCatalogAssignments, // delete all party to category assigments
        rioPartyCategory: _rioPartyCategory, //creates party to category assignment
        rioProductCategory: _rioProductCategory, //creates product to category assignment
        rioProductPartyPS: _productPartyPS,
        deepCategoryAssignment: _deepCategoryAssignment
    };

    function _rioPricing(assignments) {
        createNewPS(assignments);

        function createNewPS(remainingAssignments) {
            var chunk = remainingAssignments.splice(0, 100);
            var assignmentQueue = [];
            var errors = [];

            _.each(chunk, function(csvData) {
                var ps = {
                    ID: 'caferio-' + csvData.product,
                    Name: 'caferio' + csvData.product + ' - ' + csvData.Price,
                    ApplyTax: false,
                    ApplyShipping: false,
                    RestrictedQuantity: false,
                    UseCumulativeQuantity: false,
                    PriceBreaks: [{
                        Quantity: 1,
                        Price: csvData.Price
                    }],
                    xp: {}
                };
                assignmentQueue.push((function() {
                    return OrderCloud.PriceSchedules.Update(ps.ID, ps)
                        .catch(function(ex) {
                            errors.push({
                                PriceSchedule: ps.ID,
                                Error: ex.data ? (ex.data.error || (ex.data.Errors ? ex.data.Errors[0].Message : ex.data)) : ex.message
                            });
                            $exceptionHandler(ex);
                        });
                })());
            });
            return $q.all(assignmentQueue)
                .then(function() {
                    if (remainingAssignments.length) {
                        return createNewPS(remainingAssignments);
                    } else {
                        console.log(errors);
                        return errors.length ? toastr.warning('Check console for errors') : toastr.success('Creation Complete');
                    }
                });
        }
    }

    function _rioPartyCategory(assignments) {
        /* upload full category - categries not found:
        beverageequipparts
        dispesers
        hoodaccessories
        mirrors
        mopsbuckets
        spraybottleshold
        */
        var queue = [];
        var errors = [];
        var errorCount = 0;
        _.each(assignments, function(csv){
            queue.push(function(){
                return OrderCloud.Categories.SaveAssignment({CategoryID: csv.categoryid, BuyerID: 'caferio'}, 'caferio')
                    .catch(function(){
                        errorCount++;
                        errors.push(csv.categoryid);
                    });
            }());
        });
        return $q.all(queue)
            .then(function(){
                console.log('error count: ' + errorCount);
                console.log(errors.join('\n'));
                errors.length ? toastr.warning('Check Console for category IDs with errors') : toastr.success('Complete', 'Success');
            });
    }

    function _rioProductCategory(assignments){
        //upload category hierarchy - this is the one misssing a couple:
        /*
            bowlslids	321284
            daylabels	DAY110036
            daylabels	DAY110035
            daylabels	DAY110034
            daylabels	DAY110037
            hardware	6402
            hardware	681231
            hardware	264091
            stepstools	86521
            tongs	82388
            wirewhips	KITSMC7QEW
        */
        var queue = [];
        var errors = [];
        var errorCount = 0;
        _.each(assignments, function(a){
            queue.push(function(){
                return OrderCloud.Categories.SaveProductAssignment({CategoryID: a.categoryid, ProductID: a.productid}, 'caferio')
                    .catch(function(){
                        errorCount++;
                        errors.push(a.categoryid + ' - ' + a.productid);
                    });
            }());
        });
        return $q.all(queue)
            .then(function(){
                console.log('error count: ' + errorCount);
                console.log(errors.join('\n'));
                errors.length ? toastr.warning('Check Console for category IDs with errors') : toastr.success('Complete', 'Success');
            });
    }

    function _productPartyPS(assignments){
        /*
            Product not found:
            264091
            321284
            681231
            86521
        */

        return makeAssignment(assignments);

        function makeAssignment(remainingAssignments) {
            var chunk = remainingAssignments.splice(0, 100);
            var assignmentQueue = [];
            var errors = [];

            _.each(chunk, function(csvData) {
                var assignmentObj = {
                    ProductID: csvData.product,
                    PriceScheduleID: 'caferio-' + csvData.product,
                    BuyerID: 'caferio'
                };
                assignmentQueue.push((function() {
                    return OrderCloud.Products.SaveAssignment(assignmentObj)
                        .catch(function(ex) {
                            errors.push({
                                Product: assignmentObj.ProductID,
                                PriceSchedule: assignmentObj.PriceScheduleID,
                                Error: ex.data ? (ex.data.error || (ex.data.Errors ? ex.data.Errors[0].Message : ex.data)) : ex.message
                            });
                            $exceptionHandler(ex);
                        });
                })());
            });
            return $q.all(assignmentQueue)
                .then(function() {
                    if (remainingAssignments.length) {
                        return makeAssignment(remainingAssignments);
                    } else {
                        console.log(errors);
                        return errors.length ? toastr.warning('Check console for errors') : toastr.success('Creation Complete');
                    }
                });
        }
    }

    function _cleanCatalogAssignments() {
        return deleteChunks();

        function deleteChunks() {
            var queue = [];
            var errors = [];
            return OrderCloud.Categories.ListAssignments(null, null, null, null, null, 100, null, 'caferio')
                .then(function(assignmentList) {
                    if (assignmentList.Items.length) {
                        _.each(assignmentList.Items, function(a) {
                            queue.push(function() {
                                return OrderCloud.Categories.DeleteAssignment(a.CategoryID, a.UserID, a.UserGroupID, a.BuyerID, 'caferio')
                                    .catch(function(ex) {
                                        errors.push({
                                            Category: a.ID,
                                            Error: ex.data ? (ex.data.error || (ex.data.Errors ? ex.data.Errors[0].Message : ex.data)) : ex.message
                                        });
                                        $exceptionHandler(ex);
                                    });
                            }());
                        });
                        return $q.all(queue)
                            .then(function(){
                                return deleteChunks();
                            });
                    } else {
                        console.log(errors);
                        return errors.length ? toastr.warning('Check console for errors') : toastr.success('Creation Complete');
                    }
                });
        }
    }


    return service;
}