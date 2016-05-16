angular.module('starter.services', ['firebase'])

/*
.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})
*/
.factory("Auth", ["$firebaseAuth", "$rootScope", function ($firebaseAuth, $rootScope) {
    var ref = new Firebase(firebaseUrl);
    return $firebaseAuth(ref);
  }]
)

.factory('Chats', function ($firebaseArray, Rooms) {

    var selectedRoomId;

    var ref = new Firebase(firebaseUrl);
    var chats;

    return {
        all: function () {
            return chats;
        },
        remove: function (chat) {
            chats.$remove(chat).then(function (ref) {
                ref.key() === chat.$id; // true item has been removed
            });
        },
        get: function (chatId) {
            for (var i = 0; i < chats.length; i++) {
                if (chats[i].id === parseInt(chatId)) {
                    return chats[i];
                }
            }
            return null;
        },
        getSelectedRoomName: function () {
            var selectedRoom;
            if (selectedRoomId && selectedRoomId != null) {
                selectedRoom = Rooms.get(selectedRoomId);
                if (selectedRoom)
                    return selectedRoom.name;
                else
                    return null;
            } else
                return null;
        },
        selectRoom: function (roomId) {
            console.log("selecting the room with id: " + roomId);
            selectedRoomId = roomId;
            //if (!isNaN(roomId)) {
            if (roomId) {
                chats = $firebaseArray(ref.child('rooms').child(selectedRoomId).child('chats'));
            }
        },
        send: function (from, message) {
            console.log("sending message from :" + from + " in room " + selectedRoomId + " & message is " + message);
            if (from && message) {
                var chatMessage = {
                    from: from,
                    message: message,
                    createdAt: Firebase.ServerValue.TIMESTAMP
                };
                /*
                selectedRoomId = roomId;
                if (!isNaN(roomId)) {
                    chats = $firebaseArray(ref.child('rooms').child(selectedRoomId).child('chats'));
                }
                */
                chats.$add(chatMessage).then(function (data) {
                    console.log("message added");
                });
            }
        }
    }
})

/**
 * Simple Service which returns Rooms collection as Array from Salesforce & binds to the Scope in Controller
 */
.factory('Rooms', function ($firebaseArray) {
    // Might use a resource here that returns a JSON array
    var ref = new Firebase(firebaseUrl);
    var rooms = $firebaseArray(ref.child('rooms'));

    return {
        all: function () {
            return rooms;
        },
        get: function (roomId) {
            // Simple index lookup
            return rooms.$getRecord(roomId);
        },
        remove: function(room){
            rooms.$remove(room).then(function (ref) {
                ref.key() === room.$id; // true item has been removed
            });
        },
        create: function (name) {
            console.log("creating room:" + name);
            if (name) {
                var room = {
                    name: name,
                    createdAt: Firebase.ServerValue.TIMESTAMP
                };
                rooms.$add(room).then(function (data) {
                    console.log("room added");
                });
            }
        }
    }
})

.factory('Events', function($q, $cordovaCalendar) {

    var incrementDate = function (date, amount) {
        var tmpDate = new Date(date);
        tmpDate.setDate(tmpDate.getDate() + amount);
        
        tmpDate.setHours(13);
		tmpDate.setMinutes(0);
		tmpDate.setSeconds(0);
		tmpDate.setMilliseconds(0);
	
        return tmpDate;
    };
    
    var incrementHour = function(date, amount) {
		var tmpDate = new Date(date);
		tmpDate.setHours(tmpDate.getHours() + amount);
		return tmpDate;
	};

    //create fake events, but make it dynamic so they are in the next week
    var fakeEvents = [];
    fakeEvents.push(
        {
            "title":"Meetup on Ionic",
            "description":"We'll talk about beer, not Ionic.",
            "date":incrementDate(new Date(), 1)
        }   
    );
    fakeEvents.push(
        {
            "title":"Meetup on Beer",
            "description":"We'll talk about Ionic, not Beer.",
            "date":incrementDate(new Date(), 2)
        }   
    );
    fakeEvents.push(
        {
            "title":"Ray's Birthday Bash",
            "description":"Celebrate the awesomeness of Ray",
            "date":incrementDate(new Date(), 4)
        }   
    );
    fakeEvents.push(
        {
            "title":"Code Review",
            "description":"Let's tear apart Ray's code.",
            "date":incrementDate(new Date(), 5)
        }   
    );
    
    var getEvents = function() {
        var deferred = $q.defer();

        /*
        Logic is:
        For each, see if it exists an event.
        */
        var promises = [];
        fakeEvents.forEach(function(ev) {
            //add enddate as 1 hour plus
            ev.enddate = incrementHour(ev.date, 1);
            console.log('try to find '+JSON.stringify(ev));
            promises.push($cordovaCalendar.findEvent({
                title:ev.title,
                startDate:ev.date
            }));
        });
        
        $q.all(promises).then(function(results) {
            console.log("in the all done");   
            //should be the same len as events
            for(var i=0;i<results.length;i++) {
                fakeEvents[i].status = results[i].length === 1;
            }
            deferred.resolve(fakeEvents);
        });
        
        return deferred.promise;
    }
    
    var addEvent = function(event) {
        var deferred = $q.defer();
    
        $cordovaCalendar.createEvent({
            title: event.title,
            notes: event.description,
            startDate: event.date,
            endDate:event.enddate
        }).then(function (result) {
            console.log('success');
            console.dir(result);
            deferred.resolve(1);
        }, function (err) {
            console.log('error');
            console.dir(err);
            deferred.resolve(0);
        }); 
        
        return deferred.promise;
    
    }
    
  return {
        get:getEvents,
        add:addEvent
  };

});
