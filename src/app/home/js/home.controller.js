angular.module('orderCloud')
	.controller('HomeCtrl', HomeController)
;

function HomeController($q, toastr, OrderCloud, CupsUtility, $exceptionHandler) {
	var vm = this;
	vm.errors = [];
	vm.test = stripChars;

	function stripSpecialChars(){
        return CupsUtility.ListAll(OrderCloud.Products.ListAssignments, null, null, null, 'group', null, 'page', 100, 'caferio')
            .then(function(assignmentList){
                var productIDs = _.pluck(assignmentList.Items, 'ProductID');
                return stripChars(productIDs);
            });
    }

    function stripChars(remainingProductIDs){
		var pageSize = 25; //keep this small so joining ids doesnt max char limit
        var chunk = remainingProductIDs.splice(0, pageSize);
		var placeholder = '&&' //unique character that we can replace unknown character with
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
							return OrderCloud.Products.Update(p.ID, p)
								.then(function(){
									return p;
								})
								.catch(function(){
									vm.errors.push(p.ID);
								});
						}());
					}
                });
                return $q.all(queue)
                    .then(function(results){
						var updateQueue = [];
						results = _.compact(results); //if any products failed patch they'll show as undefined here
						_.each(results, function(p){
							p.Name = p.Name.replace(/&&/g, '');
							if(p & p.Description) p.Description = p.Description.replace(/&&/g, '');
							if(p && p.xp && p.xp["description_short"]) {
								p.xp["description_short"] = p.xp["description_short"].replace(/&&/g, '');
							}
							updateQueue.push(function(){
								return OrderCloud.Products.Update(p.ID, p)
									.then(function(){
									})
									.catch(function(){
										vm.errors.push(p.ID);
									});
								}());
						});
						return $q.all(updateQueue)
							.then(function(moarResults){
								if(remainingProductIDs.length) {
									return stripChars(remainingProductIDs);
								} else {
									var errors = vm.errors.join('\n');
									return 'yay';
								}
							});
                    });
            });
    }

    function _deepCategoryAssignment() {
		var tokenRequest = {
			clientID: '7FC87166-D42A-4F2D-9587-159D98156314',
			Claims: ['FullAccess']
		};
		return OrderCloud.Users.GetAccessToken('ccarlson', tokenRequest, 'caferio')
			.then(function(token) {
				return OrderCloud.Auth.SetImpersonationToken(token.access_token);
			})
			.then(function() {
				var listItems;
				var queue =[];
				return OrderCloud.As().Me.ListCategories(null, 1, 100, null, null, null, 'all', 'caferio')
					.then(function(data){
						listItems = data;
						if(data.Meta.TotalPages > data.Meta.Page){
							var page = data.Meta.Page;
							while(page < data.Meta.TotalPages) {
								page +=1;
								queue.push(OrderCloud.As().Me.ListCategories(null, page, 100, null, null, null, 'all', 'caferio'));
							}
						}
						return $q.all(queue)
							.then(function(results){
								_.each(results, function(result){
									listItems.Items = [].concat(listItems.Items, result.Items);
								});
								var fullCatList = angular.copy(listItems.Items);
								return checkCategory(listItems.Items, fullCatList);
							});
					});
			})
			.catch(function(ex){
				$exceptionHandler(ex);
			});
    }
	

    function checkCategory(categories, fullCatList) {
        var category = categories.pop();
        if (category && category.ParentID) {
            return OrderCloud.Categories.ListProductAssignments(category.ID, null, null, 100, 'caferio')
                .then(function(assignmentList) {
					var assignedProducts = _.pluck(assignmentList.Items, 'ProductID');
					assignToParentCat(category, assignedProducts, categories, fullCatList);
					}
				);
        } else {
            if (categories.length) {
                return checkCategory(categories, fullCatList);
            } else {
                return finish(vm.errors.join('\n'));
            }
        }
    }

	function assignToParentCat(category, assignedProducts, remainingCategories, fullCatList){
		return OrderCloud.As().Me.ListProducts(null, null, 100, null, null, {CategoryID: category.ParentID})
			.then(function(productList) {
				var products = _.pluck(productList.Items, 'ID');
				var parentCat = _.findWhere(fullCatList, {ID: category.ParentID});
				var productsToAssign = _.difference(products, assignedProducts);

				if(!productsToAssign && !parentCat && remainingCategories.length) return checkCategory(remainingCategories, fullCatList);
				if(!productsToAssign && !parentCat && !remainingCategories.length) return finish();
				
				var assignmentQueue = [];
				_.each(productsToAssign, function(pID) {
					assignmentQueue.push(function() {
						return OrderCloud.Categories.SaveProductAssignment({CategoryID: category.ID, ProductID: pID}, 'caferio')
							.catch(function() {
								vm.errors.push({ProductID: pID, CategoryID: category.ID});
							});
					}());
				});
				return $q.all(assignmentQueue)
					.then(function() {
						if (parentCat) {
							return assignToParentCat(parentCat, assignedProducts, remainingCategories, fullCatList);
						}
						else if(remainingCategories.length){
							checkCategory(remainingCategories, fullCatList);
						} else {
							return finish(vm.errors.join('\n'));
						}
					});
			});
	}

	function finish() {
        toastr.success('Finished', 'Success');
    }
}
