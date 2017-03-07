var myApp = angular.module('myApp', ['ngAnimate']);

myApp.directive('fileModel', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function() {
        scope.$apply(function() {
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);

myApp.service('fileUpload', ['$http', function($http) {
  this.uploadFileAndFieldsToUrl = function(file, fields, uploadUrl) {
    var fd = new FormData();
    fd.append('file', file);
    angular.forEach(fields, function(value, key) {
      fd.append(key, value);
    });

    $http.post(uploadUrl, fd, {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      })
      .success(function() {})
      .error(function() {
        alert('Sorry, I can\'t do this Dave');
      });
  };
}]);

myApp.controller('myCtrl', ['$scope', '$rootScope', 'fileUpload', '$timeout', '$log', '$http', function($scope, $rootScope, fileUpload, $timeout, $log, $http) {

  $http.get('settings/functions.json').success(function(data) {
    $scope.functions = data;
  });

  $scope.changeSelectedFunction = function() {
    $rootScope.selectedFunction = value;
  };


  $scope.content = false;
  $scope.gridRowNumber = 25;
  $scope.getNumber = function(num) {
    return new Array(num);
  };

  $scope.$watch('csvfile', function(newFileObj) {
    if (newFileObj) {
      $scope.content = false;
      $scope.loading = true;
      var reader = new FileReader();
      reader.readAsText(newFileObj);
      reader.onload = function(e) {
        var CSVPreview = function() {
          $scope.headers = $scope.selectedFunction.fields;
          $scope.content = parseCSV(reader.result, $scope.headers, $scope.headers.length);
        };
        $timeout(CSVPreview, 100);
      };
      $scope.filename = newFileObj.name;
    }
  });

  $scope.changeSelectedFunction = function() {
    $scope.content = [];
  };


  $scope.uploadForm = function() {
    var file = $scope.users_in_sections;
    var uploadUrl = "/formUpload";
    var fields = {
      "name": "filename",
      "user": "gsilver",
      "request": "users_to_sections",
      "account": 12,
      "data": $scope.filename
    };
    fileUpload.uploadFileAndFieldsToUrl(file, fields, uploadUrl);
  };

  parseCSV = function(CSVdata, headers, colCount) {
    var lines = CSVdata.split("\n");
    var result = [];
    $scope.errors = [];
    for (var i = 0; i < lines.length; i++) {
      var lineArray = lines[i].split(',');
      var obj = {};
      obj.data = [];
      var number_pattern = /^\d+$/;
      _.each(headers, function(header, index) {
        var validation = header.validation;
        if (lineArray[index]) {
          if (lineArray[index].split(' ').length !== 1 && !validation.spaces) {
            $log.warn(lineArray[index] + ' has spaces');
            obj.invalid = true;
          }
          if (lineArray[index].length > validation.max) {
            $log.warn(lineArray[index] + ' too many chars');
            obj.invalid = true;
          }
          if (lineArray[index].length < validation.min) {
            $log.warn(lineArray[index] + ' too few chars');
            obj.invalid = true;
          }
          if (!number_pattern.test(lineArray[index]) && validation.chars === 'num') {
            $log.warn(lineArray[index] + ' not a number');
            obj.invalid = true;
          }
          if (validation.choices) {
            if (_.indexOf(validation.choices, lineArray[index]) === -1) {
              $log.warn(lineArray[index] + ' is not one of the choices in ' + validation.choices);
              obj.invalid = true;
            }
          }
        }
        obj.data.push(lineArray[index]);
      });
      if (lineArray.length !== colCount && lineArray !== ['']) {
        obj.invalid = true;
      }

      if (lineArray.length === 1 && lineArray[0] === '') {

      } else {
        result.push(obj);
      }
    }
    if (_.where(result, {
        invalid: true
      }).length) {
      $scope.errors = _.where(result, {
        invalid: true
      });
    }
    $scope.loading = false;
    return result;
  };

}]);
