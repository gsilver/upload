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
        console.log('Sorry, I can\'t do this Dave');
      });
  };
}]);

myApp.controller('myCtrl', ['$scope', 'fileUpload', '$timeout', function($scope, fileUpload, $timeout) {
  $scope.functions = [{
    name: 'Add multiple users to Canvas sections through CSV',
    id: 'users_in_sections'
  }, {
    name: 'Add multiple new sections to Canvas sections through CSV',
    id: 'sections_to_canvas'
  }, {
    name: 'Add multiple new groups to Canvas sections through CSV',
    id: 'groups_to_sections'
  }, {
    name: 'Add multiple users to Canvas groups through CSV',
    id: 'users_to_groups'
  }, {
    name: 'Add multiple users to Canvas sections through data grid',
    id: 'users_to_sections_grid'
  }, {
    name: 'Add multiple users to Canvas groups through data grid',
    id: 'users_to-groups_grid'
  }, {
    name: 'Add course rosters to multiple Canvas sites',
    id: 'rosters'
  }];
  //$scope.selectedFunction = $scope.functions[0];
  $scope.sortType = 'Id';
  $scope.content = false;


  $scope.resetFileUpload = function() {
    $scope.content = [];
  };

  $scope.$watch('users_in_sections', function(newFileObj) {
    if (newFileObj) {
      $scope.content = false;
      $scope.loading = true;
      var reader = new FileReader();
      reader.readAsText(newFileObj);


      reader.onload = function(e) {
        var CSVPreview = function() {
          $scope.headers = ['Id', 'Role', 'Section', 'Status'];
          $scope.content = parseCSV(reader.result, $scope.headers, 4);
        };
        $timeout(CSVPreview, 100);
      };

      $scope.filename = newFileObj.name;
    }
  });



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
      var obj = {
        'rowId': i
      };
      for (var x = 0; x < lineArray.length; x++) {
        if (lineArray[x] === '' || lineArray[x].split(' ').length !== 1) {
          obj.invalid = true;
        }
        obj[headers[x]] = lineArray[x];
      }
      if (lineArray.length !== colCount) {
        obj.invalid = true;
      }
      result.push(obj);
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
