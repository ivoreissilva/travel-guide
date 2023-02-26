
function initialize(trip) {
    initializeMaps(trip);
    initializeState(trip);
    initializeListen(trip);
}

function initializeMaps(trip) {

    const days = trip.itinerary;

    days.forEach(function(day, i) {

        const map = L.map('map-day-' + i).setView([0, 0], 13);

        map.scrollWheelZoom.disable();

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const bounds = [];

        day.activities.forEach(function(activity) {

            const coordinates = [activity.coordinates.latitude, activity.coordinates.longitude];

            L.marker(coordinates).addTo(map);

            bounds.push(coordinates);
        });

        if (bounds.length > 0) {
            map.fitBounds(bounds, {padding: [50, 50]});
        }
    });
}

let isSpeaking = false;

function initializeListen(trip) {

    const $buttonsListen = document.querySelectorAll('.listen');

    $buttonsListen.forEach(function($button) {
        
        $button.addEventListener('click', function(e) {
            
            listen($button.dataset.activity);

            e.preventDefault();
        });
    });
}

function listen(activityId) {

    if (isSpeaking) {
        speechSynthesis.cancel();
        isSpeaking = false;
        return;
    }
    
    const $activity = document.getElementById(`${activityId}-description`);
    const text = $activity.textContent;

    const speechData = new SpeechSynthesisUtterance();

    speechData.volume = 1;
    speechData.rate = 0.9;
    speechData.text = text;
    speechData.lang = 'pt-PT';

    speechSynthesis.speak(speechData);

    isSpeaking = true;
}

function initializeState(trip) {

    const days = trip.itinerary;

    days.forEach(function(day, i) {

        const dayId = 'day-' + i;

        if (!Store.isExpandedDefault(dayId)) {
            toggleDayExpanded(dayId, Store.isExpanded(dayId));
        }
        
        day.activities.forEach(function(activity) {

            const activityId = activity.uid;

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

    const $buttonsExpand = document.querySelectorAll('.expand-day');

    $buttonsExpand.forEach(function($button) {
        
        $button.addEventListener('click', function(e) {
            
            toggleDayExpanded($button.dataset.day);

            e.preventDefault();
        });
    });
}

function toggleDayExpanded(dayId, expand) {

    const $day = document.getElementById(dayId);

    expand = expand !== undefined ? expand : !Store.isExpanded(dayId);

    if (expand) $day.setAttribute("open", "");
    else $day.removeAttribute("open");

    Store.setExpanded(dayId, expand);
}

function initializeActivityStateEvents() {

    const $buttonsExpand = document.querySelectorAll('.expand-activity');

    $buttonsExpand.forEach(function($button) {
        
        $button.addEventListener('click', function(e) {
            
            toggleActivityExpanded($button.dataset.activity);

            e.preventDefault();
            e.stopPropagation();
        });
    });

    const $buttonsVisited = document.querySelectorAll('.mark-visited');

    $buttonsVisited.forEach(function($button) {
        
        $button.addEventListener('click', function(e) {
            
            toggleActivityVisited($button.dataset.activity)

            e.preventDefault();
            e.stopPropagation();
        });
    });
}

function toggleActivityExpanded(activityId, expand) {

    const $activity = document.getElementById(activityId);

    expand = expand !== undefined ? expand : !Store.isExpanded(activityId);

    if (expand) $activity.setAttribute("open", "");
    else $activity.removeAttribute("open");

    Store.setExpanded(activityId, expand);
}

function toggleActivityVisited(activityId, visited) {

    const $btVisited = document.getElementById(`${activityId}-visited`);
    const $icon = $btVisited.getElementsByTagName('i')[0];

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
        const isExpanded = localStorage.getItem(`${key}:expanded`);
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
