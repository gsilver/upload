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

myApp.controller('myCtrl', ['$scope', '$rootScope','fileUpload', '$timeout', function($scope, $rootScope, fileUpload, $timeout) {
  $scope.fields = [{
    'name': 'user_id',
    'validation': {
      'spaces': 'nospaces',
      'chars': 'num',
      'max': 10,
      'min': 10
    }
  }, {
    'name': 'role',
    'validation': {
      'spaces': 'nospaces',
      'chars': 'alpha',
      'choices': ['choice1', 'choice2'],
      'max': 10,
      'min': 10
    }
  }, {
    'name': 'section_id',
    'validation': {
      'spaces': 'nospaces',
      'chars': 'num',
      'max': 10,
      'min': 10
    }
  }, {
    'name': 'user_status',
    'validation': {
      'spaces': 'nospaces',
      'chars': 'alpha',
      'choices': ['choice1', 'choice2'],
      'max': 10,
      'min': 10
    }
  }, {
    'name': 'section_name',
    'validation': {
      'spaces': 'spaces',
      'chars': 'alpha',
      'max': 10,
      'min': 10
    }
  }, {
    'name': 'group_name',
    'validation': {
      'spaces': 'spaces',
      'chars': 'alpha',
      'max': 10,
      'min': 10
    }
  }, {
    'name': 'section_id',
    'validation': {
      'spaces': 'nospaces',
      'chars': 'num',
      'max': 10,
      'min': 10
    },
  }, {
    'name': 'group_id',
    'validation': {
      'spaces': 'nospaces',
      'chars': 'num',
      'max': 10,
      'min': 10
    }
  }, {
    'name': 'section_status',
    'validation': {
      'spaces': 'nospaces',
      'chars': 'alpha',
      'choices': ['choice1', 'choice2'],
      'max': 10,
      'min': 10
    }
  }, {
    'name': 'group_status',
    'validation': {
      'spaces': 'nospaces',
      'chars': 'alpha',
      'choices': ['accepted', 'deleted'],
      'max': 10,
      'min': 10
    }
  }, {
    'name': 'user_uniqname',
    'validation': {
      'spaces': 'nospaces',
      'chars': 'alpha',
      'max': 10,
      'min': 10
    }
  }, {
    'name': 'user_role',
    'validation': {
      'spaces': 'nospaces',
      'chars': 'alpha',
      'choices': ['role1', 'role2'],
      'max': 10,
      'min': 10
    }
  }, ];

  $scope.changeSelectedFunction = function(value){
  $rootScope.selectedFunction = value;

  };
  $scope.functions = [{
    name: 'Add multiple users to Canvas sections through CSV',
    id: 'users_in_sections',
    type: 'csv',
    fields: ['user_id', 'role', 'section_id', 'user_status'],
    fields_model : ['User ID', 'Role', 'Section Id', 'User Status']

  }, {
    name: 'Add multiple new sections to Canvas sections through CSV',
    id: 'sections_to_canvas',
    type: 'csv',
    fields: ['section_name'],
    fields_model: ['Section Name']
  }, {
    name: 'Add multiple new groups to Canvas sections through CSV',
    id: 'groups_to_sections',
    type: 'csv',
    fields: ['group_name'],
    fields_model: ['Group Name']
  }, {
    name: 'Add multiple users to Canvas groups through CSV',
    id: 'users_to_groups',
    type: 'csv',
    fields: ['user_id', 'group_id', 'status'],
    fields_model: ['User Id', 'Group Id', 'Status']
  }, {
    name: 'Add multiple users to Canvas sections through data grid',
    id: 'users_to_sections_grid',
    type: 'grid',
    fields: ['section_name', 'user_uniqname', 'user_role'],
  }, {
    name: 'Add multiple users to Canvas groups through data grid',
    id: 'users_to-groups_grid',
    type: 'grid',
    fields: ['group_name', 'user_uniqname']
  }, {
    name: 'Add course rosters to multiple Canvas sites',
    id: 'rosters',
    type: 'csv',
    fields: ['notsure', 'dontknow', 'whoknows']
  }];

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
      obj.data=[];
      _.each(headers, function(cel, index){
        if(lineArray[index]){
          if(lineArray[index].split(' ').length !== 1 || lineArray[index] ===''){
            obj.invalid = true;
          }
        }
        obj.data.push(lineArray[index]);
      });
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
