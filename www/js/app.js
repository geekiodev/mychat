// Ionic Starter App

var firebaseUrl = "https://mychat-gd.firebaseio.com";
/*
function onDeviceReady() {
    console.log('its ready');
    angular.bootstrap(document, ["starter"]);
}
// console.log("binding device ready");
// Registering onDeviceReady callback with deviceready event
document.addEventListener("deviceready", onDeviceReady, false);
*/
/*
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
  document.addEventListener("deviceready", onDeviceReady, false);
} else {
  console.log('userAgent:');
  console.log(navigator.userAgent);
  onDeviceReady();
}
*/
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
window.ionic.Platform.ready(function() {
    console.log('its ready');
    angular.bootstrap(document, ['starter']);
});

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    // Now safe to use device APIs
    console.log('the device is ready');
}
/*
document.addEventListener('deviceready', function() { 
    console.log('its ready');
    angular.bootstrap(document, ['starter']);
}, false);
*/
var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'firebase', 'angularMoment', 'ngCordova']);

app.run(function($ionicPlatform, $rootScope, $location, Auth, $ionicLoading) {
  $ionicPlatform.ready(function() { console.log('here i am');
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    
    // To Resolve Bug
    ionic.Platform.fullScreen();

    $rootScope.firebaseUrl = firebaseUrl;
    $rootScope.displayName = null;

    Auth.$onAuth(function (authData) {
        if (authData) {
            console.log("Logged in as:", authData.uid);
        } else {
            console.log("Logged out");
            $ionicLoading.hide();
            $location.path('/login');
        }
    });
        
    $rootScope.logout = function () {
        console.log("Logging out from the app");
        $ionicLoading.show({
          template: 'Logging Out...'
        });
        Auth.$unauth();
    }
    
    $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
      // We can catch the error thrown when the $requireAuth promise is rejected
      // and redirect the user back to the home page
      if (error === "AUTH_REQUIRED") {
          $location.path("/login");
      }
    });
  });
});

app.config(function($stateProvider, $urlRouterProvider) {
  console.log("setting config");
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // State to represent Login View
  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl',
    resolve: {
      // controller will not be loaded until $waitForAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth",
        function (Auth) {
          // $waitForAuth returns a promise so the resolve waits for it to complete
          return Auth.$waitForAuth();
        }
      ]
    }
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    resolve: {
      // controller will not be loaded until $requireAuth resolves
      // Auth refers to our $firebaseAuth wrapper in the example above
      "currentAuth": ["Auth",
        function (Auth) {
          // $requireAuth returns a promise so the resolve waits for it to complete
          // If the promise is rejected, it will throw a $stateChangeError (see above)
          return Auth.$requireAuth();
        }
      ]
    }
  })

  // Each tab has its own nav history stack:

  .state('tab.rooms', {
    url: '/rooms',
    views: {
        'tab-rooms': {
            templateUrl: 'templates/tab-rooms.html',
            controller: 'RoomsCtrl'
        }
    }
  })

  .state('tab.chat', {
    url: '/chat/:roomId',
    views: {
        'tab-chat': {
            templateUrl: 'templates/tab-chat.html',
            controller: 'ChatCtrl'
        }
    }
  })
  
  .state('tab.event', {
    url: '/event',
    views: {
        'tab-event': {
            templateUrl: 'templates/tab-event.html',
            controller: 'EventCtrl'
        }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
