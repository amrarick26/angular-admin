angular.module('orderCloud')
    .factory('UploadUtility', UploadUtilityService);

function UploadUtilityService(OrderCloud, $q, toastr, $exceptionHandler) {
    var errors = [];
    var service = {
        rioPricing: _rioPricing,
        cleanCatalogAssignments: _cleanCatalogAssignments, // delete all party to category assigments
        rioPartyCategory: _rioPartyCategory, //creates party to category assignment
        rioProductCategory: _rioProductCategory, //creates product to category assignment
        rioProductPartyPS: _productPartyPS,
        uploadCategoryImages: _uploadCategoryImages,
        deleteSpecialChars: _deleteSpecialChars
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

    function _uploadCategoryImages(categories){
        var queue = [];
        var errors = [];
        _.each(categories, function(category){
            queue.push(function(){
                var partialCat = {xp:{image:{URL:category.url}}};
                return OrderCloud.Categories.Patch(category.categoryid, partialCat, 'caferio')
                    .catch(function(err){
                        errors.push(category.categoryid);
                    });
            }());
        });
        return $q.all(queue)
            .then(function(){
                console.log(errors.join('\n'));
            });
    }

    function _deleteSpecialChars(remainingProductIDs){
		var pageSize = 25; //keep this small so joining ids doesnt max char limit
        var chunk = _.pluck(remainingProductIDs.splice(0, pageSize), 'id');
		var placeholder = '&' //unique character that we can replace unknown character with
		console.log(chunk.join('|'));
        return OrderCloud.Products.List(null, null, pageSize, null, null, {ID: chunk.join('|')})
            .then(function(productList){
                var queue = [];
                _.each(productList.Items, function(p){
					var shouldUpdate = false;
					//API doesn't recognize the character on update/patch so need to first replace it with a
					//placeholder and then delete the placeholder
                    p.Name = p.Name.replace(/\uFFFD/g, placeholder);
                    if(p & p.Description) p.Description = p.Description.replace(/\uFFFD/g, placeholder);
					if(p && p.xp && p.xp["description_short"]) {
						p.xp["description_short"] = p.xp["description_short"].replace(/\uFFFD/g, placeholder);
						if(p.xp["description_short"].indexOf(placeholder) > -1) shouldUpdate = true;
					}
					if(p.Name.indexOf(placeholder) > -1 || (p.Description && p.Description.indexOf(placeholder) > -1)) shouldUpdate = true;

					if(shouldUpdate){
						queue.push(function(){
							console.log('pushing to queue', p);
							return OrderCloud.Products.Update(p.ID, p)
								.then(function(){
									console.log('success to placeholder: ' + p.ID)
									return p;
								})
								.catch(function(){
									console.log(p.ID);
									errors.push(p.ID);
								});
						}());
					}
                });
				console.log('queue', queue);
                return $q.all(queue)
                    .then(function(results){
						console.log('results', results);
						var updateQueue = [];
						results = _.compact(results); //if any products failed patch they'll show as undefined here
						_.each(results, function(p){
							console.log('p', p);
							p.Name = p.Name.replace(/&/g, '');
							if(p & p.Description) p.Description = p.Description.replace(/&/g, '');
							if(p && p.xp && p.xp["description_short"]) {
								p.xp["description_short"] = p.xp["description_short"].replace(/&/g, '');
							}
							updateQueue.push(function(){
								return OrderCloud.Products.Update(p.ID, p)
									.then(function(){
										console.log('success: ' + p.ID)
									})
									.catch(function(){
										errors.push(p.ID);
									});
								}());
						});
						return $q.all(updateQueue)
							.then(function(moarResults){
								if(remainingProductIDs.length) {
									return _deleteSpecialChars(remainingProductIDs);
								} else {
									var myErrors = errors.join('\n');
									console.log(myErrors);
									return 'yay';
								}
							})
							.catch(function(err){
								console.log(err);
							})
                    })
					.catch(function(err){
						console.log(err);
					})
            });
    }


    return service;
}