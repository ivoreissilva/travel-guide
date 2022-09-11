
function initialize(trip) {

    initializeMaps(trip);
    initializeState(trip);
    initializeSidebar();
    initializeMoveToTop();   
}

function initializeMaps(trip) {

    var days = trip.itinerary;

    days.forEach(function(day, i) {

        var map = L.map('map-day-' + i).setView([0, 0], 13);

        map.scrollWheelZoom.disable();

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        var bounds = [];

        day.activities.forEach(function(activity) {

            var coordinates = [activity.coordinates.latitude, activity.coordinates.longitude];

            L.marker(coordinates).addTo(map);

            bounds.push(coordinates);
        });

        if (bounds.length > 0) {
            map.fitBounds(bounds, {padding: [50, 50]});
        }
    });
}


function initializeSidebar() {

    var $sidenav = document.getElementById('sidenav');
    
    M.Sidenav.init($sidenav, {});

    initializeSidebarDayLinks($sidenav);
}


function initializeSidebarDayLinks($sidenav) {

    var $dayLinks = document.querySelectorAll('.day-link');

    var i;

    for (i = 0 ; i < $dayLinks.length ; i++) {
        
        $dayLinks[i].addEventListener('click', function() {

            setTimeout(function () {
                window.scrollBy(0, -50);
            }, 0);
            
            var sidenav = M.Sidenav.getInstance($sidenav);
            
            sidenav.close();
        });
    }
}

function initializeMoveToTop() {

    var $btTop = document.getElementById('bt-top');

    M.FloatingActionButton.init($btTop, {
        direction: 'left',
        hoverEnabled: false
    });

    $btTop.addEventListener('click', function() {
        window.scrollTo(0, 0);
    });
}

function initializeState(trip) {

    var days = trip.itinerary;

    days.forEach(function(day, i) {

        var dayId = 'day-' + i;

        if (!Store.isExpandedDefault(dayId)) {
            toggleDayExpanded(dayId, Store.isExpanded(dayId));
        }
        
        day.activities.forEach(function(activity) {

            var activityId = activity.uid;

            if (!Store.isExpandedDefault(activityId)) {
                toggleActivityExpanded(activityId, Store.isExpanded(activityId));
            }

            if (!Store.isVisitedDefault(activityId)) {
                toggleActivityVisited(activityId, Store.isVisited(activityId));
            }
        });
    });

    initializeDayStateEvents();
    initializeActivityStateEvents();
}

function initializeDayStateEvents() {

    var $buttonsExpand = document.querySelectorAll('.btn-expand-day');

    $buttonsExpand.forEach(function($button) {
        
        $button.addEventListener('click', function(e) {
            
            toggleDayExpanded($button.dataset.day);

            e.preventDefault();
        });
    });
}

function toggleDayExpanded(dayId, expand) {

    var $day = document.getElementById(dayId);
    var $dayTitle = document.getElementById(`${dayId}-title`);
    var $btExpand = document.getElementById(`${dayId}-expand`);
    var $icon = $btExpand.getElementsByTagName('i')[0];

    expand = expand !== undefined ? expand : !Store.isExpanded(dayId);

    if (expand) {
        $day.classList.remove('day-collapsed');
        $dayTitle.classList.remove('day-collapsed');
        $icon.textContent = 'expand_less';
    } else {
        $day.classList.add('day-collapsed');
        $dayTitle.classList.add('day-collapsed');
        $icon.textContent = 'expand_more';
    }

    Store.setExpanded(dayId, expand);
}

function initializeActivityStateEvents() {

    var $buttonsExpand = document.querySelectorAll('.btn-expand');

    $buttonsExpand.forEach(function($button) {
        
        $button.addEventListener('click', function(e) {
            
            toggleActivityExpanded($button.dataset.activity);

            e.preventDefault();
        });
    });

    var $buttonsVisited = document.querySelectorAll('.btn-visited');

    $buttonsVisited.forEach(function($button) {
        
        $button.addEventListener('click', function(e) {
            
            toggleActivityVisited($button.dataset.activity)

            e.preventDefault();
        });
    });
}

function toggleActivityExpanded(activityId, expand) {

    var $activity = document.getElementById(activityId);
    var $btExpand = document.getElementById(`${activityId}-expand`);
    var $icon = $btExpand.getElementsByTagName('i')[0];

    expand = expand !== undefined ? expand : !Store.isExpanded(activityId);

    if (expand) {
        $activity.classList.remove('activity-collapsed');
        $icon.textContent = 'expand_less';
    } else {
        $activity.classList.add('activity-collapsed');
        $icon.textContent = 'expand_more';
    }

    Store.setExpanded(activityId, expand);
}

function toggleActivityVisited(activityId, visited) {

    var $btVisited = document.getElementById(`${activityId}-visited`);
    var $icon = $btVisited.getElementsByTagName('i')[0];

    visited = visited !== undefined ? visited : !Store.isVisited(activityId);

    if (visited) {
        $icon.textContent = 'visibility';
        $btVisited.classList.remove('not-visited');
        Store.setVisited(activityId, true);
        toggleActivityExpanded(activityId, false);
    } else {
        $icon.textContent = 'visibility_off';
        $btVisited.classList.add('not-visited');
        Store.setVisited(activityId, false);
    }
}

var Store = {

    setExpanded: function(key, isExpanded) {
        localStorage.setItem(`${key}:expanded`, isExpanded);
    },

    isExpanded: function(key) {
        var isExpanded = localStorage.getItem(`${key}:expanded`);
        return isExpanded === null || isExpanded === 'true';
    },

    isExpandedDefault: function(key) {
        return this.isExpanded(key);
    },

    setVisited: function(key, isVisited) {
        localStorage.setItem(`${key}:visited`, isVisited);
    },

    isVisited: function(key) {
        return localStorage.getItem(`${key}:visited`) === 'true';
    },

    isVisitedDefault: function(key) {
        return localStorage.getItem(`${key}:visited`) !== 'true';
    }
}
