class ActivityTracker {
   // TODO
    constructor() {
        this.data = null;
      this.loadSessions();
      this.createWidgets();
      this.trackActivity();
      this.bindEvents();
      this.updateDisplay();
   }

 generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 10);
        return `session_${timestamp}_${random}`;
    }
createNewSession() {
        this.data = {
            sessionId: this.generateSessionId(),
            startedAt: Date.now(),
            lastActivity: Date.now(),
            events: []
        };
        this.saveData();
    }


loadSessions(){
     const stored = localStorage.getItem('activity-tracker-data');
      
      if (stored) {//if not null
         this.data = JSON.parse(stored);//change type
         const now = Date.now();
         const age = now - this.data.lastActivity;//how long since last activity
         
         if (age > 360000) {//more than 1 hour，and this is millisecond
            this.createNewSession();
         }
      } else {
         this.createNewSession();
      }
   }
 saveData() {
        this.data.lastActivity = Date.now();
        localStorage.setItem('activity-tracker-data', JSON.stringify(this.data));
    }
 getTime(timestamp) {
        const date = new Date(timestamp);
        return date.toTimeString().split(' ')[0];
    }
  formatTime(timestamp) {
        return this.getTime(timestamp);
    }
 createWidgets() {
      let widget = document.createElement('div');
      widget.className = 'activity-tracker-widget';
      
      let startTime = this.getTime(this.data.startedAt);
      
      widget.innerHTML = 
         '<button class="activity-tracker-button">🕒</button>' +
         '<aside class="activity-tracker-timeline">' +
         '<header class="timeline-header">' +
         '<h3>Activity Timeline</h3>' +
         '<div>' +
         '<div>Session ID: ' + this.data.sessionId + '</div>' +
         '<div>Started: ' + startTime + '</div>' +
         '</div>' +
         '</header>' +
         '<section class="session-stats">' +
         '<div class="stat"><div class="stat-label">Session Duration</div><div class="stat-value">0 min</div></div>' +
         '<div class="stat"><div class="stat-label">Pages Viewed</div><div class="stat-value">0</div></div>' +
         '<div class="stat"><div class="stat-label">Total Clicks</div><div class="stat-value">0</div></div>' +
         '<div class="stat"><div class="stat-label">Forms Submitted</div><div class="stat-value">0</div></div>' +
         '</section>' +
         '<div class="timeline-content"><div class="timeline-wrapper"></div></div>' +
         '</aside>';
      
      document.body.appendChild(widget);
   }
trackActivity(){
   const pageName = window.location.pathname.split('/').pop();
   this.data.events.push({
        type: 'pageview',
        page: pageName,
        time: Date.now()
   });
    this.saveData();
}
 trackClick(buttonText) {  
        this.data.events.push({
            type: 'interaction',
            details: 'Clicked: ' + buttonText,
            time: Date.now()
        });
        this.saveData();
        this.updateDisplay();
    }

bindEvents(){
    const switchBtn = document.querySelector('.activity-tracker-button');
    if(switchBtn){
        switchBtn.addEventListener('click', () => {
          const timeline = document.querySelector('.activity-tracker-timeline');
            timeline.classList.toggle('expanded');//switch
         if (timeline.classList.contains('expanded')) {//check switch
                this.updateDisplay();
            }
        });
    }
    document.addEventListener('click',(e)=>{
        if(e.target.classList.contains('btn-primary')){
        const buttonText = e.target.textContent.trim();
        this.trackClick(buttonText);
        }
    },true);
    document.addEventListener('submit',(e)=>{
         this.data.events.push({
            type: 'form',
            details: 'Form submitted',
            time: Date.now()
        });
        this.saveData();
        this.updateDisplay();
    });
   
}
updateDisplay() {
    this.updateStats();
    this.updateTimeline();
}
updateStats() {
    let pv = 0, cl = 0, fm = 0;
    
    for (let i = 0; i < this.data.events.length; i++) {
        const type = this.data.events[i].type;
        if (type === 'pageview') pv++;//Increment the corresponding counter by 1 based on the event type.
        else if (type === 'interaction') cl++;
        else if (type === 'form') fm++;
    }
    
    const dur = Math.floor((Date.now() - this.data.startedAt) / 60000);//change to minute
    const s = document.querySelectorAll('.stat-value');
    
    s[0].textContent = dur + ' min';
    s[1].textContent = pv;
    s[2].textContent = cl;
    s[3].textContent = fm;
}

updateTimeline() {
    const w = document.querySelector('.timeline-wrapper');
    if (!w) return;
    
    w.innerHTML = '';//every time clear ensure the newest data
    
    [...this.data.events].reverse().forEach(e => {
        const item = document.createElement('div');
        item.className = 'timeline-item ' + e.type;
        
        let title, details;
        if (e.type === 'pageview') {
            title = 'Page View';
            details = 'Visited: ' + e.page;
        } else if (e.type === 'interaction') {
            title = 'Interaction';
            details = e.details;
        } else {
            title = 'Form Submission';
            details = e.details;
        }
        
        item.innerHTML = '<div class="time">' + this.formatTime(e.time) + '</div>' +
                         '<div class="event-title">' + title + '</div>' +
                         '<div class="event-details">' + details + '</div>';
        
        w.appendChild(item);
    });
}
}
document.addEventListener('DOMContentLoaded', () => {
    new ActivityTracker();
});// Initialize the ActivityTracker when the DOM is fully loaded

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActivityTracker;
} else {
    window.ActivityTracker = ActivityTracker;
}