var filters = angular.module('LightmineApp.filters', []);

filters.filter('userName', function () {
  return function (input) {
    if (input !== undefined) {
      var retString = "";

      if (input.name) {
        retString += input.name;
      } else {
        retString += input.firstname + " " + input.lastname;
      }

      if (input.login) {
        retString += " (" + input.login + ")";
      }

      return retString;
    }

    return "";
  };
});

filters.filter('unique', function () {
  return function (items, filterOn) {
    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var hashCheck = {}, newItems = [];

      var extractValueToCompare = function (item) {
        if (angular.isObject(item) && angular.isString(filterOn)) {
          return item[filterOn];
        } else {
          return item;
        }
      };

      angular.forEach(items, function (item) {
        var valueToCheck, isDuplicate = false;
        var i;

        for (i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
});

filters.filter('issueStatus', function () {
  return function (items, filterOn) {
    if (filterOn === false) {
      return items;
    }

    var newItems = [];

    angular.forEach(items, function (item) {
      if (item.status.name === filterOn) {
        newItems.push(item);
      }
    });
    return newItems;
  };
});
