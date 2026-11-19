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
const timeline = document.getElementById("timeline");
const todayDate = document.getElementById("today-date");

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
function timeToMinutes(time)
{
   const[hours,minutes] = time.split(":").map(Number);
   return hours * 60 + minutes;
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
            message.textContent = `This clashes with "{clash.title}".`;
            return;
    }
    addBlock(title,start,end,category);
    form.reset();
    message.textContent = "";
    });

//Drawing the actual timeline
function render()
{
    timeline.innerHTML = "";
    if (blocks.length === 0) 
    {
        timeline.innerHTML = '<p class = "empty">Nothing planned yet. Add your first block.</p>'
        return;
    }
    const sorted = [...blocks].sort(function(a, b)
    {
        return timeToMinutes(a.start) - timeToMinutes(b.start);
    });
    sorted.forEach(function (block)
    {
        const card = document.createElement("div");
        card.className = "block cat-" + block.category +  (block.done ? " done" : "");
        card.innerHTML = `<div class="block-info"><strong>${block.title}</strong><br><small>${block.start} - ${block.end}</small></div>
    <div class="block-actions">
    <button data-action="toggle" data-id="${block.id}">${block.done ? "Undo" : "Done"}</button>
    <button data-action="delete" data-id="${block.id}">X</button>
    </div>`;
        
        timeline.appendChild(card);
    });
}
timeline.addEventListener("click", function(event)
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
todayDate.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",day:"numeric",month:"long"
});
render();
