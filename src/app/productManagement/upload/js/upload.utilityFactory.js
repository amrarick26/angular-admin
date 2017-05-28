angular.module('orderCloud')
    .factory('UploadUtility', UploadUtilityService);

function UploadUtilityService(OrderCloudSDK, $q, toastr, $exceptionHandler) {
    var errors = [];
    var service = {
        newCategoryImages: _newCategoryImages,
        cleanProductsAndPS: _cleanProductsAndPS,
        rioPricing: _rioPricing,
        cleanCatalogAssignments: _cleanCatalogAssignments, // delete all party to category assigments
        rioPartyCategory: _rioPartyCategory, //creates party to category assignment
        rioProductCategory: _rioProductCategory, //creates product to category assignment
        rioProductPartyPS: _productPartyPS,
        patchDefaultPriceSchedule: _patchDefaultPriceSchedule,
        uploadCategoryImages: _uploadCategoryImages,
        deleteSpecialChars: _deleteSpecialChars
    };

    function _newCategoryImages(file){
        var queue = [];
        var errors = [];
        _.each(file, function(row){
            queue.push(function(){
                return OrderCloudSDK.Categories.Patch('caferio', row['Category Name'], {xp: {image: {URL: row.field2}}})
                    .catch(function(){
                        errors.push('Image Patch Err    ' + row['Category Name']);
                    });
            }());
        });
        return $q.all(queue)
            .then(function(){
                console.log(errors.join('\n'));
                toastr.success('yay');
            });
    }

    function _cleanCatalogAssignments(collectedErrors) {
        //TODO: Task Order: 1 - global.1
        //Then manually assign necessary Category.Assignments and check
        //to make sure everything still works
        var errors = collectedErrors || [];
        return OrderCloudSDK.Categories.ListAssignments('caferio', {pageSize: 100})
                .then(function(assignmentList){
                    var queue = [];
                    _.each(assignmentList.Items, function(a){
                        queue.push(function(){
                            return OrderCloudSDK.Categories.DeleteAssignment('caferio', a.CategoryID, 'caferio', {userID: a.UserID, userGroupID: a.UserGroupID})
                                .catch(function(){
                                    errors.push(a);
                                });
                        }());
                    });
                    return $q.all(queue)
                        .then(function(){
                            return assignmentList.Meta.TotalPages > 1 ? _cleanCatalogAssignments(errors) : console.log('All party-category assignments have been deleted', errors.join('\n'));
                        });
                });
    }

    function _cleanProductsAndPS(collectedErrors){
        //TODO: Task Order: 2 -global.2
        var errors = collectedErrors || [];
        return OrderCloudSDK.PriceSchedules.List({pageSize: 100})
            .then(function(productList){
                var queue = [];
                _.each(productList.Items, function(product){
                    queue.push(function(){
                        return OrderCloudSDK.PriceSchedules.Delete(product.ID)
                            .catch(function(){
                                errors.push('PS Failure:    ' + product.ID);
                            });
                    }());
                });
                return $q.all(queue)
                    .then(function(){
                        return productList.Meta.TotalPages > 1 ? _cleanProductsAndPS(errors) : console.log('Catalog is Clean', errors.join('\n'));
                    })
                    .catch(function(err){
                        console.log(err);
                    })
            });
    }

    function _rioPricing(assignments) {
        //TODO: Task Order: 3 caferio.1
        createNewPS(assignments);

        function createNewPS(remainingAssignments) {
            var chunk = remainingAssignments.splice(0, 100);
            var assignmentQueue = [];
            var errors = [];

            _.each(chunk, function(csvData) {
                var ps = {
                    ID: 'caferio-' + csvData.product,
                    Name: 'caferio-' + csvData.product + ' - ' + csvData.Price,
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
                    return OrderCloudSDK.PriceSchedules.Update(ps.ID, ps)
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

    function _productPartyPS(assignments){
        //TODO: Task Order: 2
        //assigns non-cafe rio price schedules to general managers
        //and then sets caferio price schedules as default (so they are inherited by entire buyer org)
        //only necessary for caferio - override price - price schedule, caferio usergroup, product
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
                    PriceScheduleID: csvData.product,
                    UserGroupID: 'generalmanagers',
                    BuyerID: 'caferio'
                };
                assignmentQueue.push((function() {
                    return OrderCloudSDK.Products.SaveAssignment(assignmentObj)
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

    function _patchDefaultPriceSchedule(remainingAssignments){
        var queue = [];
        var errors = [];
        _.each(remainingAssignments, function(a){
            queue.push(function(){
                return OrderCloudSDK.Products.Patch(a.product, {DefaultPriceScheduleID: 'caferio-' + a.product})
                    .catch(function(){
                        errors.push(a.product);
                    });
            });
        });
        return $q.all(queue)
            .then(function(){
                console.log(errors.join('\n'));
                toastr.success('done');
            });
    }

    function _rioProductCategory(assignments){
        //TODO: Task Order: 2


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
                return OrderCloudSDK.Categories.SaveProductAssignment('caferio', {CategoryID: a.categoryid, ProductID: a.productid})
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

    function _uploadCategoryImages(categories){
        //FIXME: Task Order: 3
        //this should be done last to update category images
        var queue = [];
        var errors = [];
        _.each(categories, function(category){
            queue.push(function(){
                var partialCat = {xp:{image:{URL:category.url}}};
                return OrderCloudSDK.Categories.Patch('caferio', partialCat)
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































    function _rioPartyCategory(assignments) {
        //FIXME: Not Necessary
        //only category assignments here will be fullCatalog -> fullCatalog UserGroup and caferio -> caferio UserGroup
        //two api calls needed just do it on your own


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
                return OrderCloudSDK.Categories.SaveAssignment({CategoryID: csv.categoryid, BuyerID: 'caferio'}, 'caferio')
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


    function _deleteSpecialChars(remainingProductIDs){
        //this won't be necessary since on create I will be removing special characters

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