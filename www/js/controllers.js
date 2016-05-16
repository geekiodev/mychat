angular.module('starter.controllers', [])

.controller('LoginCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {
  console.log('Login Controller Initialized');
  
  var ref = new Firebase($scope.firebaseUrl);
  var auth = $firebaseAuth(ref);

  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal;
  });
  
  $scope.createUser = function (user) {
    console.log("Create User Function called");
    if (user && user.email && user.password && user.displayname) {
      $ionicLoading.show({
        template: 'Signing Up...'
      });

      auth.$createUser({
        email: user.email,
        password: user.password
      }).then(function (userData) {
        alert("User created successfully!");
        ref.child("users").child(userData.uid).set({
          email: user.email,
          displayName: user.displayname
        });
        $ionicLoading.hide();
        $scope.modal.hide();
      }).catch(function (error) {
        alert("Error: " + error);
        $ionicLoading.hide();
      });
    } else {
      alert("Please fill all details");
    }
  }
  
  $scope.signIn = function (user) {
    if (user && user.email && user.pwdForLogin) {
      $ionicLoading.show({
        template: 'Signing In...'
      });
      auth.$authWithPassword({
        email: user.email,
        password: user.pwdForLogin
      }).then(function (authData) {
        console.log("Logged in as:" + authData.uid);
        ref.child("users").child(authData.uid).once('value', function (snapshot) {
          var val = snapshot.val();
          // To Update AngularJS $scope either use $apply or $timeout
          $scope.$apply(function () {
            $rootScope.displayName = val.displayName;
          });
        });
        $ionicLoading.hide();
        $state.go('tab.rooms');
      }).catch(function (error) {
        alert("Authentication failed:" + error.message);
        $ionicLoading.hide();
      });
    } else {
      alert("Please enter email and password both");
    }
  }
})

.controller('ChatCtrl', function ($scope, Chats, $state, $rootScope) {
  console.log("Chat Controller initialized");

  $scope.IM = {
      textMessage: ""
  };
  
  var roomId = $state.params.roomId;
  Chats.selectRoom(roomId);
  
  var roomName = Chats.getSelectedRoomName();
  
  // Fetching Chat Records only if a Room is Selected
  if (roomName) {
      $scope.roomName = " - " + roomName;
      $scope.chats = Chats.all();
  }
  
  $scope.displayName = $rootScope.displayName;
  
  $scope.sendMessage = function (msg) {
      console.log(msg);
      console.log(roomId);
      Chats.send($scope.displayName, msg);
      $scope.IM.textMessage = "";
  }
  
  $scope.remove = function (chat) {
      Chats.remove(chat);
  }
})  

.controller('EventCtrl', function ($scope, Events, $state, $ionicPlatform, $cordovaCalendar, $timeout) {
  console.log("Event Controller initialized");
  /*
  Events.get().then(function(events) {
    console.log("events", events);  
    $scope.events = events;
  });
  */
  
  $ionicPlatform.ready(function() {
		Events.get().then(function(events) {
			console.log("events", JSON.stringify(events));	
			$scope.events = events;
		});
	});
	
  $scope.addEvent = function(event,idx) {
		console.log("add ",event);
		
		Events.add(event).then(function(result) {
			console.log("done adding event, result is "+result);
			if(result === 1) {
				//update the event
				$timeout(function() {
					$scope.events[idx].status = true;
					$scope.$apply();
				});
			} else {
				//For now... maybe just tell the user it didn't work?
				console.log('did not work');
			}
		});

		
	};
})  

.controller('RoomsCtrl', function ($scope, $ionicModal, Rooms, $state) {
  
  //configure the ionic modal before use
  $ionicModal.fromTemplateUrl('new-room-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
  }).then(function (modal) {
      $scope.newRoomModal = modal;
  });
    
  console.log("Rooms Controller initialized");
  $scope.rooms = Rooms.all();
  
  //initialize the room scope with empty object
  $scope.room = {};
  
  $scope.openChatRoom = function (roomId) {
    $state.go('tab.chat', {
      roomId: roomId
    });
  }
  
  $scope.getRooms = function () {
      //fetches rooms from service
      $scope.rooms = Rooms.all();
  }
  $scope.createRoom = function () {
    console.log($scope.room.name);
      //creates a new room
      Rooms.create($scope.room.name);
      
      $scope.room = {};
      
      //close new task modal
      $scope.newRoomModal.hide();
  }
  $scope.removeRoom = function (room) {
      //removes a room
      Rooms.remove(room);
  }
    
  $scope.openRoomModal = function () {
    $scope.newRoomModal.show();
  };

  $scope.closeRoomModal = function () {
    $scope.newRoomModal.hide();
  };
});
