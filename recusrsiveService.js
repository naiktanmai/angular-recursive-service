angular.module('recursive', [])
    /**
     * @ngdoc method
     */
    .factory('read', function($q, $timeout, CrudService) {
        var pageNumber = 0;
        var returnData = [];
        var limit = 0;
        var deferred;
        deferred = null;
        return {
            fetch: function(query, options, deferred) {
                if (!deferred) {
                    deferred = $q.defer();
                    pageNumber = 0;
                    returnData = [];
                }
                var self = this;
                limit = query.parameters.limit || 100;
                CrudService.read(query)
                    .then(function(result) {
                        if (result.data.length) {
                            angular.forEach(result.data, function(indRes) {
                                returnData.push(indRes);
                            });
                            $timeout(function() {
                                pageNumber = pageNumber + 1;
                                query.parameters.pageNumber = pageNumber;
                                self.fetch(query, options, deferred);
                            }, 500);

                        } else {
                            deferred.resolve(returnData);
                        }
                    }, function(error) {
                        deferred.reject(error)
                    });
                return deferred.promise;
            }
        };
    })
