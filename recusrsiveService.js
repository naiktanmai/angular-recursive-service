
angular.module('recursive', [])
    /**
     * @ngdoc method
     */
    .factory('read', function($q, $timeout, CrudService) {
        var pageNumber = 0;
        var allData = [];
        var limit = 0;
        var deferred;
        deferred = null;
        return {
            fetch: function(query, options, deferred) {
                if (!deferred) {
                    deferred = $q.defer();
                    pageNumber = 0;
                    allData = [];
                }
                var self = this;
                limit = query.parameters.limit || 100;
                this.runQuery(query)
                    .then(function(result) {
                        if (result.data.length) {
                            angular.forEach(result.data, function(indRes) {
                                allData.push(indRes);
                            });
                            $timeout(function() {
                                pageNumber = pageNumber + 1;
                                query.parameters.pageNumber = pageNumber;
                                self.fetch(query, options, deferred);
                            }, 500);

                        } else {
                            deferred.resolve({
                                data: allData,
                                status: 'success'
                            });
                        }
                    }, function() {
                        if (options.strict) {
                            deferred.reject({
                                data: allData,
                                status: 'error'
                            });
                        } else {
                            if (allData.length) {
                                deferred.resolve({
                                    data: allData,
                                    status: 'success'
                                });
                            } else {
                                deferred.reject({
                                    data: allData,
                                    status: 'error'
                                });
                            }
                        }
                    });
                return deferred.promise;
            },
            runQuery: function(query) {
                var deferred = $q.defer();
                var CRUDRet = {
                    success: function(result) {
                        deferred.resolve(result);
                    },
                    error: function(error) {
                        deferred.reject(error);
                    }
                };

                CrudService.operation({
                        op: 'read'
                    },
                    query,
                    CRUDRet.success,
                    CRUDRet.error
                );
                return deferred.promise;
            }
        };
    })
