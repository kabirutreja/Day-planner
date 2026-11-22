// storing the data so if wont get lost
const STORAGE_KEY = "myDayBlocks";
const START_HOUR = 6; //calander start at 6 am
const END_HOUR = 24; // ends at 12 am
const HOUR_HEIGHT = 40; // EACH HOUR IS 40PX TALL
const SNAP = 15;
//DATA ACCUMULATION
let blocks = loadBlocks();
// collecting data stuff
const form = document.getElementById("block-form");
const titleInput = document.getElementById("title");
const startInput = document.getElementById("start");
const endInput = document.getElementById("end");
const categoryInput = document.getElementById("category");
const message = document.getElementById("message");
const hourLabels = document.getElementById("hour-labels");
const dayColumn = document.getElementById("day-column");
const todayDate = document.getElementById("today-date");
const upNext = document.getElementById("up-next");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
//red line
const nowLine = document.createElement("div");
const REMIND_MINUTES = 5; // warn befor what
const notifyButton = document.getElementById("notify-btn");
const reminderStatus = document.getElementById("reminder-status"); 
const notifiedIds = new Set();
nowLine.className = "now-line"
dayColumn.appendChild(nowLine);
const categoryTotals = document.getElementById("category-totals");


//loading the data to some block
function loadBlocks()
{
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) :[];

}
function saveBlocks()
{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

//blocks adjustment
//time math
function timeToMinutes(time)
{
   const[hours,minutes] = time.split(":").map(Number);
   return hours * 60 + minutes;
}
function minutesToTime(total)
{
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
}
function minutesToPixels(total)
{
    // for considering height
    return(total - START_HOUR * 60)/60 * HOUR_HEIGHT;
}
function pixelToMinutes(pixels)
{
    const minutesFromTop = pixels / HOUR_HEIGHT * 60;
    const snapped = Math.round(minutesFromTop / SNAP) * SNAP;
    return START_HOUR * 60 + snapped;
}
function findClash(start, end, ignoreId)
{
    const newStart = timeToMinutes(start);
    const newEnd = timeToMinutes(end);
    return blocks.find(function(b)
{
    return b.id !== ignoreId && newStart < timeToMinutes(b.end) && newEnd > timeToMinutes (b.start);
});
}
//minutes to hr, min
function formatMinutes(total)
{
    const hours = Math.floor(total/60);
    const minutes = total % 60;
    if (hours === 0) 
    {
       return minutes + "m";
           
    }
    return minutes ? hours + "h " + minutes + "m" : hours + "h";
}

function addBlock(title, start, end, category)
{
    blocks.push(
        {
            id: Date.now(),
            title: title,
            start: start,
            end: end,
            category: category,
            done: false

        }
    );
    saveBlocks();
    render();
}
function deleteBlock(id)
{
   
    blocks = blocks.filter(function(block)
    {
           return block.id !== id;
    });
    saveBlocks();
    render();
}
function toggleDone(id)
{
    const block = blocks.find(function(b)
    {
        return b.id === id;
    });

    if (block)
    {
        block.done = !block.done;
    }

    saveBlocks();
    render();
}
//submission form
     
     form.addEventListener("submit", function(event)
    {
        event.preventDefault();
        const title = titleInput.value.trim();
        const start = startInput.value;
        const end = endInput.value;
        const category = categoryInput.value;
        if (title === "") 
        {
            message.textContent = "Give the block some name(cool one)";
            return;
        }
        if (timeToMinutes(end) <= timeToMinutes(start)) 
        {
            message.textContent = "End time must be after start time.";
            return;
        }
        const clash = blocks.find(function(b)
    {
        return timeToMinutes(start) < timeToMinutes(b.end) && timeToMinutes(end) > timeToMinutes(b.start);

    });
    if (clash) 
        {
            message.textContent = `This clashes with "${clash.title}".`;
            return;
    }
    addBlock(title,start,end,category);
    form.reset();
    message.textContent = "";
    });
    //Draw the calendar
    function drawHourLabels()
    {
        const totalHeight = (END_HOUR-START_HOUR) * HOUR_HEIGHT;
        hourLabels.style.height = totalHeight + "px";
        dayColumn.style.height = totalHeight + "px";
        hourLabels.innerHTML = "";
        for (let hour = START_HOUR; hour < END_HOUR; hour++) {
            const label = document.createElement("div");
            label.className = "hour-label";
            label.style.height = HOUR_HEIGHT + "px";
            label.textContent = minutesToTime(hour * 60);
            hourLabels.appendChild(label);
            
        }
    }

//Drawing the actual timeline
function render()
{
    //get rid of old blocks, but keep drag thingy
    dayColumn.querySelectorAll(".event").forEach(function (el)
{
    el.remove();
});
blocks.forEach(function(block)
{
    const top = minutesToPixels(timeToMinutes(block.start));
    const height = minutesToPixels(timeToMinutes(block.end)) - top;
    const card = document.createElement("div");
    card.dataset.id = block.id;
    card.className = "event cat-" + block.category + (block.done ? " done" : "");
    card.style.top = top + "px";
    card.style.height = height + "px";
    card.innerHTML = `<strong>${block.title}</strong><small>${block.start} - ${block.end}</small>
    <div class="block-actions">
    <button data-action="toggle" data-id="${block.id}">${block.done ? "Undo" : "Done"}</button>
    <button data-action="delete" data-id="${block.id}">X</button>
    </div>
    <div class = "resize-handle"></div>`;
    dayColumn.appendChild(card);
});
updateLiveView();
}

//dragging
let dragStartY = null;
let preview = null;
let editing = null;

function getPickedRange(event)
{
    const rect = dayColumn.getBoundingClientRect();
    const currentY = event.clientY - rect.top;
    // keep the drag inside the calendar
    const topY = Math.max(0, Math.min(dragStartY, currentY));
    const bottomY = Math.min(dayColumn.offsetHeight, Math.max(dragStartY, currentY));
    let start = pixelToMinutes(topY);
    let end = pixelToMinutes(bottomY);

    // at least some minutes long
    if (end - start < SNAP) {
        end = start + SNAP;
    }

    return { start: start, end: end };
}
function updatePreview(event)
{
    const picked = getPickedRange(event);
    const top = minutesToPixels(picked.start);
    const bottom = minutesToPixels(picked.end);
    preview.style.top = top + "px";
    preview.style.height = (bottom - top) + "px";

}
function updateEditing(event)
{
   const deltaMinutes = Math.round((event.clientY - editing.startY)/HOUR_HEIGHT * 60/SNAP) * SNAP;
   const duration = editing.originalEnd - editing.originalStart;
   const dayStart = START_HOUR * 60;
   const dayEnd = END_HOUR * 60;
   if (editing.mode === "move") 
   {
   editing.newStart = Math.min(Math.max(editing.originalStart + deltaMinutes, dayStart), dayEnd - duration);
   editing.newEnd = editing.newStart + duration; 
   }
   else
   {
    editing.newStart = editing.originalStart;
    editing.newEnd = Math.min(Math.max(editing.originalEnd + deltaMinutes, editing.originalStart + SNAP),dayEnd);
    
   }
   editing.card.style.top = minutesToPixels(editing.newStart) + "px";
   editing.card.style.height = (minutesToPixels(editing.newEnd) - minutesToPixels(editing.newStart)) + "px";

}
function finishEditing()
{
    const block = editing.block;
    const newStart = minutesToTime(editing.newStart);
    const newEnd = minutesToTime(editing.newEnd);
    const clash = findClash(newStart, newEnd, block.id);
    editing = null;
    if (clash) 
    {
        message.textContent = `This would clash with "${clash.title}".`;
        render(); //old spot 
        return;
    }
    block.start = newStart;
    block.end = newEnd;
    message.textContent = "";
    saveBlocks();
    render();
}
dayColumn.addEventListener("pointerdown", function(event)
{
   if (event.target.closest("button")) 
    {
    return;
   }
   const card = event.target.closest(".event");
   if (card) 
   {
   const block = blocks.find(function(b)
{
    return b.id === Number(card.dataset.id);
}) ;
if (!block) 
    {
    return
    };
    editing = {
        block: block,
        card: card,
        mode: event.target.classList.contains("resize-handle")?"resize":"move",
        startY: event.clientY,
        originalStart: timeToMinutes(block.start),
        originalEnd: timeToMinutes(block.end),
        newStart: timeToMinutes(block.start),
        newEnd: timeToMinutes(block.end)

    };
    dayColumn.setPointerCapture(event.pointerId);
    return;
   }
   const rect = dayColumn.getBoundingClientRect();
   dragStartY = event.clientY - rect.top;
   preview = document.createElement("div");
   preview.className = "preview";
   dayColumn.appendChild(preview);
   dayColumn.setPointerCapture(event.pointerId);
   updatePreview(event);

});
dayColumn.addEventListener("pointermove", function(event)
{
    if (editing)
    {
        updateEditing(event);
        return;
    }

    if (dragStartY === null) return;
    updatePreview(event);
});
dayColumn.addEventListener("pointerup", function(event)
{
    if (editing)
    {
        finishEditing();
        return;
    }

    if (dragStartY === null) return;

    const picked = getPickedRange(event);
    dragStartY = null;
    preview.remove();
    preview = null;

    startInput.value = minutesToTime(picked.start);
    endInput.value = minutesToTime(picked.end);
    message.textContent = "";
    titleInput.focus();
});
//done and x buttons
    
    
dayColumn.addEventListener("click", function(event)
{
    const button = event.target.closest("button");
    if (!button) 
        {
        return;
    }
    const id = Number(button.dataset.id);
    if (button.dataset.action === "delete") 
        {
        deleteBlock(id);
    }
    else if(button.dataset.action === "toggle")
    {
        toggleDone(id);
    }
});
//live view
function getNowMinutes()
{
    const now = new Date();
    return now.getHours()*60 + now.getMinutes();
}
//red line to the current time, or hide it outside
function updateNowLine()
{
    const nowMinutes = getNowMinutes();
    if (nowMinutes < START_HOUR * 60 || nowMinutes >= END_HOUR *60) 
    {
           nowLine.style.display = "none";
           return;
           
    }
     nowLine.style.display = "block";
            nowLine.style.top = minutesToPixels(nowMinutes) + "px";
}
function updateUpNext()
{
    const nowMinutes = getNowMinutes();
    // w on copy
    const sorted = [...blocks].sort(function(a,b)
{
    return timeToMinutes(a.start) - timeToMinutes(b.start);
});
//exact block time
const current = sorted.find(function(b)
{
    return timeToMinutes(b.start) <= nowMinutes && nowMinutes < timeToMinutes(b.end);
});
// block not started
const next = sorted.find(function(b)
{
    return timeToMinutes(b.start) > nowMinutes;
});
let html = "";
if (current) 
{
 html += `<p class="up-label">Now</p><strong>${current.title}</strong><small>until ${current.end}</small>`;    
}
else
{
    html += `<p class="up-label">Free right now</p>`;
}
if (next) 
{
const minutesLeft = timeToMinutes(next.start) - nowMinutes;
html += `<p class="up-label next-label">Up next: ${next.title} in ${minutesLeft} min</p>`;    
}
upNext.innerHTML = html;
}
function updateProgress()
{
    const total = blocks.length;
    const doneCount = blocks.filter(function(b)
{
    return b.done;
}).length;
      const percent = total === 0 ? 0 : Math.round(doneCount/total*100);
      progressText.textContent = doneCount + " of " + total + " blocks done";
      progressFill.style.width = percent + "%";
}
function updateTotals()
{
    const totals = {};
    blocks.forEach(function(block)
{
    const minutes = timeToMinutes(block.end) - timeToMinutes(block.start);
    totals[block.category] = (totals[block.category] || 0) + minutes; 
});
const parts = Object.keys(totals).map(function(category)
{
  //show the option text
  const option = categoryInput.querySelector(`option[value="${category}"]`);
  const label = option ? option.textContent : category;
  return `<span>${label}: ${formatMinutes(totals[category])}</span>`;
});
categoryTotals.innerHTML = parts.join("");
}
function updateLiveView()
{
    updateNowLine();
    updateUpNext();
    updateProgress();
    checkReminders();
    updateTotals();
}
//start up
todayDate.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",day:"numeric",month:"long"
});
updateReminderStatus();
drawHourLabels();
render();
//update lessay 60 secs
setInterval(updateLiveView,60000);
//reminders
function reminderSupported()
{
    return "Notification" in window;
}
function updateReminderStatus()
{
    if(!reminderSupported())
    {
        reminderStatus.textContent = "Reminders aren't supported in the browser.";
        notifyButton.style.display = "none";
        return;
    }
    if (Notification.permission === "granted") 
    {
       reminderStatus.textContent = "Reminders are on.";
       notifyButton.style.display = "none"; 
    }
    else if (Notification.permission === "denied") 
    {
    reminderStatus.textContent = "Reminders are blocked. Please allow in settings.";   
    notifyButton.style.display = "none"; 
    }
    else
    {
        reminderStatus.textContent = "";
        notifyButton.style.display = "inline-block";
    }
}
notifyButton.addEventListener("click", function()
{
    Notification.requestPermission().then(updateReminderStatus);
});
//on screen wale notification(showing)
function showReminder(block)
{
    //This block is copied from chatgpt coZ I was clueless on how to show it on screen
    //{
    try
    {
        const note = new Notification("Time to start: " + block.title, {
              body: block.start + " - " + block.end
        });
        note.onclick = function()
        {
            window.focus();
            note.close();
        };

    }
    //}
    catch(error)
    {
        console.log("Reminder could not show:" + error);
    }
}
function checkReminders()
{
    if (!reminderSupported() || Notification.permission !== "granted") 
    {
      return;  
    }
    const nowMinutes = getNowMinutes();
    blocks.forEach(function(block)
{
    if(block.done || notifiedIds.has(block.id))
    {
        return;
    }
    const minutesLeft = timeToMinutes(block.start) - nowMinutes;
    //actual not
    if (minutesLeft >= 0 && minutesLeft <= REMIND_MINUTES) 
    {
    showReminder(block);
    notifiedIds.add(block.id);    
    }
})
}

